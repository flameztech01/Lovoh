// components/UduuaProductDetail.jsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ShopNavbar from "../components/ShopNavbar";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaBox,
  FaTag,
  FaMinus,
  FaPlus,
  FaStar,
  FaShieldAlt,
  FaHeart,
  FaShare,
  FaShoppingBag,
  FaStore,
  FaCheckCircle,
  FaSpinner,
  FaChartLine,
  FaThumbsUp,
  FaThumbsDown,
  FaCalendarAlt,
  FaHeadset,
  FaTruck,
  FaPercentage,
} from "react-icons/fa";
import {
  useGetProductByIdQuery,
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useMarkReviewHelpfulMutation,
  useMarkReviewNotHelpfulMutation,
} from "../slices/productApiSlice";
import { useAddToCartMutation, useGetCartSummaryQuery } from "../slices/orderApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { format } from "date-fns";

const UduuaProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Product data - only approved products are returned by API
  const { data: product, isLoading, error, refetch: refetchProduct } = useGetProductByIdQuery(id);

  // Reviews data
  const { data: reviewsData, refetch: refetchReviews } =
    useGetProductReviewsQuery({ id, limit: 5, sort: "newest" });

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  // Cart mutation and query
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const { refetch: refetchCartSummary } = useGetCartSummaryQuery(undefined, {
    skip: !userInfo,
  });

  // Review mutations
  const [createReview, { isLoading: isSubmittingReview }] =
    useCreateProductReviewMutation();
  const [markHelpful] = useMarkReviewHelpfulMutation();
  const [markNotHelpful] = useMarkReviewNotHelpfulMutation();

  const reviews = reviewsData?.reviews || [];
  const ratingDistribution = reviewsData?.ratingDistribution || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const averageRating = product?.rating || 0;
  const totalReviews = product?.numReviews || 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return { bg: "bg-green-500", text: "New" };
      case "Trending":
        return {
          bg: "bg-gradient-to-r from-orange-500 to-red-500",
          text: "Trending",
        };
      case "Bulk Available":
        return { bg: "bg-blue-500", text: "Bulk Available" };
      case "Shoppers Favourite":
        return { bg: "bg-purple-500", text: "Favourite" };
      case "Limited":
        return { bg: "bg-yellow-500", text: "Limited" };
      case "Featured":
        return { bg: "bg-pink-500", text: "Featured" };
      default:
        return { bg: "bg-green-500", text: "New" };
    }
  };

  const formatPrice = (price) => {
    if (!price) return "₦0";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get discounted price if product has active discount
  const getDiscountedPrice = () => {
    if (!product) return 0;
    
    let basePrice = product.retailPrice || product.price || 0;
    
    // Apply discount if available and valid
    if (product.discount && product.discount > 0) {
      const now = new Date();
      const isDiscountValid = (!product.discountStartDate || now >= new Date(product.discountStartDate)) &&
                              (!product.discountEndDate || now <= new Date(product.discountEndDate));
      if (isDiscountValid) {
        basePrice = basePrice * (1 - product.discount / 100);
      }
    }
    
    // Apply bulk pricing
    if (product.bulkPricing && product.bulkPricing.length > 0) {
      const sortedPricing = [...product.bulkPricing].sort(
        (a, b) => b.minQuantity - a.minQuantity,
      );
      for (const tier of sortedPricing) {
        if (quantity >= tier.minQuantity) {
          return tier.price;
        }
      }
    }

    if (quantity >= 2 && product.bulkPrice) {
      return product.bulkPrice;
    }

    return basePrice;
  };

  const getTotalPrice = () => getDiscountedPrice() * quantity;

  const calculateSavings = () => {
    const retail = product?.retailPrice || product?.price;
    const current = getDiscountedPrice();
    if (retail && current && retail > current) {
      return Math.round(((retail - current) / retail) * 100);
    }
    return 0;
  };

  // Check if product has active discount
  const hasActiveDiscount = () => {
    if (!product?.discount || product.discount === 0) return false;
    const now = new Date();
    const isDiscountValid = (!product.discountStartDate || now >= new Date(product.discountStartDate)) &&
                            (!product.discountEndDate || now <= new Date(product.discountEndDate));
    return isDiscountValid;
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.quantityAvailable || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!userInfo) {
      toast.error("Please login to add items to cart");
      setTimeout(
        () => navigate("/login?redirect=/uduua/shop/product/" + id),
        2000,
      );
      return;
    }

    if (!product?.isApproved) {
      toast.error("This product is pending approval and cannot be purchased yet");
      return;
    }

    if (quantity > product.quantityAvailable) {
      toast.error(`Only ${product.quantityAvailable} units available`);
      return;
    }

    try {
      await addToCart({ productId: product._id, quantity }).unwrap();
      refetchCartSummary();
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add to cart");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!userInfo) {
      toast.error("Please login to leave a review");
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      toast.error("Please provide a title and comment");
      return;
    }

    try {
      await createReview({ id, data: reviewForm }).unwrap();
      toast.success("Review submitted successfully!");
      setReviewForm({ rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
      refetchReviews();
      refetchProduct();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to submit review");
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!userInfo) {
      toast.error("Please login to mark reviews as helpful");
      return;
    }
    try {
      await markHelpful({ productId: id, reviewId }).unwrap();
      refetchReviews();
    } catch (error) {
      toast.error("Failed to mark review");
    }
  };

  const handleMarkNotHelpful = async (reviewId) => {
    if (!userInfo) {
      toast.error("Please login to mark reviews");
      return;
    }
    try {
      await markNotHelpful({ productId: id, reviewId }).unwrap();
      refetchReviews();
    } catch (error) {
      toast.error("Failed to mark review");
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`text-xs sm:text-sm ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen flex justify-center items-center bg-white pt-20">
          <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin" />
        </div>
      </>
    );
  }

  if (error || !product || !product.isApproved) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 pt-20">
          <div className="text-center">
            <FaShoppingBag className="text-5xl text-[#0043FC] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Product Not Available
            </h2>
            <p className="text-gray-500 mb-6">
              {!product?.isApproved 
                ? "This product is pending approval and not available for purchase yet."
                : "This product doesn't exist or has been removed."}
            </p>
            <Link
              to="/uduua/shop"
              className="px-6 py-2.5 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </>
    );
  }

  const statusStyle = getStatusBadge(product.status);
  const stockStatus =
    product.isSoldOut || product.quantityAvailable === 0
      ? { text: "Out of Stock", available: false }
      : product.quantityAvailable < 10
        ? { text: "Low Stock", available: true }
        : { text: "In Stock", available: true };

  const discountedPrice = getDiscountedPrice();
  const savings = calculateSavings();
  const hasDiscount = hasActiveDiscount();
  const productImage =
    product.images?.[selectedImage] || "/placeholder-product.jpg";
  
  const deliveryBadge = product.deliveryOptions?.payOnDelivery 
    ? { text: "Pay on Delivery", color: "bg-green-600" }
    : product.deliveryOptions?.payOnline
    ? { text: "Pay Online", color: "bg-blue-600" }
    : { text: "Pay on Delivery", color: "bg-green-600" };

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-white pt-20 sm:pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => navigate("/uduua/shop")}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-[#0043FC] transition-colors group"
            >
              <FaArrowLeft className="text-xs sm:text-sm group-hover:-translate-x-1 transition-transform" />
              <span>Back to Products</span>
            </button>
            <span>/</span>
            <span className="text-gray-400 truncate max-w-[100px] sm:max-w-none">
              {product.category || "General"}
            </span>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-[120px] sm:max-w-none">
              {product.name}
            </span>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left - Images */}
            <div className="lg:col-span-5">
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 relative">
                <div
                  className={`absolute top-3 left-3 z-10 ${statusStyle.bg} text-white text-xs font-bold px-2 py-1 rounded-full`}
                >
                  {statusStyle.text}
                </div>

                {hasDiscount && (
                  <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <FaPercentage className="text-[10px]" />
                    {product.discount}% OFF
                  </div>
                )}

                <div className="aspect-square relative bg-white">
                  <img
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-product.jpg";
                    }}
                  />
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImage === idx
                          ? "border-[#0043FC]"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product Info */}
            <div className="lg:col-span-4">
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                {/* Brand Name */}
                <div className="flex items-center gap-1 mb-1 sm:mb-2">
                  <FaStore className="text-[#0043FC] text-xs" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600">
                    {product.brandName || "GENERIC"}
                  </span>
                </div>

                {/* Category */}
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <FaTag className="text-gray-400 text-xs" />
                  <span className="text-xs sm:text-sm text-gray-500">
                    {product.category || "General"}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  {product.name}
                </h1>

                {/* Rating Summary */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(Math.floor(averageRating))}
                    <span className="text-xs sm:text-sm font-medium text-gray-900 ml-1">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                    |
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {totalReviews} reviews
                  </span>
                  <span className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                    |
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {product.quantitySold || 0} sold
                  </span>
                </div>

                {/* Stock Status */}
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-3 sm:mb-4 ${
                    stockStatus.available
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <FaCheckCircle className="text-[10px]" />
                  {stockStatus.text}
                </div>

                {/* Delivery Badge */}
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-[10px] font-medium mb-3 sm:mb-4 ml-2 ${deliveryBadge.color}`}>
                  <FaTruck className="text-[8px]" />
                  {deliveryBadge.text}
                </div>

                {/* Price Section */}
                <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                  <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl font-bold text-[#0043FC]">
                      {formatPrice(discountedPrice)}
                    </span>
                    {savings > 0 && (
                      <>
                        <span className="text-base sm:text-lg text-gray-400 line-through">
                          {formatPrice(product.retailPrice || product.price)}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          Save {savings}%
                        </span>
                      </>
                    )}
                  </div>

                  {quantity >= 2 && product.bulkPrice && (
                    <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm">
                      <FaChartLine className="text-green-600" />
                      <span className="text-gray-600">Bulk price applied</span>
                      <span className="text-green-600 font-medium">
                        (Save{" "}
                        {formatPrice(
                          (product.retailPrice || product.price) -
                            discountedPrice,
                        )}
                        /unit)
                      </span>
                    </div>
                  )}
                </div>

                {stockStatus.available && (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1 || isAddingToCart}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-md border border-gray-300 flex items-center justify-center hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="text-base sm:text-lg font-medium w-10 sm:w-12 text-center text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={
                          quantity >= product.quantityAvailable ||
                          isAddingToCart
                        }
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-md border border-gray-300 flex items-center justify-center hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {product.quantityAvailable} units available
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 sm:py-4 border-t border-b border-gray-200 mb-4 sm:mb-6">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Total amount
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-[#0043FC]">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!stockStatus.available || isAddingToCart || !product.isApproved}
                  className={`w-full py-2.5 sm:py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                    stockStatus.available && !isAddingToCart && product.isApproved
                      ? "bg-[#0043FC] hover:bg-[#0033cc] text-white"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="text-sm" />
                      {!product.isApproved 
                        ? "Pending Approval" 
                        : stockStatus.available 
                          ? "Add to Cart" 
                          : "Out of Stock"}
                    </>
                  )}
                </button>

                <div className="flex gap-2 sm:gap-3 mt-3">
                  <button className="flex-1 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-600 hover:border-[#0043FC] hover:text-[#0043FC] transition-colors flex items-center justify-center gap-1 sm:gap-2">
                    <FaHeart className="text-xs" />
                    Save
                  </button>
                  <button className="flex-1 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-600 hover:border-[#0043FC] hover:text-[#0043FC] transition-colors flex items-center justify-center gap-1 sm:gap-2">
                    <FaShare className="text-xs" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Far Right - Bulk Pricing & Info */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
                {/* Bulk Pricing Tiers */}
                {product.bulkPricing && product.bulkPricing.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 sm:mb-4">
                      Bulk Pricing Tiers
                    </h3>
                    <div className="space-y-2">
                      {product.bulkPricing.map((tier, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-md text-xs sm:text-sm ${
                            quantity >= tier.minQuantity
                              ? "bg-[#0043FC]/5 border-[#0043FC]/20 text-[#0043FC]"
                              : "bg-white text-gray-600"
                          } border border-gray-200`}
                        >
                          <span>{tier.minQuantity}+ units</span>
                          <span className="font-medium">
                            {formatPrice(tier.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Default Bulk Price */}
                {product.bulkPrice && (
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Bulk Purchase
                    </h3>
                    <div className="flex items-center justify-between p-2 sm:p-3 rounded-md bg-green-50 border border-green-200">
                      <span className="text-xs sm:text-sm text-gray-700">
                        2+ units
                      </span>
                      <span className="font-bold text-green-700 text-sm sm:text-base">
                        {formatPrice(product.bulkPrice)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Save{" "}
                      {formatPrice(
                        (product.retailPrice || product.price) -
                          product.bulkPrice,
                      )}{" "}
                      per unit on bulk orders
                    </p>
                  </div>
                )}

                {/* Seller Info */}
                <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                      <FaStore className="text-[#0043FC]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.brandName || "Úduua Store"}
                      </p>
                      <p className="text-xs text-gray-500">Verified Seller</p>
                    </div>
                  </div>
                </div>

                {/* Why buy from us */}
                <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 sm:mb-4">
                    Why buy from us
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                        <FaCheckCircle className="text-[#0043FC] text-xs sm:text-sm" />
                      </div>
                      <span>Quality verified products</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                        <FaShieldAlt className="text-[#0043FC] text-xs sm:text-sm" />
                      </div>
                      <span>Secure and encrypted payments</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                        <FaBox className="text-[#0043FC] text-xs sm:text-sm" />
                      </div>
                      <span>Authentic products guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                        <FaHeadset className="text-[#0043FC] text-xs sm:text-sm" />
                      </div>
                      <span>Dedicated customer support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Description & Reviews */}
          <div className="mt-6 sm:mt-8 border border-gray-200 rounded-lg bg-white">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "description"
                      ? "text-[#0043FC] border-b-2 border-[#0043FC]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "reviews"
                      ? "text-[#0043FC] border-b-2 border-[#0043FC]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Reviews ({totalReviews})
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === "description" ? (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              ) : (
                <div>
                  {/* Rating Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
                    <div className="flex sm:block items-center gap-4 sm:text-center">
                      <div className="text-4xl sm:text-5xl font-bold text-gray-900">
                        {averageRating.toFixed(1)}
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-0.5 mb-1">
                          {renderStars(Math.floor(averageRating))}
                        </div>
                        <p className="text-xs text-gray-500">
                          {totalReviews} reviews
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 max-w-full sm:max-w-xs">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div
                          key={star}
                          className="flex items-center gap-2 text-xs sm:text-sm"
                        >
                          <span className="w-6 sm:w-8">{star} ★</span>
                          <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full"
                              style={{
                                width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="w-6 sm:w-8 text-gray-500 text-right">
                            {ratingDistribution[star] || 0}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="w-full sm:w-auto px-4 py-2 bg-[#0043FC] text-white rounded-md text-sm font-medium hover:bg-[#0033cc] sm:ml-auto"
                    >
                      Write a Review
                    </button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <form
                      onSubmit={handleSubmitReview}
                      className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg"
                    >
                      <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                        Write Your Review
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm text-gray-700 mb-1">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setReviewForm({ ...reviewForm, rating: star })
                                }
                                className="text-xl sm:text-2xl"
                              >
                                <FaStar
                                  className={
                                    star <= reviewForm.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Review Title"
                          value={reviewForm.title}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                          required
                        />
                        <textarea
                          placeholder="Your Review"
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              comment: e.target.value,
                            })
                          }
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-none"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="px-4 py-2 bg-[#0043FC] text-white rounded-md text-sm font-medium hover:bg-[#0033cc] disabled:opacity-50"
                          >
                            {isSubmittingReview
                              ? "Submitting..."
                              : "Submit Review"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4 sm:space-y-6">
                    {reviews.length === 0 ? (
                      <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">
                        No reviews yet. Be the first to review this product!
                      </p>
                    ) : (
                      reviews.map((review) => (
                        <div
                          key={review._id}
                          className="border-b border-gray-200 pb-4 sm:pb-6 last:border-0"
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0043FC]/10 flex items-center justify-center text-[#0043FC] font-bold flex-shrink-0 text-xs sm:text-sm">
                              {review.name?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">
                                  {review.name}
                                </span>
                                {review.isVerifiedPurchase && (
                                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <div className="flex items-center gap-0.5">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-xs text-gray-400">
                                  <FaCalendarAlt className="inline mr-1 text-[10px]" />
                                  {review.createdAt
                                    ? format(
                                        new Date(review.createdAt),
                                        "MMM dd, yyyy",
                                      )
                                    : "Recently"}
                                </span>
                              </div>
                              <h5 className="font-medium text-gray-900 mb-1 text-sm">
                                {review.title}
                              </h5>
                              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                                {review.comment}
                              </p>

                              {/* Review Images */}
                              {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mb-2 sm:mb-3 overflow-x-auto pb-1">
                                  {review.images.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt="Review"
                                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0"
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Helpful Actions */}
                              <div className="flex items-center gap-3 sm:gap-4">
                                <span className="text-xs text-gray-400">
                                  Was this helpful?
                                </span>
                                <button
                                  onClick={() => handleMarkHelpful(review._id)}
                                  className={`flex items-center gap-1 text-xs transition-colors ${
                                    review.userHasMarkedHelpful
                                      ? "text-green-600"
                                      : "text-gray-500 hover:text-green-600"
                                  }`}
                                >
                                  <FaThumbsUp className="text-[10px]" />
                                  <span>
                                    Yes ({review.helpful?.length || 0})
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleMarkNotHelpful(review._id)
                                  }
                                  className={`flex items-center gap-1 text-xs transition-colors ${
                                    review.userHasMarkedNotHelpful
                                      ? "text-red-600"
                                      : "text-gray-500 hover:text-red-600"
                                  }`}
                                >
                                  <FaThumbsDown className="text-[10px]" />
                                  <span>
                                    No ({review.notHelpful?.length || 0})
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UduuaProductDetail;