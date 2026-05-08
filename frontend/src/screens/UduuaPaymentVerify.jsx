// screens/UduuaPaymentVerify.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaShoppingBag } from 'react-icons/fa';
import { useVerifyPaymentQuery } from '../slices/orderApiSlice';
import ShopNavbar from '../components/ShopNavbar';
import { toast } from 'react-toastify';

const UduuaPaymentVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [countdown, setCountdown] = useState(5);
  
  const queryParams = new URLSearchParams(location.search);
  const reference = queryParams.get('reference') || queryParams.get('trxref');
  const orderId = queryParams.get('orderId');

  const { data, error, isLoading } = useVerifyPaymentQuery(reference, {
    skip: !reference,
  });

  useEffect(() => {
    if (!reference) {
      setVerificationStatus('failed');
      toast.error('No payment reference found');
      setTimeout(() => navigate('/uduua/shop/orders'), 3000);
      return;
    }

    if (data) {
      if (data.status === 'success') {
        setVerificationStatus('success');
        toast.success('Payment verified successfully!');
      } else if (data.status === 'already_paid') {
        setVerificationStatus('already_paid');
        toast.info('This order has already been paid for.');
      } else {
        setVerificationStatus('failed');
        toast.error('Payment verification failed');
      }
    }

    if (error) {
      setVerificationStatus('failed');
      toast.error(error?.data?.message || 'Payment verification failed');
    }
  }, [data, error, reference, navigate]);

  // Countdown and redirect
  useEffect(() => {
    if (verificationStatus !== 'verifying') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (orderId) {
              navigate(`/uduua/shop/orders/${orderId}`);
            } else {
              navigate('/uduua/shop/orders');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [verificationStatus, orderId, navigate]);

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 pt-32 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {verificationStatus === 'verifying' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <FaSpinner className="text-3xl text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
              <p className="text-gray-500">Please wait while we verify your payment...</p>
              {isLoading && <p className="text-xs text-gray-400 mt-4">Checking with Paystack...</p>}
            </>
          )}
          
          {verificationStatus === 'success' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-500 mb-2">Your payment has been confirmed successfully.</p>
              <p className="text-sm text-gray-400">Redirecting to your order in {countdown} seconds...</p>
            </>
          )}
          
          {verificationStatus === 'already_paid' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-3xl text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Paid</h2>
              <p className="text-gray-500 mb-2">This order has already been paid for.</p>
              <p className="text-sm text-gray-400">Redirecting to your order in {countdown} seconds...</p>
            </>
          )}
          
          {verificationStatus === 'failed' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <FaTimesCircle className="text-3xl text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-500 mb-2">We couldn't verify your payment status.</p>
              <p className="text-sm text-gray-500 mb-4">Please check your email for confirmation or contact support.</p>
              <p className="text-sm text-gray-400">Redirecting to orders page in {countdown} seconds...</p>
            </>
          )}
          
          <button
            onClick={() => navigate('/uduua/shop')}
            className="mt-6 inline-flex items-center gap-2 text-[#0043FC] hover:text-[#0033cc] text-sm font-medium"
          >
            <FaShoppingBag className="text-sm" /> Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
};

export default UduuaPaymentVerify;