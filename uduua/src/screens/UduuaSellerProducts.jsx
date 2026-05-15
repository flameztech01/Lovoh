// screens/UduuaSellerProducts.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaSearch,
  FaTimes,
  FaBox,
  FaTag,
  FaSpinner,
  FaStore,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaDollarSign,
} from 'react-icons/fa';
import { useGetSellerProductsQuery, useDeleteProductMutation } from '../slices/productApiSlice';
import { toast } from 'react-toastify';
import ShopNavbar from '../components/ShopNavbar';
import UduuaFooter from '../components/UduuaFooter';

const UduuaSellerProducts = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, pending
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [productToDelete, setProductToDelete] = useState(null);
  const itemsPerPage = 10;

  const { data: productsData, isLoading, refetch } = useGetSellerProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products = productsData?.products || [];
  const totalPages = productsData?.pages || 1;
  const totalProducts = productsData?.total || 0;

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦0";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProductStatusBadge = (product) => {
    if (!product.isApproved) {
      return { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700', icon: FaClock };
    }
    if (product.isSoldOut || product.quantityAvailable === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: FaTimesCircle };
    }
    if (product.quantityAvailable < 10) {
      return { label: 'Low Stock', color: 'bg-orange-100 text-orange-700', icon: FaTimesCircle };
    }
    return { label: 'Active', color: 'bg-green-100 text-green-700', icon: FaCheckCircle };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "New": return { bg: "bg-green-100 text-green-700", label: "New" };
      case "Trending": return { bg: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700", label: "Trending" };
      case "Bulk Available": return { bg: "bg-blue-100 text-blue-700", label: "Bulk" };
      case "Shoppers Favourite": return { bg: "bg-purple-100 text-purple-700", label: "Favourite" };
      case "Limited": return { bg: "bg-yellow-100 text-yellow-700", label: "Limited" };
      case "Featured": return { bg: "bg-pink-100 text-pink-700", label: "Featured" };
      default: return { bg: "bg-gray-100 text-gray-700", label: status || "New" };
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete._id).unwrap();
      toast.success(`${productToDelete.name} deleted successfully`);
      setProductToDelete(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete product');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Filter products by search term
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    return product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'price_asc':
        return (a.retailPrice || 0) - (b.retailPrice || 0);
      case 'price_desc':
        return (b.retailPrice || 0) - (a.retailPrice || 0);
      case 'popular':
        return (b.quantitySold || 0) - (a.quantitySold || 0);
      case 'name_asc':
        return (a.name || '').localeCompare(b.name || '');
      default:
        return 0;
    }
  });

  // Pagination for filtered products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  const filteredTotalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  if (isLoading && products.length === 0) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your products...</p>
          </div>
        </div>
        <UduuaFooter />
      </>
    );
  }

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  My Products
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Manage all your products in one place
                </p>
              </div>
              <Link
                to="/seller/add-product"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0043FC] hover:bg-[#0038D4] text-white rounded-lg font-medium transition-all duration-300"
              >
                <FaPlus className="text-sm" />
                Add New Product
              </Link>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.isApproved).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter(p => !p.isApproved).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Total Sold</p>
              <p className="text-2xl font-bold text-[#0043FC]">
                {products.reduce((sum, p) => sum + (p.quantitySold || 0), 0)}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search by name or brand..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              >
                <option value="all">All Products</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="name_asc">Name A-Z</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all') && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="hover:text-blue-600">
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                    {statusFilter === 'approved' ? 'Approved' : 'Pending'}
                    <button onClick={() => setStatusFilter('all')} className="hover:text-blue-600">
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Products Table */}
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaBox className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t added any products yet'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  to="/seller/add-product"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0043FC] hover:bg-[#0038D4] text-white rounded-lg font-medium transition-all duration-300"
                >
                  <FaPlus className="text-sm" />
                  Add Your First Product
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sold</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Approval</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedProducts.map((product) => {
                        const statusBadge = getProductStatusBadge(product);
                        const productStatus = getStatusBadge(product.status);
                        const StatusIcon = statusBadge.icon;
                        
                        return (
                          <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                  {product.images && product.images[0] ? (
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <FaImage className="text-gray-400 text-lg" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <FaStore className="text-[10px]" />
                                    {product.brandName || '—'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-900">{formatPrice(product.retailPrice)}</span>
                              {product.bulkPrice && (
                                <p className="text-xs text-gray-500">Bulk: {formatPrice(product.bulkPrice)}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm ${product.quantityAvailable < 10 ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                                {product.quantityAvailable}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-700">{product.quantitySold || 0}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${productStatus.bg}`}>
                                {productStatus.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                <StatusIcon className="text-xs" />
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-gray-500">{formatDate(product.createdAt)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/shop/product/${product._id}`}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View"
                                >
                                  <FaEye className="text-sm" />
                                </Link>
                                <Link
                                  to={`/seller/edit-product/${product._id}`}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <FaEdit className="text-sm" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteClick(product)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <FaTrashAlt className="text-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedProducts.map((product) => {
                  const statusBadge = getProductStatusBadge(product);
                  const productStatus = getStatusBadge(product.status);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <FaImage className="text-gray-400 text-xl" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <FaStore className="text-[10px]" />
                                {product.brandName || '—'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#0043FC] text-sm">{formatPrice(product.retailPrice)}</p>
                              {product.bulkPrice && (
                                <p className="text-xs text-gray-500">Bulk: {formatPrice(product.bulkPrice)}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${productStatus.bg}`}>
                              {productStatus.label}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                              <StatusIcon className="text-[10px]" />
                              {statusBadge.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3 text-xs">
                            <div>
                              <span className="text-gray-500">Stock:</span>
                              <span className={`ml-1 ${product.quantityAvailable < 10 ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                                {product.quantityAvailable} units
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Sold:</span>
                              <span className="ml-1 text-gray-700">{product.quantitySold || 0}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                            <Link
                              to={`/shop/product/${product._id}`}
                              className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium text-center hover:bg-blue-100 transition-colors"
                            >
                              View
                            </Link>
                            <Link
                              to={`/seller/edit-product/${product._id}`}
                              className="flex-1 py-1.5 bg-green-50 text-green-600 rounded-md text-xs font-medium text-center hover:bg-green-100 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="flex-1 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-medium text-center hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {filteredTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {filteredTotalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, filteredTotalPages))}
                    disabled={currentPage === filteredTotalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}

              {/* Results Count */}
              <div className="mt-4 text-center text-xs text-gray-500">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrashAlt className="text-xl text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-sm text-gray-500 mb-5">
                Are you sure you want to delete "{productToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrashAlt className="text-sm" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <UduuaFooter />
    </>
  );
};

export default UduuaSellerProducts;