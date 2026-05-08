// screens/EventLogin.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authslice';
import { useGoogleAuthMutation } from '../slices/userApiSlice';
import { toast } from 'react-toastify';
import { FaGoogle, FaArrowLeft, FaCalendarAlt, FaTicketAlt, FaSpinner } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EventLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleGoogleLogin = async () => {
    try {
      // Initialize Google Sign-In
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
        mode: 'login',
      }).unwrap();

      dispatch(setCredentials({ ...result }));
      toast.success(`Welcome back, ${result.name}!`);
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || 'Google login failed');
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm">
            Sign in to manage your events and track registrations
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-[#1B3766] hover:text-[#1B3766] hover:bg-blue-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <FaSpinner className="w-5 h-5 animate-spin" />
            ) : (
              <FaGoogle className="w-5 h-5" />
            )}
            <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">Quick & secure</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaTicketAlt className="text-[#1B3766] flex-shrink-0" />
              <span>Create and manage events</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaCalendarAlt className="text-[#1B3766] flex-shrink-0" />
              <span>Track registrations in real-time</span>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to={`/events/signup${redirect ? `?redirect=${redirect}` : ''}`} className="text-[#1B3766] font-semibold hover:underline">
            Create one here
          </Link>
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default EventLogin;