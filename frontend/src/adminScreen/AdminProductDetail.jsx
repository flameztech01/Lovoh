// screens/AdminProductDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEdit,
  FaTrashAlt,
  FaBox,
  FaTag,
  FaDollarSign,
  FaStore,
  FaStar,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaImage,
  FaSpinner,
  FaLayerGroup,
  FaUser,
  FaThumbsUp,
  FaThumbsDown,
  FaShoppingBag,
  FaEye,
  FaClock,
  FaUserCheck,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import {
  useGetProductByIdQuery,
  useDeleteProductMutation,
  useGetProductReviewsQuery,
  useApproveProductMutation,
  useRejectProductMutation
} from '../slices/productApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';
import { format } from 'date-fns';

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const { data: product, isLoading, error, refetch } = useGetProductByIdQuery(id);
  const { data: reviewsData } = useGetProductReviewsQuery({ id, limit: 10, sort: 'newest' });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [approveProduct, { isLoading: isApproving }] = useApproveProductMutation();
  const [rejectProduct, { isLoading: isRejecting }] = useRejectProductMutation();
  
  const reviews = reviewsData?.reviews || [];
  const ratingDistribution = reviewsData?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

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

  const getAvailabilityBadge = (product) => {
    if (product?.isSoldOut || product?.quantityAvailable === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: FaTimesCircle };
    }
    if (product?.quantityAvailable < 10) {
      return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700', icon: FaExclamationTriangle };
    }
    if (product?.isAvailable) {
      return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700', icon: FaCheckCircle };
    }
    return { label: 'Unavailable', color: 'bg-gray-100 text-gray-700', icon: FaTimesCircle };
  };

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
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy h:mm a');
  };

  const calculateSavings = (product) => {
    const retail = product?.retailPrice || 0;
    const bulk = product?.bulkPrice || 0;
    if (retail && bulk && retail > bulk) {
      return Math.round(((retail - bulk) / retail) * 100);
    }
    return 0;
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={`text-xs ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(id).unwrap();
      toast.success('Product deleted successfully');
      navigate('/admin/products');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete product');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveProduct(id).unwrap();
      toast.success('Product approved and will appear on marketplace');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to approve product');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectProduct({ id, reason: rejectReason }).unwrap();
      toast.success('Product rejected');
      setShowRejectModal(false);
      setRejectReason('');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to reject product');
    }
  };

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="text-4xl text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading product details...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  if (error || !product) {
    return (
      <AdminSidebar>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <FaBox className="text-5xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0033cc] transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  const productStatus = getProductStatusBadge(product.status);
  const availability = getAvailabilityBadge(product);
  const AvailabilityIcon = availability.icon;
  const savings = calculateSavings(product);
  const averageRating = product.rating || 0;
  const totalReviews = product.numReviews || 0;
  const isPending = !product.isApproved;

  return (
    <AdminSidebar>
      <div className="px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#0043FC] mb-3 transition-colors group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Products</span>
          </button>
          
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <FaStore className="text-gray-400" />
                  {product.brandName || '—'}
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <FaTag className="text-gray-400" />
                  {product.category || 'Uncategorized'}
                </span>
                <span className="text-gray-300">|</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${productStatus.bg}`}>
                  {productStatus.label}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${availability.color}`}>
                  <AvailabilityIcon className="text-xs" />
                  {availability.label}
                </span>
                {isPending && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <FaClock className="text-xs" />
                    Pending Approval
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isPending && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    {isApproving ? <FaSpinner className="animate-spin text-sm" /> : <FaCheckCircle className="text-sm" />}
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isRejecting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <FaTimesCircle className="text-sm" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => navigate(`/admin/products/edit/${id}`)}
                className="px-4 py-2 bg-[#0043FC] text-white rounded-lg text-sm font-medium hover:bg-[#0033cc] transition-colors flex items-center gap-2"
              >
                <FaEdit className="text-sm" />
                Edit Product
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <FaTrashAlt className="text-sm" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Images & Basic Info */}
          <div className="lg:col-span-1 space-y-5">
            {/* Product Images */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="aspect-square relative bg-gray-50">
                {product.images && product.images[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaImage className="text-4xl text-gray-300" />
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="p-3 flex gap-2 overflow-x-auto">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImage === idx ? 'border-[#0043FC]' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Product ID</span>
                  <span className="text-sm font-mono text-gray-700">{product._id?.slice(-12)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm text-gray-700">{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm text-gray-700">{formatDate(product.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Views</span>
                  <span className="text-sm text-gray-700 flex items-center gap-1">
                    <FaEye className="text-gray-400 text-xs" />
                    {product.views || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Pricing & Stock */}
          <div className="lg:col-span-1 space-y-5">
            {/* Seller Information */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FaUserCheck className="text-[#0043FC] text-sm" />
                  Seller Information
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#0043FC]/10 flex items-center justify-center">
                    <FaStore className="text-[#0043FC] text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{product.seller?.businessName || product.brandName || '—'}</p>
                    <p className="text-xs text-gray-500">Seller since {formatDate(product.seller?.createdAt)}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  {product.seller?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaEnvelope className="text-gray-400 text-xs" />
                      <span className="text-gray-600">{product.seller.email}</span>
                    </div>
                  )}
                  {product.seller?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaPhone className="text-gray-400 text-xs" />
                      <span className="text-gray-600">{product.seller.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FaDollarSign className="text-[#0043FC] text-sm" />
                  Pricing
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Retail Price</span>
                  <span className="text-2xl font-bold text-[#0043FC]">
                    {formatPrice(product.retailPrice)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Bulk Price</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {formatPrice(product.bulkPrice)}
                  </span>
                </div>
                
                {savings > 0 && (
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Bulk Savings</span>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                      <FaChartLine className="text-xs" />
                      Save {savings}%
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Min Order Amount</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(product.minOrderAmount || 60000)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FaBox className="text-[#0043FC] text-sm" />
                  Stock Information
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Available</p>
                    <p className={`text-xl font-bold ${product.quantityAvailable < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.quantityAvailable || 0}
                    </p>
                    <p className="text-xs text-gray-400">units</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Sold</p>
                    <p className="text-xl font-bold text-gray-900">
                      {product.quantitySold || 0}
                    </p>
                    <p className="text-xs text-gray-400">units</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-500">Available for Sale</span>
                  {product.isAvailable && !product.isSoldOut ? (
                    <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">Yes</span>
                  ) : (
                    <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">No</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bulk Pricing Tiers */}
            {product.bulkPricing && product.bulkPricing.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaLayerGroup className="text-[#0043FC] text-sm" />
                    Bulk Pricing Tiers
                  </h2>
                </div>
                <div className="p-5">
                  <div className="space-y-2">
                    {product.bulkPricing.map((tier, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{tier.minQuantity}+ units</span>
                        <span className="text-sm font-semibold text-[#0043FC]">{formatPrice(tier.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Description & Rating */}
          <div className="lg:col-span-1 space-y-5">
            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900">Description</h2>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FaStar className="text-[#0043FC] text-sm" />
                  Rating Summary
                </h2>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      {renderStars(averageRating)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{totalReviews} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-6">{star} ★</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="w-6 text-gray-500">{ratingDistribution[star] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <FaUser className="text-[#0043FC] text-sm" />
              Recent Reviews ({totalReviews})
            </h2>
          </div>
          
          <div className="p-5">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <FaStar className="text-3xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review._id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0043FC]/10 flex items-center justify-center text-[#0043FC] font-bold flex-shrink-0">
                        {review.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">{review.name}</span>
                          {review.isVerifiedPurchase && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs text-gray-400">
                            <FaCalendarAlt className="inline mr-1 text-[10px]" />
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <h5 className="font-medium text-gray-900 text-sm mb-1">{review.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                        
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-2">
                            {review.images.map((img, idx) => (
                              <img key={idx} src={img} alt="Review" className="w-12 h-12 object-cover rounded-md" />
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FaThumbsUp className="text-[10px]" />
                            {review.helpful?.length || 0} helpful
                          </span>
                          <span className="flex items-center gap-1">
                            <FaThumbsDown className="text-[10px]" />
                            {review.notHelpful?.length || 0} not helpful
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {totalReviews > 5 && (
              <div className="mt-4 text-center">
                <button className="text-sm text-[#0043FC] hover:underline">
                  View all {totalReviews} reviews
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Metadata</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Approval Status</p>
              <p className={isPending ? 'text-yellow-600' : 'text-green-600'}>
                {isPending ? 'Pending Approval' : 'Approved'}
              </p>
            </div>
            {product.approvedAt && (
              <div>
                <p className="text-gray-500 text-xs">Approved At</p>
                <p className="text-gray-900">{formatDateTime(product.approvedAt)}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500 text-xs">Created At</p>
              <p className="text-gray-900">{formatDateTime(product.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Last Updated</p>
              <p className="text-gray-900">{formatDateTime(product.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrashAlt className="text-xl text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-sm text-gray-500 mb-5">
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTimesCircle className="text-xl text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Product</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please provide a reason for rejecting "{product.name}"
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
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRejecting ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

export default AdminProductDetail;