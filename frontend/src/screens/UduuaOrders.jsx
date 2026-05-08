// screens/UduuaOrders.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaBox,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaSpinner,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaBuilding,
  FaCopy,
  FaWhatsapp,
  FaTimes,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaRegCreditCard,
  FaExclamationTriangle,
  FaBan,
  FaShippingFast,
} from 'react-icons/fa';
import { useGetMyOrdersQuery, useCancelOrderMutation } from '../slices/orderApiSlice';
import ShopNavbar from '../components/ShopNavbar';
import { toast } from 'react-toastify';

const UduuaOrders = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: orders, isLoading, refetch } = useGetMyOrdersQuery(undefined, {
    skip: !userInfo,
  });

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

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

  const getStatusConfig = (order) => {
    const { deliveryStatus, paymentStatus, isPaid, paymentMethod, status } = order;
    
    // Payment rejected
    if (paymentStatus === 'rejected') {
      return {
        label: 'Payment Rejected',
        color: 'bg-red-100 text-red-800',
        icon: FaTimesCircle,
        step: 'rejected',
        showCard: false
      };
    }
    
    // Cancelled
    if (deliveryStatus === 'cancelled' || status === 'cancelled') {
      return {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800',
        icon: FaTimesCircle,
        step: 'cancelled',
        showCard: true
      };
    }
    
    // Delivered
    if (deliveryStatus === 'delivered') {
      return {
        label: 'Delivered',
        color: 'bg-green-100 text-green-800',
        icon: FaCheckCircle,
        step: 'delivered',
        showCard: true
      };
    }
    
    // In Transit
    if (deliveryStatus === 'in_transit') {
      return {
        label: 'In Transit',
        color: 'bg-purple-100 text-purple-800',
        icon: FaTruck,
        step: 'shipped',
        showCard: true
      };
    }
    
    // Dispatched
    if (deliveryStatus === 'dispatched') {
      return {
        label: 'Dispatched',
        color: 'bg-indigo-100 text-indigo-800',
        icon: FaShippingFast,
        step: 'dispatched',
        showCard: true
      };
    }
    
    // Processing
    if (deliveryStatus === 'processing') {
      return {
        label: 'Processing',
        color: 'bg-blue-100 text-blue-800',
        icon: FaSpinner,
        step: 'processing',
        showCard: true
      };
    }
    
    // Payment confirmed but not yet processing
    if (paymentStatus === 'confirmed' && deliveryStatus === 'pending') {
      return {
        label: 'Payment Confirmed',
        color: 'bg-green-100 text-green-800',
        icon: FaCheckCircle,
        step: 'payment_confirmed',
        showCard: true
      };
    }
    
    // Awaiting payment confirmation
    if (paymentStatus === 'awaiting_confirmation') {
      return {
        label: 'Awaiting Payment',
        color: 'bg-yellow-100 text-yellow-800',
        icon: FaClock,
        step: 'payment_pending',
        showCard: true
      };
    }
    
    // Pending payment
    if (paymentStatus === 'pending_payment') {
      return {
        label: 'Pending Payment',
        color: 'bg-yellow-100 text-yellow-800',
        icon: FaClock,
        step: 'pending_payment',
        showCard: true
      };
    }
    
    // Order placed
    return {
      label: 'Order Placed',
      color: 'bg-orange-100 text-orange-800',
      icon: FaBox,
      step: 'placed',
      showCard: true
    };
  };

  const getPaymentStatusConfig = (order) => {
    if (order.paymentStatus === 'rejected') {
      return {
        label: 'Payment Rejected',
        color: 'bg-red-100 text-red-800',
        icon: FaTimesCircle
      };
    }
    
    if (order.isPaid) {
      return {
        label: 'Paid',
        color: 'bg-green-100 text-green-800',
        icon: FaCheckCircle
      };
    }
    
    if (order.paymentStatus === 'awaiting_confirmation') {
      return {
        label: 'Awaiting Confirmation',
        color: 'bg-yellow-100 text-yellow-800',
        icon: FaClock
      };
    }
    
    if (order.paymentMethod === 'ondelivery') {
      return {
        label: 'Pay on Delivery',
        color: 'bg-blue-100 text-blue-800',
        icon: FaMoneyBillWave
      };
    }
    
    if (order.paymentStatus === 'pending_payment') {
      return {
        label: 'Pending Payment',
        color: 'bg-yellow-100 text-yellow-800',
        icon: FaClock
      };
    }
    
    return {
      label: 'Pending',
      color: 'bg-gray-100 text-gray-800',
      icon: FaClock
    };
  };

  const getTimelineSteps = (order) => {
    if (order.paymentStatus === 'rejected' || order.deliveryStatus === 'cancelled' || order.status === 'cancelled') {
      return [];
    }
    
    const steps = [
      { key: 'placed', label: 'Order Placed', completed: true, date: order.createdAt }
    ];
    
    // Payment step
    if (order.paymentMethod !== 'ondelivery') {
      let paymentCompleted = false;
      let paymentDate = null;
      
      if (order.isPaid) {
        paymentCompleted = true;
        paymentDate = order.paidAt;
      } else if (order.paymentStatus === 'confirmed') {
        paymentCompleted = true;
      }
      
      steps.push({
        key: 'payment',
        label: 'Payment',
        completed: paymentCompleted,
        date: paymentDate,
        description: paymentCompleted ? 'Payment confirmed' : 'Awaiting payment'
      });
    }
    
    // Processing step
    const isProcessing = order.deliveryStatus === 'processing' || 
                         order.deliveryStatus === 'dispatched' || 
                         order.deliveryStatus === 'in_transit' || 
                         order.deliveryStatus === 'delivered';
    
    steps.push({
      key: 'processing',
      label: 'Processing',
      completed: isProcessing,
      date: isProcessing ? order.updatedAt : null,
      description: order.deliveryStatus === 'processing' ? 'Your order is being prepared' : 'Order is being processed'
    });
    
    // Dispatched step
    const isDispatched = order.deliveryStatus === 'dispatched' || 
                         order.deliveryStatus === 'in_transit' || 
                         order.deliveryStatus === 'delivered';
    
    steps.push({
      key: 'dispatched',
      label: 'Dispatched',
      completed: isDispatched,
      date: order.deliveryStatus === 'dispatched' ? order.updatedAt : null,
      description: 'Your order has been handed over to the delivery partner'
    });
    
    // In Transit step
    const isInTransit = order.deliveryStatus === 'in_transit' || order.deliveryStatus === 'delivered';
    
    steps.push({
      key: 'shipped',
      label: 'In Transit',
      completed: isInTransit,
      date: order.deliveryStatus === 'in_transit' ? order.updatedAt : null,
      description: 'Your order is on its way to you'
    });
    
    // Delivered step
    steps.push({
      key: 'delivered',
      label: 'Delivered',
      completed: order.deliveryStatus === 'delivered',
      date: order.deliveredAt,
      description: order.buyerConfirmedDelivery ? 'Delivery confirmed by you' : 'Awaiting delivery confirmation'
    });
    
    return steps;
  };

  const handleViewDetails = (order) => {
    if (order.paymentStatus === 'rejected') {
      toast.error('This order has been rejected and cannot be viewed');
      return;
    }
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleCancelClick = (e, order) => {
    e.stopPropagation();
    setOrderToCancel(order);
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      await cancelOrder(orderToCancel._id).unwrap();
      toast.success('Order cancelled successfully');
      setShowCancelConfirm(false);
      setOrderToCancel(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to cancel order');
    }
  };

  const copyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    toast.success('Order ID copied!');
  };

  const canCancelOrder = (order) => {
    return (
      (order.deliveryStatus === 'pending' || order.status === 'order_placed') &&
      !order.isPaid &&
      order.paymentStatus !== 'cancelled' &&
      order.paymentStatus !== 'rejected' &&
      order.deliveryStatus !== 'cancelled'
    );
  };

  if (!userInfo) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FaBox className="text-3xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Login</h2>
            <p className="text-gray-500 mb-6">You need to be logged in to view your orders.</p>
            <button
              onClick={() => navigate('/uduua/shop/login')}
              className="px-6 py-3 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-lg font-medium transition-colors"
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
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        </div>
      </>
    );
  }

  const activeOrders = orders?.filter(order => 
    order.paymentStatus !== 'rejected' && 
    order.deliveryStatus !== 'cancelled' && 
    order.status !== 'cancelled'
  ) || [];
  
  const cancelledOrders = orders?.filter(order => 
    order.deliveryStatus === 'cancelled' || order.status === 'cancelled'
  ) || [];
  
  const rejectedOrders = orders?.filter(order => 
    order.paymentStatus === 'rejected'
  ) || [];

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              My Orders
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Track and manage your orders
            </p>
          </div>

          {/* Active Orders */}
          {activeOrders.length === 0 && rejectedOrders.length === 0 && cancelledOrders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaBox className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
              <button
                onClick={() => navigate('/uduua/shop')}
                className="px-6 py-2.5 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md font-medium transition-colors inline-flex items-center gap-2"
              >
                <FaBox className="text-sm" />
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Active Orders */}
              <div className="space-y-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
                {activeOrders.map((order) => {
                  const statusConfig = getStatusConfig(order);
                  const paymentConfig = getPaymentStatusConfig(order);
                  const StatusIcon = statusConfig.icon;
                  const PaymentIcon = paymentConfig.icon;
                  const showCancel = canCancelOrder(order);
                  
                  return (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Order Header */}
                      <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500">Order ID:</span>
                              <span className="font-mono text-sm font-medium text-gray-900">
                                #{order._id?.slice(-8)}
                              </span>
                              <button
                                onClick={() => copyOrderId(order._id)}
                                className="text-gray-400 hover:text-[#0043FC] transition-colors"
                              >
                                <FaCopy className="text-xs" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaCalendarAlt className="text-[#0043FC]" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${statusConfig.color}`}>
                              <StatusIcon className="text-xs" />
                              {statusConfig.label}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${paymentConfig.color}`}>
                              <PaymentIcon className="text-xs" />
                              {paymentConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="p-4 sm:p-6">
                        <div className="space-y-3">
                          {order.orderItems?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                              <img
                                src={item.image || '/placeholder-product.jpg'}
                                alt={item.name}
                                className="w-20 h-20 rounded-md object-cover bg-gray-50 border border-gray-200"
                                onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  Qty: {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                          {order.orderItems?.length > 2 && (
                            <p className="text-sm text-gray-500 text-center pt-2 border-t border-gray-100">
                              +{order.orderItems.length - 2} more items
                            </p>
                          )}
                        </div>
                        
                        {/* Order Footer */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Total Items: {order.orderItems?.reduce((sum, item) => sum + item.quantity, 0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-xl font-bold text-[#0043FC]">
                              {formatPrice(order.totalPrice)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="flex items-center gap-2 px-4 py-2 border border-[#0043FC] text-[#0043FC] rounded-md hover:bg-[#0043FC] hover:text-white transition-all font-medium text-sm"
                          >
                            <FaEye className="text-xs" />
                            View Details
                          </button>
                          
                          {order.paymentMethod !== 'ondelivery' && !order.isPaid && order.paymentStatus !== 'awaiting_confirmation' && (
                            <button
                              onClick={() => navigate(`/uduua/shop/payment/${order._id}`)}
                              className="flex items-center gap-2 px-4 py-2 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md transition-all font-medium text-sm"
                            >
                              <FaMoneyBillWave className="text-xs" />
                              Make Payment
                            </button>
                          )}
                          
                          {order.deliveryStatus === 'delivered' && !order.buyerConfirmedDelivery && (
                            <button
                              onClick={() => navigate(`/uduua/shop/orders/${order._id}/confirm`)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-all font-medium text-sm"
                            >
                              <FaCheckCircle className="text-xs" />
                              Confirm Delivery
                            </button>
                          )}
                          
                          {showCancel && (
                            <button
                              onClick={(e) => handleCancelClick(e, order)}
                              disabled={isCancelling}
                              className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all font-medium text-sm disabled:opacity-50"
                            >
                              {isCancelling ? (
                                <FaSpinner className="animate-spin text-xs" />
                              ) : (
                                <FaBan className="text-xs" />
                              )}
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cancelled Orders Section */}
              {cancelledOrders.length > 0 && (
                <div className="space-y-4 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900">Cancelled Orders</h2>
                  {cancelledOrders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden opacity-75">
                      <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500">Order ID:</span>
                              <span className="font-mono text-sm font-medium text-gray-900">
                                #{order._id?.slice(-8)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                          
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
                            <FaTimesCircle className="text-xs" />
                            Cancelled
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 sm:p-6">
                        <p className="text-sm text-gray-500 text-center">
                          This order was cancelled on {formatDate(order.updatedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rejected Orders Section */}
              {rejectedOrders.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Rejected Orders</h2>
                  {rejectedOrders.map((order) => (
                    <div key={order._id} className="bg-white border border-red-200 rounded-lg overflow-hidden opacity-75">
                      <div className="p-4 sm:p-6 bg-red-50 border-b border-red-100">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500">Order ID:</span>
                              <span className="font-mono text-sm font-medium text-gray-900">
                                #{order._id?.slice(-8)}
                              </span>
                              <button
                                onClick={() => copyOrderId(order._id)}
                                className="text-gray-400 hover:text-[#0043FC] transition-colors"
                              >
                                <FaCopy className="text-xs" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaCalendarAlt className="text-red-500" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                          
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
                            <FaTimesCircle className="text-xs" />
                            Payment Rejected
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 sm:p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-red-50 rounded-full flex items-center justify-center">
                          <FaExclamationTriangle className="text-2xl text-red-500" />
                        </div>
                        <h3 className="text-base font-semibold text-red-800 mb-1">Payment Rejected</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Your payment for this order was rejected. No items have been processed.
                        </p>
                        <button
                          onClick={() => navigate('/uduua/shop')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md transition-colors text-sm font-medium"
                        >
                          <FaBox className="text-xs" />
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaBan className="text-2xl text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Order?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to cancel order <span className="font-mono font-medium">#{orderToCancel._id?.slice(-8)}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setOrderToCancel(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  No, Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors font-medium disabled:opacity-50"
                >
                  {isCancelling ? (
                    <span className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Cancelling...
                    </span>
                  ) : (
                    'Yes, Cancel Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500 font-mono mt-1">#{selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {/* Order Timeline */}
              {getTimelineSteps(selectedOrder).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Order Timeline</h3>
                  <div className="relative">
                    {getTimelineSteps(selectedOrder).map((step, index) => (
                      <div key={step.key} className="flex items-start gap-3 mb-4 last:mb-0">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
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
                          {step.description && (
                            <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Shipping Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Shipping Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm border border-gray-200">
                  <div className="flex items-start gap-2">
                    <FaUser className="text-[#0043FC] text-sm mt-0.5" />
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.shippingAddress?.fullName}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-[#0043FC] text-sm mt-0.5" />
                    <div>
                      <span className="text-gray-500">Address:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}, {selectedOrder.shippingAddress?.country}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaPhoneAlt className="text-[#0043FC] text-sm mt-0.5" />
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <img src={item.image || '/placeholder-product.jpg'} alt={item.name} className="w-20 h-20 rounded-md object-cover" onError={(e) => { e.target.src = '/placeholder-product.jpg'; }} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(selectedOrder.itemsPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">{selectedOrder.shippingPrice === 0 ? 'Free' : formatPrice(selectedOrder.shippingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-900">{formatPrice(selectedOrder.taxPrice)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-[#0043FC] text-lg">{formatPrice(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-sm">
                    <FaRegCreditCard className="text-[#0043FC]" />
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="text-gray-900 capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>
              
              {/* Delivery Tracking Info */}
              {selectedOrder.deliveryTracking && (selectedOrder.deliveryTracking.riderName || selectedOrder.deliveryTracking.trackingNumber) && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Tracking</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                    {selectedOrder.deliveryTracking.riderName && (
                      <p className="text-sm"><span className="text-gray-500">Rider:</span> <span className="text-gray-900">{selectedOrder.deliveryTracking.riderName}</span></p>
                    )}
                    {selectedOrder.deliveryTracking.riderPhone && (
                      <p className="text-sm"><span className="text-gray-500">Rider Phone:</span> <span className="text-gray-900">{selectedOrder.deliveryTracking.riderPhone}</span></p>
                    )}
                    {selectedOrder.deliveryTracking.trackingNumber && (
                      <p className="text-sm"><span className="text-gray-500">Tracking #:</span> <span className="text-gray-900">{selectedOrder.deliveryTracking.trackingNumber}</span></p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">{selectedOrder.notes}</p>
                </div>
              )}
              
              {/* Help Section */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 text-center border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Need help with this order?</p>
                <a
                  href={`https://wa.me/2348123456789?text=Hello%2C%20I%20need%20help%20with%20order%20${selectedOrder._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <FaWhatsapp />
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UduuaOrders;