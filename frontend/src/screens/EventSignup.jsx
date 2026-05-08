// screens/EventSignup.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authslice';
import { useGoogleAuthMutation } from '../slices/userApiSlice';
import { toast } from 'react-toastify';
import { FaGoogle, FaArrowLeft, FaCalendarAlt, FaTicketAlt, FaChartBar, FaWallet, FaSpinner } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EventSignup = () => {
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { userInfo } = useSelector((state) => state.auth);

  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();

  const redirect = searchParams.get('redirect') || '/events/dashboard';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  const handleGoogleSignup = async () => {
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    try {
      const auth2 = window.google?.accounts?.id;
      if (!auth2) {
        toast.error('Google Sign-In is not available. Please try again later.');
        return;
      }

      // Request Google token
      const token = await new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: (response) => {
            if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error('Google authentication failed'));
            }
          },
        });
        client.requestAccessToken();
      });

      // Send to backend
      const result = await googleAuth({
        token,
        phone,
        mode: 'signup',
      }).unwrap();

      dispatch(setCredentials({ ...result }));
      toast.success('Account created successfully! Welcome!');
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || 'Signup failed');
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // Don't format if empty
    if (cleaned.length === 0) return '';
    
    // Format Nigerian number
    if (cleaned.startsWith('234')) {
      cleaned = '0' + cleaned.slice(3);
    }
    
    if (cleaned.length <= 11) {
      return cleaned;
    }
    
    return cleaned.slice(0, 11);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-16 pt-24">
        {/* Back Button */}
        <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-8 transition-colors text-sm group">
          <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
            <FaCalendarAlt className="text-[#1B3766] text-sm" />
            <span className="text-[#1B3766] font-semibold text-xs uppercase tracking-wider">
              Event Creator
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-500 text-sm">
            Start creating and managing events in minutes
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="08012345678"
              maxLength={11}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Nigerian phone number (11 digits)</p>
          </div>

          {/* Google Signup Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {googleLoading ? (
              <FaSpinner className="w-5 h-5 animate-spin" />
            ) : (
              <FaGoogle className="w-5 h-5" />
            )}
            <span>{googleLoading ? 'Creating account...' : 'Sign Up with Google'}</span>
          </button>

          {/* Terms */}
          <div className="mt-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 text-[#1B3766] focus:ring-[#1B3766] rounded"
              />
              <span className="text-xs text-gray-500">
                I agree to the Terms of Service and Privacy Policy. I understand that paid events require wallet setup.
              </span>
            </label>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">What you get</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaTicketAlt className="text-[#1B3766] flex-shrink-0" />
              <span>Create and publish events for free</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaChartBar className="text-[#1B3766] flex-shrink-0" />
              <span>Real-time registration tracking</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaWallet className="text-[#1B3766] flex-shrink-0" />
              <span>Set up wallet for paid events (80% earnings)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaCalendarAlt className="text-[#1B3766] flex-shrink-0" />
              <span>Ticket generation and check-in system</span>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to={`/events/login${redirect ? `?redirect=${redirect}` : ''}`} className="text-[#1B3766] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default EventSignup;