// screens/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaSearch,
  FaTimes,
  FaBox,
  FaTag,
  FaDollarSign,
  FaArchive,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaStore,
  FaChartLine,
  FaStar,
  FaUserCheck,
  FaClock,
  FaSpinner
} from 'react-icons/fa';
import {
  useGetAllProductsAdminQuery,
  useGetPendingProductsQuery,
  useApproveProductMutation,
  useRejectProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery
} from '../slices/productApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all'); // all, approved, pending
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToApprove, setProductToApprove] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved
  const itemsPerPage = 10;

  // Fetch data - using admin endpoints
  const { data: allProductsData, isLoading: isLoadingAll, refetch: refetchAll } = useGetAllProductsAdminQuery({
    page: currentPage,
    limit: itemsPerPage * 3,
    isApproved: approvalFilter === 'approved' ? true : approvalFilter === 'pending' ? false : undefined
  });
  
  const { data: pendingProductsData, refetch: refetchPending } = useGetPendingProductsQuery({
    page: 1,
    limit: 20
  });
  
  const { data: categoriesData } = useGetCategoriesQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [approveProduct] = useApproveProductMutation();
  const [rejectProduct] = useRejectProductMutation();

  // Combine products based on active tab
  let products = [];
  if (activeTab === 'all') {
    products = allProductsData?.products || [];
  } else if (activeTab === 'pending') {
    products = pendingProductsData?.products || [];
  }

  const categories = categoriesData || [];

  // Product status options
  const productStatusOptions = ['New', 'Trending', 'Bulk Available', 'Shoppers Favourite', 'Limited', 'Featured'];

  // Get status badge styling
  const getProductStatusBadge = (status) => {
    switch (status) {
      case "New": return { bg: "bg-green-100 text-green-700", label: "New" };
      case "Trending": return { bg: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700", label: "Trending" };
      case "Bulk Available": return { bg: "bg-blue-100 text-blue-700", label: "Bulk Available" };
      case "Shoppers Favourite": return { bg: "bg-purple-100 text-purple-700", label: "Shoppers Favourite" };
      case "Limited": return { bg: "bg-yellow-100 text-yellow-700", label: "Limited" };
      case "Featured": return { bg: "bg-pink-100 text-pink-700", label: "Featured" };
      default: return { bg: "bg-gray-100 text-gray-700", label: status || "New" };
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    
    const matchesProductStatus = productStatusFilter === '' || product.status === productStatusFilter;
    
    let matchesAvailability = true;
    if (statusFilter === 'available') {
      matchesAvailability = product.isAvailable && !product.isSoldOut && product.quantityAvailable > 0;
    } else if (statusFilter === 'unavailable') {
      matchesAvailability = !product.isAvailable || product.isSoldOut || product.quantityAvailable === 0;
    } else if (statusFilter === 'lowstock') {
      matchesAvailability = product.quantityAvailable > 0 && product.quantityAvailable < 10;
    } else if (statusFilter === 'outofstock') {
      matchesAvailability = product.quantityAvailable === 0 || product.isSoldOut;
    }
    
    return matchesSearch && matchesCategory && matchesProductStatus && matchesAvailability;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aVal, bVal;
    switch(sortBy) {
      case 'name':
        aVal = a.name || '';
        bVal = b.name || '';
        break;
      case 'brandName':
        aVal = a.brandName || '';
        bVal = b.brandName || '';
        break;
      case 'retailPrice':
        aVal = a.retailPrice || 0;
        bVal = b.retailPrice || 0;
        break;
      case 'bulkPrice':
        aVal = a.bulkPrice || 0;
        bVal = b.bulkPrice || 0;
        break;
      case 'quantity':
        aVal = a.quantityAvailable || 0;
        bVal = b.quantityAvailable || 0;
        break;
      case 'rating':
        aVal = a.rating || 0;
        bVal = b.rating || 0;
        break;
      case 'createdAt':
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
        break;
      default:
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, statusFilter, productStatusFilter, sortBy, sortOrder, activeTab]);

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
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateSavings = (product) => {
    const retail = product.retailPrice || 0;
    const bulk = product.bulkPrice || 0;
    if (retail && bulk && retail > bulk) {
      return Math.round(((retail - bulk) / retail) * 100);
    }
    return 0;
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
      refetchAll();
      refetchPending();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete product');
    }
  };

  const handleApprove = async (product) => {
    try {
      await approveProduct(product._id).unwrap();
      toast.success(`${product.name} approved and will appear on the marketplace`);
      refetchAll();
      refetchPending();
      setProductToApprove(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to approve product');
    }
  };

  const handleReject = async () => {
    if (!productToApprove) return;
    
    try {
      await rejectProduct({ id: productToApprove._id, reason: rejectReason }).unwrap();
      toast.success(`${productToApprove.name} rejected`);
      setShowRejectModal(false);
      setProductToApprove(null);
      setRejectReason('');
      refetchAll();
      refetchPending();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to reject product');
    }
  };

  const getAvailabilityBadge = (product) => {
    if (product.isSoldOut || product.quantityAvailable === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: FaTimesCircle };
    }
    if (product.quantityAvailable < 10) {
      return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700', icon: FaExclamationTriangle };
    }
    if (product.isAvailable) {
      return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700', icon: FaCheckCircle };
    }
    return { label: 'Unavailable', color: 'bg-gray-100 text-gray-700', icon: FaArchive };
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setStatusFilter('all');
    setProductStatusFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  // Navigate to product detail page
  const handleViewDetails = (productId) => {
    navigate(`/admin/products/${productId}`);
  };

  const isLoading = activeTab === 'all' ? isLoadingAll : false;

  return (
    <AdminSidebar>
      <div className="px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all products from sellers</p>
          </div>
          <div className="flex gap-3">
            {/* Tab Buttons */}
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#0043FC] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              <FaClock className="text-xs" />
              Pending Approval
              {pendingProductsData?.products?.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white text-yellow-600 rounded-full text-xs">
                  {pendingProductsData.products.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search by name or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC]"
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

            {/* Category Filter - Desktop */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="hidden md:block px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Product Status Filter - Desktop */}
            <select
              value={productStatusFilter}
              onChange={(e) => setProductStatusFilter(e.target.value)}
              className="hidden md:block px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC]"
            >
              <option value="">All Product Status</option>
              {productStatusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {/* Availability Filter - Desktop */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hidden md:block px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC]"
            >
              <option value="all">All Availability</option>
              <option value="available">In Stock</option>
              <option value="lowstock">Low Stock</option>
              <option value="outofstock">Out of Stock</option>
              <option value="unavailable">Unavailable</option>
            </select>

            {/* Sort By */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC]"
              >
                <option value="createdAt">Date</option>
                <option value="name">Name</option>
                <option value="brandName">Brand</option>
                <option value="retailPrice">Retail Price</option>
                <option value="bulkPrice">Bulk Price</option>
                <option value="quantity">Stock</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'desc' ? <FaSortAmountDown className="text-sm" /> : <FaSortAmountUp className="text-sm" />}
              </button>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <FaFilter className="text-sm" />
              Filters
              <FaChevronDown className={`text-xs transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-100 space-y-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC]"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={productStatusFilter}
                onChange={(e) => setProductStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC]"
              >
                <option value="">All Product Status</option>
                {productStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC]"
              >
                <option value="all">All Availability</option>
                <option value="available">In Stock</option>
                <option value="lowstock">Low Stock</option>
                <option value="outofstock">Out of Stock</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          )}

          {/* Active Filters */}
          {(searchTerm || selectedCategory || statusFilter !== 'all' || productStatusFilter) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Active:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#0043FC]/10 text-[#0043FC] rounded-md text-xs">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-[#0033cc]">
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#0043FC]/10 text-[#0043FC] rounded-md text-xs">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('')} className="hover:text-[#0033cc]">
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              )}
              {productStatusFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#0043FC]/10 text-[#0043FC] rounded-md text-xs">
                  Status: {productStatusFilter}
                  <button onClick={() => setProductStatusFilter('')} className="hover:text-[#0033cc]">
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#0043FC]/10 text-[#0043FC] rounded-md text-xs">
                  {statusFilter === 'available' ? 'In Stock' : 
                   statusFilter === 'lowstock' ? 'Low Stock' :
                   statusFilter === 'outofstock' ? 'Out of Stock' : 'Unavailable'}
                  <button onClick={() => setStatusFilter('all')} className="hover:text-[#0033cc]">
                    <FaTimes className="w-3 h-3" />
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="w-10 h-10 text-[#0043FC] animate-spin" />
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FaBox className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No products found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-[#0043FC] border border-[#0043FC] rounded-lg hover:bg-[#0043FC] hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Seller</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Retail Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bulk Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Approval</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedProducts.map((product) => {
                      const availability = getAvailabilityBadge(product);
                      const AvailabilityIcon = availability.icon;
                      const productStatus = getProductStatusBadge(product.status);
                      const savings = calculateSavings(product);
                      const isPending = !product.isApproved;
                      
                      return (
                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                {product.images && product.images[0] ? (
                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <FaImage className="text-gray-400 text-sm" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                                <p className="text-xs text-gray-400">{formatDate(product.createdAt)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FaStore className="text-gray-400 text-xs" />
                              <span className="text-sm text-gray-700">{product.seller?.businessName || product.brandName || '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs">
                              <FaTag className="text-gray-400 text-xs" />
                              {product.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900 text-sm">
                              {formatPrice(product.retailPrice)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className="font-semibold text-[#0043FC] text-sm">
                                {formatPrice(product.bulkPrice)}
                              </span>
                              {savings > 0 && (
                                <span className="block text-xs text-green-600">
                                  Save {savings}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${product.quantityAvailable < 10 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                {product.quantityAvailable}
                              </span>
                              <span className="text-xs text-gray-400">units</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                <FaClock className="text-xs" />
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <FaCheckCircle className="text-xs" />
                                Approved
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${productStatus.bg}`}>
                                {productStatus.label}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${availability.color} ml-1`}>
                                <AvailabilityIcon className="text-xs" />
                                {availability.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleViewDetails(product._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FaEye className="text-sm" />
                              </button>
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => setProductToApprove(product)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Approve"
                                  >
                                    <FaCheckCircle className="text-sm" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setProductToApprove(product);
                                      setShowRejectModal(true);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject"
                                  >
                                    <FaTimesCircle className="text-sm" />
                                  </button>
                                </>
                              )}
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
            <div className="md:hidden space-y-3">
              {paginatedProducts.map((product) => {
                const availability = getAvailabilityBadge(product);
                const AvailabilityIcon = availability.icon;
                const productStatus = getProductStatusBadge(product.status);
                const savings = calculateSavings(product);
                const isPending = !product.isApproved;
                
                return (
                  <div
                    key={product._id}
                    onClick={() => handleViewDetails(product._id)}
                    className="bg-white rounded-xl border border-gray-200 p-4 active:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <FaImage className="text-gray-400 text-xl" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <FaStore className="text-gray-400" />
                              {product.seller?.businessName || product.brandName || '—'}
                            </p>
                          </div>
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium shrink-0">
                              <FaClock className="text-xs" />
                              Pending
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${productStatus.bg} shrink-0`}>
                              {productStatus.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base font-bold text-[#0043FC]">{formatPrice(product.retailPrice)}</span>
                          <span className="text-xs text-gray-400">Retail</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-700">{formatPrice(product.bulkPrice)}</span>
                          <span className="text-xs text-gray-400">Bulk</span>
                          {savings > 0 && (
                            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Save {savings}%</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Stock: <span className={product.quantityAvailable < 10 ? 'text-red-600 font-medium' : 'text-gray-700'}>{product.quantityAvailable} units</span>
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${availability.color}`}>
                            <AvailabilityIcon className="text-xs" />
                            {availability.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="text-sm" />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#0043FC] text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-[#0043FC] hover:text-[#0043FC]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight className="text-sm" />
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="mt-4 text-center text-xs text-gray-400">
              Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </div>
          </>
        )}
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
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {productToApprove && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-xl text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Approve Product</h3>
              <p className="text-sm text-gray-500 mb-5">
                Are you sure you want to approve "{productToApprove.name}"? This product will become visible on the marketplace.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProductToApprove(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(productToApprove)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && productToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTimesCircle className="text-xl text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Product</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please provide a reason for rejecting "{productToApprove.name}"
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] mb-4"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setProductToApprove(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

export default AdminProducts;