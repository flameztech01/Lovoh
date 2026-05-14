// screens/UduuaCart.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaShoppingBag,
  FaArrowLeft,
  FaArrowRight,
  FaTag,
  FaCreditCard,
  FaWallet,
  FaBuilding,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaStore,
  FaTruck
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  useGetCartQuery, 
  useUpdateCartItemMutation, 
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetCartSummaryQuery
} from '../slices/orderApiSlice';
import ShopNavbar from '../components/ShopNavbar';

const UduuaCart = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Fetch cart from server
  const { 
    data: cartData, 
    isLoading, 
    refetch 
  } = useGetCartQuery(undefined, {
    skip: !userInfo,
  });

  // Get cart summary for quick stats
  const { data: cartSummary, refetch: refetchSummary } = useGetCartSummaryQuery(undefined, {
    skip: !userInfo,
  });

  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();

  // Extract cart items from API response
  const cartItems = cartData?.cart || [];
  
  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + ((item.price || 0) * (item.quantity || 0)),
    0
  );

  const discountAmount = appliedCoupon?.discount || 0;
  const total = subtotal - discountAmount;

  // Format price in NGN
  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦0";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle quantity change
  const handleQuantityChange = async (productId, newQuantity, quantityAvailable) => {
    if (newQuantity < 1) return;
    if (newQuantity > quantityAvailable) {
      toast.error(`Only ${quantityAvailable} units available`);
      return;
    }
    
    setUpdatingItemId(productId);
    try {
      await updateCartItem({ productId, quantity: newQuantity }).unwrap();
      await refetch();
      await refetchSummary();
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Quantity updated');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId, itemName) => {
    try {
      await removeFromCart(productId).unwrap();
      await refetch();
      await refetchSummary();
      window.dispatchEvent(new Event('cartUpdated'));
      toast.info(`${itemName} removed from cart`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to remove item');
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart().unwrap();
        await refetch();
        await refetchSummary();
        window.dispatchEvent(new Event('cartUpdated'));
        toast.info('Cart cleared');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to clear cart');
      }
    }
  };

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    setIsApplyingCoupon(true);
    try {
      // Simulate API call - replace with actual coupon validation endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (couponCode.toUpperCase() === 'WELCOME10') {
        const discountValue = subtotal * 0.1;
        setAppliedCoupon({ code: couponCode, discount: discountValue, type: 'percentage' });
        toast.success(`Coupon applied! You saved ${formatPrice(discountValue)}`);
      } else if (couponCode.toUpperCase() === 'FREESHIP') {
        setAppliedCoupon({ code: couponCode, discount: 0, freeShipping: true, type: 'shipping' });
        toast.success('Free shipping coupon applied!');
      } else if (couponCode.toUpperCase() === 'SAVE5000') {
        setAppliedCoupon({ code: couponCode, discount: 5000, type: 'fixed' });
        toast.success(`Coupon applied! You saved ${formatPrice(5000)}`);
      } else {
        toast.error('Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  // Handle proceed to checkout
  const handleCheckout = () => {
    if (!userInfo) {
      toast.error('Please login to proceed to checkout');
      navigate('/uduua/shop/login', { state: { from: '/uduua/checkout' } });
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    navigate('/uduua/checkout');
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    navigate('/uduua/shop');
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="text-center">
            <FaSpinner className="text-3xl text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your cart...</p>
          </div>
        </div>
      </>
    );
  }

  // Empty cart state
  if (!isLoading && cartItems.length === 0) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FaShoppingBag className="text-4xl text-[#0043FC]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <button
              onClick={handleContinueShopping}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md font-medium transition-colors"
            >
              <FaShoppingBag />
              Start Shopping
              <FaArrowRight />
            </button>
          </div>
        </div>
      </>
    );
  }

  // Group items by seller
  const itemsBySeller = cartItems.reduce((group, item) => {
    const sellerName = item.seller?.businessName || item.brandName || 'Uduua Store';
    const sellerId = item.seller?._id || 'default';
    if (!group[sellerId]) {
      group[sellerId] = { name: sellerName, items: [], subtotal: 0 };
    }
    group[sellerId].items.push(item);
    group[sellerId].subtotal += (item.price || 0) * (item.quantity || 0);
    return group;
  }, {});

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleContinueShopping}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-4 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>Continue Shopping</span>
            </button>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  Shopping Cart
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} item{cartItems.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''}
                </p>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <FaTrashAlt className="text-sm" />
                  Clear Cart
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header - Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Cart Items by Seller */}
                <div className="divide-y divide-gray-200">
                  {Object.entries(itemsBySeller).map(([sellerId, sellerGroup]) => (
                    <div key={sellerId}>
                      {/* Seller Header */}
                      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <FaStore className="text-[#0043FC] text-sm" />
                          <span className="text-sm font-semibold text-gray-700">{sellerGroup.name}</span>
                        </div>
                      </div>
                      
                      {/* Seller Items */}
                      {sellerGroup.items.map((item) => {
                        const productId = item.product?._id || item.product;
                        const itemName = item.name;
                        const itemImage = item.image || '/placeholder-product.jpg';
                        const itemPrice = item.price || 0;
                        const quantityAvailable = item.product?.quantityAvailable || 10;
                        const isUpdatingThisItem = updatingItemId === productId;
                        
                        return (
                          <div key={productId} className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Product Image */}
                              <div className="w-28 h-28 rounded-md overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                                <img
                                  src={itemImage}
                                  alt={itemName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                                />
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                                  <div>
                                    <Link 
                                      to={`/uduua/shop/product/${productId}`}
                                      className="text-base font-medium text-gray-900 hover:text-[#0043FC] transition-colors"
                                    >
                                      {itemName}
                                    </Link>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {formatPrice(itemPrice)} each
                                    </p>
                                    {quantityAvailable < 10 && (
                                      <p className="text-xs text-orange-600 mt-2">
                                        Only {quantityAvailable} left
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="text-left sm:text-right">
                                    <div className="font-semibold text-gray-900 md:hidden mb-1">
                                      {formatPrice(itemPrice * item.quantity)}
                                    </div>
                                    <button
                                      onClick={() => handleRemoveItem(productId, itemName)}
                                      className="text-sm text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1"
                                    >
                                      <FaTrashAlt className="text-xs" />
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-3 mt-4">
                                  <span className="text-sm text-gray-500">Quantity:</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleQuantityChange(productId, item.quantity - 1, quantityAvailable)}
                                      disabled={item.quantity <= 1 || isUpdatingThisItem}
                                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <FaMinus className="text-xs" />
                                    </button>
                                    <span className="w-12 text-center font-medium text-gray-900">
                                      {isUpdatingThisItem ? <FaSpinner className="animate-spin text-xs" /> : item.quantity}
                                    </span>
                                    <button
                                      onClick={() => handleQuantityChange(productId, item.quantity + 1, quantityAvailable)}
                                      disabled={item.quantity >= quantityAvailable || isUpdatingThisItem}
                                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <FaPlus className="text-xs" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Desktop Total */}
                              <div className="hidden md:block w-24 text-right">
                                <div className="font-semibold text-gray-900">
                                  {formatPrice(itemPrice * item.quantity)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Order Summary
                </h2>
                
                {/* Cart Summary Stats */}
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Total Items:</span>
                    <span className="font-medium text-gray-900">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Unique Products:</span>
                    <span className="font-medium text-gray-900">{cartItems.length}</span>
                  </div>
                </div>
                
                {/* Calculations */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm">Shipping</span>
                    <span className="text-sm">Calculated at checkout</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span className="text-sm">Discount</span>
                      <span className="text-sm">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 my-4"></div>
                
                <div className="flex justify-between mb-6">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-[#0043FC]">
                    {formatPrice(total)}
                  </span>
                </div>
                
                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-600 text-sm" />
                        <span className="font-medium text-gray-900 text-sm">{appliedCoupon.code}</span>
                        <span className="text-xs text-gray-500">
                          {appliedCoupon.type === 'percentage' && `${Math.round((appliedCoupon.discount / subtotal) * 100)}% off`}
                          {appliedCoupon.type === 'fixed' && `${formatPrice(appliedCoupon.discount)} off`}
                          {appliedCoupon.type === 'shipping' && 'Free Shipping'}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0043FC] focus:border-[#0043FC]"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="px-4 py-2 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isApplyingCoupon ? <FaSpinner className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Available coupons: WELCOME10 (10% off), SAVE5000 (₦5,000 off)
                  </p>
                </div>
                
                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full py-3 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FaCreditCard className="text-sm" />
                  Proceed to Checkout
                  <FaArrowRight className="text-sm" />
                </button>
                
                {/* Delivery Info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTruck className="text-[#0043FC] text-sm" />
                    <span className="text-xs font-medium text-gray-700">Delivery Information</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Delivery fee will be calculated at checkout based on your location.
                  </p>
                </div>
                
                {/* Payment Methods */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center mb-3">We accept secure payments via</p>
                  <div className="flex justify-center gap-4">
                    <FaCreditCard className="text-gray-400 text-lg" />
                    <FaWallet className="text-gray-400 text-lg" />
                    <FaBuilding className="text-gray-400 text-lg" />
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Powered by Paystack
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UduuaCart;