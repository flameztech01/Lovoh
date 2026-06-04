// src/adminScreens/AdminProducts.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
  FaStore,
  FaClock,
  FaTag,
  FaFilter,
  FaStar,
  FaDollarSign,
  FaBox,
  FaImage,
} from 'react-icons/fa';
import { useGetAllProductsAdminQuery, useApproveProductMutation, useRejectProductMutation } from '../slices/productApiSlice.js';
import { toast } from 'react-toastify';

// Helper function to normalize product data
const normalizeProduct = (product) => {
  // Normalize category (handle string or array)
  let categories = product.category || [];
  if (typeof categories === 'string') {
    categories = categories.split(',').map(c => c.trim()).filter(c => c);
  }
  if (!Array.isArray(categories)) {
    categories = [];
  }

  // Normalize tags (handle string or array)
  let tags = product.tags || [];
  if (typeof tags === 'string') {
    tags = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
  }
  if (!Array.isArray(tags)) {
    tags = [];
  }

  return {
    ...product,
    category: categories,
    tags: tags,
  };
};

const AdminProducts = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, isLoading, refetch } = useGetAllProductsAdminQuery({ 
    page, 
    limit: 20,
    isApproved: filter === 'approved' ? true : filter === 'pending' ? false : undefined
  });
  
  const [approveProduct, { isLoading: isApproving }] = useApproveProductMutation();
  const [rejectProduct, { isLoading: isRejecting }] = useRejectProductMutation();

  const handleApprove = async (productId) => {
    try {
      await approveProduct(productId).unwrap();
      toast.success('Product approved successfully');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to approve product');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await rejectProduct({ id: selectedProduct._id, reason: rejectReason }).unwrap();
      toast.success('Product rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to reject product');
    }
  };

  // Normalize products data
  const products = (data?.products || []).map(normalizeProduct);
  
  // Filter products by search term
  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingCount = products.filter(p => !p.isApproved).length;
  const approvedCount = products.filter(p => p.isApproved).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#0043FC] mx-auto mb-4" />
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <p className="text-sm text-gray-500">Review and manage all products on the marketplace</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaBox className="text-blue-600" />
            </div>
          </div>
        </div>
        <div 
          onClick={() => setFilter('pending')}
          className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all ${
            filter === 'pending' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FaClock className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div 
          onClick={() => setFilter('approved')}
          className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all ${
            filter === 'approved' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved Products</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, brand, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-[#0043FC] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Product Image */}
                <div className="lg:w-32">
                  <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-32 lg:h-24 object-cover rounded-lg"
                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                  />
                  {product.images?.length > 1 && (
                    <div className="flex items-center gap-1 mt-1">
                      <FaImage className="text-xs text-gray-400" />
                      <span className="text-xs text-gray-400">{product.images.length} images</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <FaStore className="text-gray-400 text-xs" />
                        <span className="text-sm text-gray-600">{product.seller?.businessName || product.seller?.name || 'Unknown Seller'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.status && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          {product.status}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                        product.isApproved 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {product.isApproved ? <FaCheckCircle className="text-xs" /> : <FaClock className="text-xs" />}
                        {product.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-gray-400">Retail Price</p>
                      <p className="text-sm font-semibold text-gray-900">₦{product.retailPrice?.toLocaleString()}</p>
                    </div>
                    {product.bulkPrice > 0 && (
                      <div>
                        <p className="text-xs text-gray-400">Bulk Price (2+)</p>
                        <p className="text-sm font-semibold text-gray-900">₦{product.bulkPrice?.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-400">Quantity</p>
                      <p className="text-sm text-gray-700">{product.quantityAvailable} units</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Sold</p>
                      <p className="text-sm text-gray-700">{product.quantitySold || 0} units</p>
                    </div>
                  </div>

                  {/* Categories - Safe to use map now */}
                  {product.category && product.category.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">Categories</p>
                      <div className="flex flex-wrap gap-1">
                        {product.category.map((cat, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags - Safe to use map now */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 5).map((tag, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                            #{tag}
                          </span>
                        ))}
                        {product.tags.length > 5 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                            +{product.tags.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                    <Link
                      to={`/shop/product/${product._id}`}
                      target="_blank"
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#0043FC] border border-gray-200 rounded-lg hover:border-[#0043FC] transition-colors flex items-center gap-1"
                    >
                      <FaEye className="text-xs" /> View Product
                    </Link>
                    
                    {!product.isApproved && (
                      <>
                        <button
                          onClick={() => handleApprove(product._id)}
                          disabled={isApproving}
                          className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {isApproving ? <FaSpinner className="animate-spin text-xs" /> : <FaCheckCircle className="text-xs" />}
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowRejectModal(true);
                          }}
                          disabled={isRejecting}
                          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <FaTimesCircle className="text-xs" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            {searchTerm ? (
              <>
                <FaSearch className="text-gray-300 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">No products matching "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-[#0043FC] hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : filter === 'pending' ? (
              <>
                <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">No pending products to review</p>
                <p className="text-sm text-gray-400">All products have been reviewed</p>
              </>
            ) : (
              <>
                <FaBox className="text-gray-300 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">No products found</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {page} of {data?.pages || 1}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data?.pages || 1, p + 1))}
            disabled={page === data?.pages}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FaTimesCircle className="text-red-500 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reject Product</h2>
                <p className="text-sm text-gray-500">{selectedProduct.name}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              Please provide a reason for rejecting this product. This will be shared with the seller.
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0043FC] mb-4"
              placeholder="Enter rejection reason (e.g., Poor image quality, Missing information, Prohibited item...)"
              autoFocus
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedProduct(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRejecting ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                Reject Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;