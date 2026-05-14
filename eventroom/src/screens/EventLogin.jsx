// screens/EventLogin.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authslice';
import { useGoogleAuthMutation, useLoginMutation } from '../slices/userApiSlice';
import { toast } from 'react-toastify';
import {
  FaGoogle,
  FaArrowLeft,
  FaCalendarAlt,
  FaTicketAlt,
  FaSpinner,
  FaEnvelope,
  FaKey,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EventLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { userInfo } = useSelector((state) => state.auth);

  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();
  const [login, { isLoading: loginLoading }] = useLoginMutation();

  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...result }));
      toast.success(`Welcome back, ${result.name}!`);
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || 'Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const auth2 = window.google?.accounts?.id;
      if (!auth2) {
        toast.error('Google Sign-In is not available. Please try again later.');
        return;
      }

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
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-8 transition-colors text-sm group"
        >
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
          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-6"
            >
              {loginLoading ? (
                <FaSpinner className="w-5 h-5 animate-spin" />
              ) : (
                <FaEnvelope className="w-5 h-5" />
              )}
              <span>{loginLoading ? 'Signing in...' : 'Sign In with Email'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">or sign in with</span>
            </div>
          </div>

          {/* Google Login */}
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

          {/* Benefits */}
          <div className="mt-6 space-y-3">
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
          <Link
            to={`/signup${redirect ? `?redirect=${redirect}` : ''}`}
            className="text-[#1B3766] font-semibold hover:underline"
          >
            Create one here
          </Link>
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default EventLogin;