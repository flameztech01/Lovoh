// screens/UduuaOrderId.jsx - Updated with Payment Verification
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowLeft,
  FaBox,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaClock,
  FaSpinner,
  FaCalendarAlt,
  FaWallet,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCopy,
  FaWhatsapp,
  FaPrint,
  FaRegCreditCard,
  FaShieldAlt,
  FaTruck as FaTruckIcon,
  FaStore,
} from 'react-icons/fa';
import { useGetOrderByIdQuery, useConfirmDeliveryMutation, useVerifyPaymentQuery } from '../slices/orderApiSlice';
import { toast } from 'react-toastify';
import ShopNavbar from '../components/ShopNavbar';

const UduuaOrderId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check URL for payment success
  const queryParams = new URLSearchParams(location.search);
  const paymentSuccess = queryParams.get('payment') === 'success';
  const paymentReference = queryParams.get('reference') || queryParams.get('trxref');

  const { data: order, isLoading, error, refetch } = useGetOrderByIdQuery(id, {
    skip: !id || !userInfo,
  });

  const [confirmDelivery, { isLoading: isConfirming }] = useConfirmDeliveryMutation();

  // Verify payment when coming from Paystack redirect
  useEffect(() => {
    const verifyPayment = async () => {
      if (paymentSuccess && paymentReference && order && !order.isPaid && !isVerifying) {
        setIsVerifying(true);
        toast.info('Verifying your payment...');
        
        try {
          const response = await fetch(`/api/orders/verify-payment/${paymentReference}`);
          const result = await response.json();
          
          if (result.success || result.status === 'success') {
            toast.success('Payment verified successfully!');
            refetch();
          } else {
            toast.error('Payment verification failed. Please contact support.');
          }
        } catch (error) {
          console.error('Verification error:', error);
          toast.error('Failed to verify payment. Please contact support.');
        } finally {
          setIsVerifying(false);
          // Remove query params from URL
          navigate(`/shop/orders/${id}`, { replace: true });
        }
      }
    };

    if (order) {
      verifyPayment();
    }
  }, [paymentSuccess, paymentReference, order, id, navigate, refetch, isVerifying]);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatusConfig = (deliveryStatus, paymentStatus, isPaid) => {
    if (deliveryStatus === 'delivered' && isPaid) {
      return {
        label: 'Delivered & Paid',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: FaCheckCircle,
        iconColor: 'text-green-500'
      };
    }
    
    if (deliveryStatus === 'delivered') {
      return {
        label: 'Delivered',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: FaCheckCircle,
        iconColor: 'text-green-500'
      };
    }
    
    if (deliveryStatus === 'in_transit') {
      return {
        label: 'In Transit',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: FaTruck,
        iconColor: 'text-blue-500'
      };
    }
    
    if (deliveryStatus === 'dispatched') {
      return {
        label: 'Dispatched',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: FaTruck,
        iconColor: 'text-purple-500'
      };
    }
    
    if (deliveryStatus === 'processing') {
      return {
        label: 'Processing',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: FaSpinner,
        iconColor: 'text-blue-500'
      };
    }
    
    if (deliveryStatus === 'cancelled') {
      return {
        label: 'Cancelled',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: FaTimesCircle,
        iconColor: 'text-red-500'
      };
    }
    
    return {
      label: 'Order Placed',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: FaBox,
      iconColor: 'text-orange-500'
    };
  };

  const getPaymentStatusConfig = (order) => {
    if (order.isPaid) {
      return {
        label: 'Paid ✓',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        icon: FaCheckCircle,
        iconColor: 'text-green-500'
      };
    }
    
    if (order.paymentStatus === 'paid') {
      return {
        label: 'Paid ✓',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        icon: FaCheckCircle,
        iconColor: 'text-green-500'
      };
    }
    
    if (order.paymentStatus === 'pending_payment') {
      return {
        label: 'Pending Payment',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        icon: FaClock,
        iconColor: 'text-yellow-500'
      };
    }
    
    if (order.paymentStatus === 'awaiting_confirmation') {
      return {
        label: 'Awaiting Confirmation',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        icon: FaClock,
        iconColor: 'text-yellow-500'
      };
    }
    
    if (order.paymentStatus === 'rejected') {
      return {
        label: 'Payment Rejected',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        icon: FaTimesCircle,
        iconColor: 'text-red-500'
      };
    }
    
    if (order.paymentMethod === 'ondelivery') {
      return {
        label: 'Pay on Delivery',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
        icon: FaWallet,
        iconColor: 'text-purple-500'
      };
    }
    
    return {
      label: 'Pending',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      icon: FaClock,
      iconColor: 'text-gray-500'
    };
  };

  const getTimelineSteps = () => {
    if (!order) return [];
    
    const steps = [
      { 
        key: 'placed', 
        label: 'Order Placed', 
        completed: true, 
        date: order.createdAt,
        description: 'Your order has been received and is being processed'
      }
    ];
    
    if (order.paymentMethod !== 'ondelivery') {
      steps.push({
        key: 'payment',
        label: 'Payment',
        completed: order.isPaid || order.paymentStatus === 'paid',
        date: order.paidAt,
        description: order.isPaid ? 'Payment has been successfully confirmed' : 'Awaiting payment confirmation'
      });
    }
    
    steps.push({
      key: 'processing',
      label: 'Processing',
      completed: order.deliveryStatus !== 'pending' && order.deliveryStatus !== 'cancelled',
      date: order.deliveryStatus !== 'pending' ? order.updatedAt : null,
      description: order.deliveryStatus === 'processing' ? 'Your order is being prepared' : 'Order is being processed'
    });
    
    steps.push({
      key: 'dispatched',
      label: 'Dispatched',
      completed: order.deliveryStatus === 'dispatched' || order.deliveryStatus === 'in_transit' || order.deliveryStatus === 'delivered',
      date: order.deliveryStatus === 'dispatched' ? order.updatedAt : null,
      description: 'Your order has been handed over to the delivery partner'
    });
    
    steps.push({
      key: 'shipped',
      label: 'In Transit',
      completed: order.deliveryStatus === 'in_transit' || order.deliveryStatus === 'delivered',
      date: order.deliveryStatus === 'in_transit' ? order.updatedAt : null,
      description: 'Your order is on its way to you'
    });
    
    steps.push({
      key: 'delivered',
      label: 'Delivered',
      completed: order.deliveryStatus === 'delivered',
      date: order.deliveredAt,
      description: order.buyerConfirmedDelivery ? 'Delivery confirmed by you' : 'Awaiting delivery confirmation'
    });
    
    return steps;
  };

  const handleConfirmDelivery = async () => {
    try {
      await confirmDelivery(id).unwrap();
      toast.success('Delivery confirmed successfully! Thank you for shopping with us.');
      setShowConfirmModal(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to confirm delivery. Please try again.');
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    toast.success('Order ID copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const canConfirmDelivery = order?.deliveryStatus === 'delivered' && !order?.buyerConfirmedDelivery && order?.status !== 'cancelled';

  if (!userInfo) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FaBox className="text-3xl text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Login</h2>
            <p className="text-gray-500 mb-6">You need to be logged in to view order details.</p>
            <button
              onClick={() => navigate('/shop/login')}
              className="px-6 py-2.5 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md font-medium transition-colors"
            >
              Login Now
            </button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading order details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <FaBox className="text-3xl text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/shop/orders')}
              className="px-6 py-2.5 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md font-medium transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </>
    );
  }

  const orderStatus = getOrderStatusConfig(order.deliveryStatus, order.paymentStatus, order.isPaid);
  const paymentStatus = getPaymentStatusConfig(order);
  const StatusIcon = orderStatus.icon;
  const PaymentIcon = paymentStatus.icon;
  const timelineSteps = getTimelineSteps();

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Verifying Payment Banner */}
          {isVerifying && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <FaSpinner className="text-blue-600 animate-spin text-lg" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Verifying Payment</p>
                  <p className="text-xs text-blue-600">Please wait while we confirm your payment...</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/shop/orders')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-4 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>Back to Orders</span>
            </button>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Order Details</h1>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm text-gray-500 font-mono">Order #{order._id?.slice(-8)}</p>
                  <button
                    onClick={copyOrderId}
                    className="text-gray-400 hover:text-[#0043FC] transition-colors"
                  >
                    <FaCopy className="text-xs" />
                  </button>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:border-[#0043FC] hover:text-[#0043FC] transition-all text-sm font-medium"
              >
                <FaPrint className="text-xs" />
                Print Order
              </button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className={`${orderStatus.bgColor} rounded-xl p-4 border ${orderStatus.borderColor}`}>
              <div className="flex items-center gap-3">
                <StatusIcon className={`text-2xl ${orderStatus.iconColor}`} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Order Status</p>
                  <p className={`font-semibold ${orderStatus.color} mt-0.5`}>{orderStatus.label}</p>
                </div>
              </div>
            </div>
            <div className={`${paymentStatus.bgColor} rounded-xl p-4 border border-gray-200`}>
              <div className="flex items-center gap-3">
                <PaymentIcon className={`text-2xl ${paymentStatus.iconColor}`} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Status</p>
                  <p className={`font-semibold ${paymentStatus.color} mt-0.5`}>{paymentStatus.label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          {order.seller && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                  <FaStore className="text-sm text-[#0043FC]" />
                </div>
                Seller Information
              </h2>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium text-gray-900">{order.seller?.businessName || order.seller?.name || 'Uduua Store'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Seller since {formatDate(order.seller?.createdAt)}</p>
                </div>
                {order.seller?.email && (
                  <a
                    href={`mailto:${order.seller.email}`}
                    className="text-sm text-[#0043FC] hover:underline flex items-center gap-1"
                  >
                    <FaEnvelope className="text-xs" /> Contact Seller
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                <FaClock className="text-sm text-[#0043FC]" />
              </div>
              Order Timeline
            </h2>
            <div className="relative">
              {timelineSteps.map((step, index) => (
                <div key={step.key} className="relative flex items-start gap-3 mb-6 last:mb-0">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                    step.completed ? 'bg-[#0043FC] text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.completed ? <FaCheckCircle className="text-sm" /> : <FaClock className="text-sm" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-gray-400">{formatDate(step.date)}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className="absolute left-5 top-10 w-px h-full bg-gray-200 -z-0"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Tracking Info */}
          {order.deliveryTracking && (order.deliveryTracking.riderName || order.deliveryTracking.trackingNumber) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                  <FaTruckIcon className="text-sm text-[#0043FC]" />
                </div>
                Delivery Tracking
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.deliveryTracking.riderName && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Rider Name</p>
                    <p className="text-sm font-medium text-gray-900">{order.deliveryTracking.riderName}</p>
                  </div>
                )}
                {order.deliveryTracking.riderPhone && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Rider Phone</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {order.deliveryTracking.riderPhone}
                      <a href={`tel:${order.deliveryTracking.riderPhone}`} className="text-[#0043FC] hover:underline text-xs">Call</a>
                      <a href={`https://wa.me/${order.deliveryTracking.riderPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-xs">WhatsApp</a>
                    </p>
                  </div>
                )}
                {order.deliveryTracking.trackingNumber && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Tracking Number</p>
                    <p className="text-sm font-medium text-gray-900">{order.deliveryTracking.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                <FaBox className="text-sm text-[#0043FC]" />
              </div>
              Order Items
            </h2>
            <div className="space-y-3">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <img src={item.image || '/placeholder-product.jpg'} alt={item.name} className="w-16 h-16 rounded-lg object-cover" onError={(e) => { e.target.src = '/placeholder-product.jpg'; }} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                  <FaTruckIcon className="text-sm text-[#0043FC]" />
                </div>
                Shipping Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <FaUser className="text-gray-400 text-sm mt-0.5" />
                  <div><p className="text-xs text-gray-500">Full Name</p><p className="text-sm font-medium text-gray-900">{order.shippingAddress?.fullName}</p></div>
                </div>
                <div className="flex items-start gap-2">
                  <FaPhone className="text-gray-400 text-sm mt-0.5" />
                  <div><p className="text-xs text-gray-500">Phone Number</p><p className="text-sm font-medium text-gray-900">{order.phone || order.shippingAddress?.phone}</p></div>
                </div>
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-gray-400 text-sm mt-0.5" />
                  <div><p className="text-xs text-gray-500">Delivery Address</p><p className="text-sm text-gray-900">{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country} {order.shippingAddress?.postalCode}</p></div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#0043FC]/10 flex items-center justify-center">
                  <FaRegCreditCard className="text-sm text-[#0043FC]" />
                </div>
                Payment Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">{formatPrice(order.itemsPrice)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping Fee</span><span className="text-gray-900">{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span className="text-gray-900">{formatPrice(order.taxPrice)}</span></div>
                <div className="border-t border-gray-200 pt-3 mt-3"><div className="flex justify-between"><span className="font-semibold text-gray-900">Total</span><span className="text-xl font-bold text-[#0043FC]">{formatPrice(order.totalPrice)}</span></div></div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {order.paymentMethod === 'paystack' ? 'Paystack (Card/Bank Transfer)' : 
                   order.paymentMethod === 'ondelivery' ? 'Pay on Delivery' : 
                   order.paymentMethod === 'onsite' ? 'Bank Transfer' : 'Off-site Payment'}
                </p>
                {order.paymentReference && (<p className="text-xs text-gray-500 mt-2">Reference: <span className="font-mono">{order.paymentReference}</span></p>)}
              </div>
            </div>
          </div>

          {/* Confirm Delivery Button */}
          {canConfirmDelivery && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div><h3 className="font-semibold text-green-800 mb-1">Has your order been delivered?</h3><p className="text-sm text-green-700">Confirm delivery to complete this order and release payment to the seller.</p></div>
                <button onClick={() => setShowConfirmModal(true)} disabled={isConfirming} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"><FaCheckCircle className="text-sm" /> Confirm Delivery</button>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3"><FaShieldAlt className="text-[#0043FC] text-sm" /><p className="text-sm font-medium text-gray-900">Need help with this order?</p></div>
            <p className="text-xs text-gray-500 mb-4">Our support team is ready to assist you</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href={`https://wa.me/2348123456789?text=Hello%2C%20I%20need%20help%20with%20order%20${order._id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"><FaWhatsapp className="text-sm" /> WhatsApp Support</a>
              <button onClick={() => navigate('/shop/contact')} className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#0043FC] text-[#0043FC] hover:bg-[#0043FC] hover:text-white rounded-lg transition-all text-sm font-medium"><FaEnvelope className="text-sm" /> Email Support</button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delivery Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"><FaCheckCircle className="text-2xl text-green-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delivery</h3>
              <p className="text-gray-500 mb-4 text-sm">Have you received and inspected your order? Confirming delivery will complete this transaction.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4"><p className="text-xs text-yellow-800">Once confirmed, this action cannot be undone. Please only confirm if you have received your order in good condition.</p></div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleConfirmDelivery} disabled={isConfirming} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">{isConfirming ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Confirm Delivery</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@media print { nav, button, .no-print { display: none !important; } body { background: white; padding: 0; margin: 0; } .min-h-screen { min-height: auto !important; padding-top: 0 !important; } .bg-gray-50 { background: white !important; } .border { border-color: #e5e7eb !important; } }`}</style>
    </>
  );
};

export default UduuaOrderId;