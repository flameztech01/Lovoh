// screens/UduuaCheckout.jsx - Updated with New Payment Endpoints
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowLeft,
  FaCreditCard,
  FaMoneyBillWave,
  FaBuilding,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaCopy,
  FaWhatsapp,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
  FaRegCreditCard,
  FaTruck,
  FaBox,
  FaShieldAlt,
  FaClock,
  FaChevronRight,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCheckoutCartMutation, useGetCartQuery } from '../slices/orderApiSlice';
import ShopNavbar from '../components/ShopNavbar';

const UduuaCheckout = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [checkoutCart, { isLoading }] = useCheckoutCartMutation();
  
  // Fetch current cart data
  const { data: cartData, isLoading: isLoadingCart, refetch: refetchCart } = useGetCartQuery(undefined, {
    skip: !userInfo,
  });
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const bankDetails = {
    bankName: 'OPay Digital Bank',
    accountName: 'Lovoh',
    accountNumber: '8123456789',
    bankCode: '999992'
  };

  // Redirect if no cart items
  useEffect(() => {
    if (!isLoadingCart && cartData && (!cartData.cart || cartData.cart.length === 0)) {
      toast.error('Your cart is empty. Please add items to cart before checkout.');
      navigate('/shop/cart');
    }
  }, [cartData, isLoadingCart, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image or PDF file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Account number copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  // Handle checkout submission
  // In UduuaCheckout.jsx, update the handleSubmit function

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate shipping info
  if (!formData.fullName) {
    toast.error('Please enter your full name');
    return;
  }
  
  if (!formData.phone) {
    toast.error('Please enter your phone number');
    return;
  }
  
  if (!formData.address) {
    toast.error('Please enter your shipping address');
    return;
  }
  
  if (!formData.city) {
    toast.error('Please enter your city');
    return;
  }
  
  if (!formData.state) {
    toast.error('Please enter your state');
    return;
  }
  
  // Validate email for Paystack payment
  if (paymentMethod === 'paystack' && (!formData.email || !formData.email.includes('@'))) {
    toast.error('Please enter a valid email address for payment confirmation');
    return;
  }
  
  // Validate payment method specific requirements
  if (paymentMethod === 'onsite' && !receiptFile) {
    toast.error('Please upload your payment receipt for on-site payment');
    return;
  }
  
  setIsProcessingPayment(true);
  
  const shippingAddress = {
    fullName: formData.fullName,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    postalCode: formData.postalCode || '',
    country: 'Nigeria',
    phone: formData.phone
  };
  
  const submitData = new FormData();
  submitData.append('shippingAddress', JSON.stringify(shippingAddress));
  submitData.append('paymentMethod', paymentMethod);
  submitData.append('phone', formData.phone);
  submitData.append('notes', formData.notes || '');
  submitData.append('email', formData.email); // ADD THIS LINE - Send email to backend
  
  if (receiptFile && paymentMethod === 'onsite') {
    submitData.append('receipt', receiptFile);
  }
  
  try {
    const result = await checkoutCart(submitData).unwrap();
    
    // Handle Paystack payment redirect
    if (result.paymentUrl) {
      // Store order info in session for after payment return
      sessionStorage.setItem('pending_order_reference', result.paymentReference);
      sessionStorage.setItem('pending_order_ids', JSON.stringify(result.orderIds || result.orders?.map(o => o._id)));
      
      // Redirect to Paystack payment page
      window.location.href = result.paymentUrl;
    } else {
      // For on-site payment or pay-on-delivery
      toast.success('Order placed successfully!');
      sessionStorage.removeItem('uduua_checkout_cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      const orderId = result.orders?.[0]?._id || result.order?._id;
      if (orderId) {
        setTimeout(() => {
          navigate(`/shop/orders/${orderId}`);
        }, 2000);
      } else {
        setTimeout(() => {
          navigate('/shop/orders');
        }, 2000);
      }
    }
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error(error?.data?.message || 'Failed to place order. Please try again.');
  } finally {
    setIsProcessingPayment(false);
  }
};
  
  // Check for payment return (when redirected back from Paystack)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const reference = urlParams.get('reference');
    
    if (paymentStatus === 'success' && reference) {
      toast.success('Payment successful! Your order has been confirmed.');
      // Clear pending order data
      sessionStorage.removeItem('pending_order_reference');
      sessionStorage.removeItem('pending_order_ids');
      sessionStorage.removeItem('uduua_checkout_cart');
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/shop/orders');
    } else if (paymentStatus === 'failed') {
      toast.error('Payment failed. Please try again or use another payment method.');
    }
  }, [navigate]);
  
  // Calculate totals from cart data
  const cartItems = cartData?.cart || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const paymentOptions = [
    {
      id: 'paystack',
      name: 'Pay with Card',
      icon: FaCreditCard,
      description: 'Secure payment via card, bank transfer, or USSD',
      popular: true
    },
    {
      id: 'ondelivery',
      name: 'Pay on Delivery',
      icon: FaMoneyBillWave,
      description: 'Pay when you receive your order',
    },
    {
      id: 'onsite',
      name: 'Bank Transfer',
      icon: FaBuilding,
      description: 'Manual bank transfer to our account',
    }
  ];

  // Loading state
  if (isLoadingCart) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <FaSpinner className="w-8 h-8 text-[#0043FC] animate-spin" />
        </div>
      </>
    );
  }
  
  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <button
            onClick={() => navigate('/shop/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-5 transition-colors group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Cart</span>
          </button>
          
          {/* Mobile Order Summary Toggle */}
          <div className="lg:hidden mb-5">
            <button
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-500">Order Total</p>
                <p className="text-xl font-bold text-[#0043FC]">{formatPrice(total)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {itemCount} item(s)
                </span>
                <FaChevronRight className={`text-gray-400 text-sm transition-transform ${showOrderSummary ? 'rotate-90' : ''}`} />
              </div>
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Checkout Form - Left Column */}
            <div className="flex-1 space-y-5">
              {/* Shipping Information */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                      <FaTruck className="text-sm text-[#0043FC]" />
                    </div>
                    Shipping Information
                  </h2>
                </div>
                
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (for payment confirmation)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                          placeholder="+234 801 234 5678"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                        placeholder="123 Main Street"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                        placeholder="Lagos"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                        placeholder="Lagos"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                        placeholder="100001"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                      <FaRegCreditCard className="text-sm text-[#0043FC]" />
                    </div>
                    Payment Method
                  </h2>
                </div>
                
                <div className="p-5 space-y-3">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = paymentMethod === option.id;
                    
                    return (
                      <label
                        key={option.id}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0043FC] bg-[#0043FC]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.id}
                          checked={isSelected}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 text-[#0043FC] focus:ring-[#0043FC]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className={`text-base ${isSelected ? 'text-[#0043FC]' : 'text-gray-400'}`} />
                            <span className="font-medium text-gray-900 text-sm">{option.name}</span>
                            {option.popular && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Popular</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                
                {/* Bank Transfer Details (for onsite payment) */}
                {paymentMethod === 'onsite' && (
                  <div className="mx-5 mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                      <FaBuilding className="text-sm text-[#0043FC]" />
                      Bank Transfer Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2.5 bg-white rounded-md border border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Bank Name</p>
                          <p className="font-medium text-gray-900 text-sm">{bankDetails.bankName}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2.5 bg-white rounded-md border border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Account Name</p>
                          <p className="font-medium text-gray-900 text-sm">{bankDetails.accountName}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2.5 bg-white rounded-md border border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Account Number</p>
                          <p className="font-medium text-gray-900 text-base">{bankDetails.accountNumber}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(bankDetails.accountNumber)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#0043FC]/10 text-[#0043FC] rounded-md text-sm hover:bg-[#0043FC]/20 transition-colors"
                        >
                          <FaCopy className="text-xs" />
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Receipt Upload */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Payment Receipt *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#0043FC] transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleReceiptUpload}
                          className="hidden"
                          id="receipt-upload"
                        />
                        <label htmlFor="receipt-upload" className="cursor-pointer block">
                          <FaUpload className="text-xl text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">
                            Click to upload receipt
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            JPEG, PNG, PDF (Max 5MB)
                          </p>
                        </label>
                      </div>
                      {receiptPreview && (
                        <div className="mt-3 relative inline-block">
                          <img src={receiptPreview} alt="Receipt Preview" className="h-16 rounded-md object-cover border border-gray-200" />
                          <button
                            onClick={() => {
                              setReceiptFile(null);
                              setReceiptPreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Order Notes */}
                <div className="px-5 pb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors resize-none"
                    placeholder="Special delivery instructions or additional notes..."
                  />
                </div>
              </div>
            </div>
            
            {/* Order Summary - Right Column */}
            <div className={`lg:w-96 ${showOrderSummary ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-24">
                <h2 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
                  <FaBox className="text-sm text-[#0043FC]" />
                  Order Summary
                </h2>
                
                {/* Items List */}
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {cartItems.map((item, index) => (
                    <div key={item.product?._id || index} className="flex gap-3">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-12 h-12 rounded-md object-cover bg-gray-50 border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Totals */}
                <div className="space-y-2 mb-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm">{formatPrice(subtotal)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 my-4"></div>
                
                <div className="flex justify-between items-center mb-5">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-[#0043FC]">
                    {formatPrice(total)}
                  </span>
                </div>
                
                {/* Trust Badges */}
                <div className="hidden lg:block mb-5 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1">
                      <FaShieldAlt className="text-xs text-[#0043FC]" />
                      <span className="text-xs text-gray-600">Secure Checkout</span>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                      <FaClock className="text-xs text-[#0043FC]" />
                      <span className="text-xs text-gray-600">Fast Delivery</span>
                    </div>
                  </div>
                </div>
                
                {/* Place Order Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || isProcessingPayment || itemCount === 0}
                  className="w-full py-3 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading || isProcessingPayment ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      {paymentMethod === 'paystack' ? 'Processing...' : 'Placing Order...'}
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="text-sm" />
                      {paymentMethod === 'paystack' ? 'Pay Now' : 'Place Order'}
                    </>
                  )}
                </button>
                
                {/* WhatsApp Support */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center mb-2">Need help with payment?</p>
                  <a
                    href="https://wa.me/2348123456789?text=Hello%2C%20I%20need%20help%20with%20my%20order%20payment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-[#0043FC] hover:text-[#0033cc] transition-colors"
                  >
                    <FaWhatsapp className="text-green-600" />
                    Contact Support on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UduuaCheckout;