// screens/UduuaConfirmOrder.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaCheckCircle,
  FaSpinner,
  FaTruck,
  FaBox,
  FaClock,
  FaArrowLeft,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaThumbsUp
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useGetOrderByIdQuery, useConfirmDeliveryMutation } from '../slices/orderApiSlice';
import ShopNavbar from '../components/ShopNavbar';

const UduuaConfirmOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: order, isLoading, error } = useGetOrderByIdQuery(id, {
    skip: !id || !userInfo,
  });
  
  const [confirmDelivery, { isLoading: isConfirming }] = useConfirmDeliveryMutation();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (order && order.isDelivered) {
      setIsConfirmed(true);
    }
  }, [order]);

  useEffect(() => {
    if (isConfirmed && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isConfirmed && countdown === 0) {
      navigate('/uduua/shop/orders');
    }
  }, [isConfirmed, countdown, navigate]);

  const formatPrice = (price) => {
    if (!price) return "₦0";
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
      month: 'long',
      day: 'numeric'
    });
  };

  const handleConfirmDelivery = async () => {
    if (!userInfo) {
      toast.error('Please login to confirm delivery');
      navigate('/uduua/shop/login');
      return;
    }

    try {
      await confirmDelivery(id).unwrap();
      setIsConfirmed(true);
      toast.success('Delivery confirmed! Thank you for shopping with us.');
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to confirm delivery. Please try again.');
    }
  };

  if (!userInfo) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FaBox className="text-3xl text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Login</h2>
            <p className="text-gray-500 mb-4">You need to be logged in to confirm delivery.</p>
            <button
              onClick={() => navigate('/uduua/shop/login')}
              className="px-6 py-2.5 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-all"
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
            <FaSpinner className="text-4xl text-[#0043FC] animate-spin mx-auto mb-4" />
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
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <FaBox className="text-3xl text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/uduua/shop/orders')}
              className="px-6 py-2.5 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-all"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </>
    );
  }

  // Check if order can be confirmed
  const canConfirm = order.status === 'delivered' && !order.isDelivered;
  const isAlreadyConfirmed = order.isDelivered;

  if (isConfirmed || isAlreadyConfirmed) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <FaCheckCircle className="text-5xl text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for confirming your order delivery. We hope you enjoy your purchase!
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
              <p className="text-sm text-green-700">
                Your order has been marked as delivered. If you have any issues with your order, please contact our support team.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/uduua/shop/orders')}
                className="px-6 py-3 bg-[#0043FC] text-white rounded-xl font-semibold hover:bg-[#0038D4] transition-all"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/uduua/shop')}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-[#0043FC] hover:text-[#0043FC] transition-all"
              >
                Continue Shopping
              </button>
            </div>
            {countdown > 0 && countdown < 5 && (
              <p className="text-sm text-gray-400 mt-4">
                Redirecting to orders in {countdown} seconds...
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  if (!canConfirm) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <FaClock className="text-3xl text-yellow-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cannot Confirm Delivery Yet</h2>
            <p className="text-gray-500 mb-4">
              {order.status === 'order_placed' && 'Your order is still being processed.'}
              {order.status === 'in_transit' && 'Your order is on the way. Please wait until it is marked as delivered.'}
              {order.status === 'cancelled' && 'This order has been cancelled.'}
              {!order.status && 'This order cannot be confirmed at this time.'}
            </p>
            <button
              onClick={() => navigate(`/uduua/shop/orders/${id}`)}
              className="px-6 py-2.5 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-all"
            >
              View Order Details
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/uduua/shop/orders/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-6 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Order</span>
          </button>

          {/* Confirmation Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0043FC] p-6 text-white text-center">
              <FaTruck className="text-5xl mx-auto mb-3" />
              <h1 className="text-2xl font-bold">Confirm Delivery</h1>
              <p className="text-blue-100 mt-1">Order #{order._id?.slice(-8)}</p>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Order Summary */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaBox className="text-[#0043FC]" />
                  Order Summary
                </h2>
                
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order Date</span>
                    <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-bold text-[#0043FC]">{formatPrice(order.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="font-medium text-gray-900">
                      {order.paymentMethod === 'ondelivery' ? 'Pay on Delivery' : 
                       order.paymentMethod === 'onsite' ? 'On-site Payment' : 'Off-site Payment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Items Received</h2>
                <div className="space-y-3">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="bg-blue-50 rounded-xl p-4 mb-8 border border-blue-100">
                <div className="flex items-start gap-3">
                  <FaThumbsUp className="text-[#0043FC] text-xl mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Have you received your order?</h3>
                    <p className="text-sm text-gray-600">
                      Please confirm that you have received all items in good condition. 
                      Once confirmed, your order will be marked as complete.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleConfirmDelivery}
                  disabled={isConfirming}
                  className="flex-1 py-3 bg-[#0043FC] text-white rounded-xl font-semibold hover:bg-[#0038D4] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isConfirming ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Yes, I Received My Order
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate(`/uduua/shop/orders/${id}`)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-[#0043FC] hover:text-[#0043FC] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaArrowLeft />
                  View Order Details
                </button>
              </div>

              {/* Report Issue */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive your order or have issues?{' '}
                  <a
                    href={`https://wa.me/2347059585905?text=Hello%2C%20I%20have%20an%20issue%20with%20order%20${order._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0043FC] hover:underline inline-flex items-center gap-1"
                  >
                    <FaWhatsapp />
                    Report Issue
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0043FC]/10 rounded-full flex items-center justify-center">
                  <FaPhone className="text-[#0043FC]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Need Help?</p>
                  <p className="text-xs text-gray-500">Contact our support team</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/2347059585905"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                >
                  <FaWhatsapp />
                  WhatsApp
                </a>
                <a
                  href="mailto:support@lovohcreate.com"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:border-[#0043FC] hover:text-[#0043FC] transition"
                >
                  <FaEnvelope />
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UduuaConfirmOrder;