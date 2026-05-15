// screens/UduuaPaymentPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowLeft,
  FaCreditCard,
  FaMoneyBillWave,
  FaBuilding,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaWhatsapp,
  FaShieldAlt,
  FaClock,
  FaBox,
} from 'react-icons/fa';
import { useGetOrderByIdQuery, useReinitializePaymentMutation } from '../slices/orderApiSlice';
import { toast } from 'react-toastify';
import ShopNavbar from '../components/ShopNavbar';

const UduuaPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paystack');

  const { data: order, isLoading, error, refetch } = useGetOrderByIdQuery(id, {
    skip: !id || !userInfo,
  });

  const [reinitializePayment, { isLoading: isReinitializing }] = useReinitializePaymentMutation();

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

  const handlePayment = async () => {
    if (!order) return;

    if (order.isPaid) {
      toast.error('This order has already been paid for');
      navigate(`/shop/orders/${id}`);
      return;
    }

    if (order.status === 'cancelled') {
      toast.error('This order has been cancelled');
      navigate('/shop/orders');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await reinitializePayment({ 
        orderId: id, 
        paymentMethod: selectedPaymentMethod 
      }).unwrap();

      if (result.paymentUrl) {
        sessionStorage.setItem('pending_order_id', id);
        sessionStorage.setItem('payment_reference', result.paymentReference);
        window.location.href = result.paymentUrl;
      } else if (selectedPaymentMethod === 'ondelivery') {
        toast.success('Order updated to Pay on Delivery. You will pay when you receive your order.');
        navigate(`/shop/orders/${id}`);
      } else {
        toast.error('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error(error?.data?.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    toast.success('Order ID copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const bankDetails = {
    bankName: 'OPay Digital Bank',
    accountName: 'Lovoh',
    accountNumber: '8123456789',
    bankCode: '999992'
  };

  const copyBankDetails = () => {
    const details = `Bank: ${bankDetails.bankName}\nAccount Name: ${bankDetails.accountName}\nAccount Number: ${bankDetails.accountNumber}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    toast.success('Bank details copied!');
    setTimeout(() => setCopied(false), 3000);
  };

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
            <p className="text-gray-500 mb-6">You need to be logged in to make a payment.</p>
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
            <p className="text-gray-500 mb-6">The order you're trying to pay for doesn't exist.</p>
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

  if (order.isPaid) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-3xl text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Already Paid</h2>
            <p className="text-gray-500 mb-6">This order has already been paid for.</p>
            <button
              onClick={() => navigate(`/shop/orders/${id}`)}
              className="px-6 py-2.5 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-md font-medium transition-colors"
            >
              View Order
            </button>
          </div>
        </div>
      </>
    );
  }

  if (order.status === 'cancelled') {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <FaTimesCircle className="text-3xl text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Cancelled</h2>
            <p className="text-gray-500 mb-6">This order has been cancelled and cannot be paid for.</p>
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

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/shop/orders/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-6 transition-colors group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Order</span>
          </button>

          {/* Order Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium text-gray-900">#{order._id?.slice(-8)}</p>
                  <button onClick={copyOrderId} className="text-gray-400 hover:text-[#0043FC]">
                    <FaCopy className="text-xs" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Order Date</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatPrice(order.taxPrice)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-[#0043FC]">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <FaClock className="text-yellow-600" />
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium text-yellow-700 capitalize">
                  {order.paymentStatus?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCreditCard className="text-[#0043FC]" />
              Select Payment Method
            </h2>

            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                selectedPaymentMethod === 'paystack'
                  ? 'border-[#0043FC] bg-[#0043FC]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paystack"
                  checked={selectedPaymentMethod === 'paystack'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mt-1 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FaCreditCard className="text-[#0043FC]" />
                    <span className="font-medium text-gray-900">Pay with Card</span>
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Popular</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Secure payment via card, bank transfer, or USSD</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                selectedPaymentMethod === 'ondelivery'
                  ? 'border-[#0043FC] bg-[#0043FC]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ondelivery"
                  checked={selectedPaymentMethod === 'ondelivery'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mt-1 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-600" />
                    <span className="font-medium text-gray-900">Pay on Delivery</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                selectedPaymentMethod === 'onsite'
                  ? 'border-[#0043FC] bg-[#0043FC]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="onsite"
                  checked={selectedPaymentMethod === 'onsite'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mt-1 text-[#0043FC] focus:ring-[#0043FC]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FaBuilding className="text-blue-600" />
                    <span className="font-medium text-gray-900">Bank Transfer</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Manual bank transfer to our account</p>
                </div>
              </label>
            </div>
          </div>

          {/* Bank Transfer Details */}
          {selectedPaymentMethod === 'onsite' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaBuilding className="text-[#0043FC]" />
                Bank Transfer Details
              </h3>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Bank Name</p>
                    <p className="font-medium text-gray-900">{bankDetails.bankName}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Account Name</p>
                    <p className="font-medium text-gray-900">{bankDetails.accountName}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Account Number</p>
                    <p className="font-medium text-gray-900 text-lg">{bankDetails.accountNumber}</p>
                  </div>
                  <button
                    onClick={copyBankDetails}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#0043FC]/10 text-[#0043FC] rounded-lg text-sm hover:bg-[#0043FC]/20 transition-colors"
                  >
                    <FaCopy className="text-xs" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  After making the transfer, please contact support to confirm your payment.
                </p>
              </div>
            </div>
          )}

          {/* Pay Now Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Total to Pay</p>
                <p className="text-2xl font-bold text-[#0043FC]">{formatPrice(order.totalPrice)}</p>
              </div>
              <button
                onClick={handlePayment}
                disabled={isProcessing || isReinitializing}
                className="w-full sm:w-auto px-8 py-3 bg-[#0043FC] hover:bg-[#0033cc] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing || isReinitializing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    {selectedPaymentMethod === 'ondelivery' ? 'Place Order (Pay on Delivery)' : 'Pay Now'}
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <FaShieldAlt className="text-[#0043FC]" />
                <span>Secure payment processed by Paystack</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-2">Need help with payment?</p>
              <a
                href="https://wa.me/2348123456789?text=Hello%2C%20I%20need%20help%20with%20payment%20for%20order%20"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                <FaWhatsapp />
                Contact Support on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UduuaPaymentPage;