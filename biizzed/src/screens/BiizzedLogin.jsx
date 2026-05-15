// screens/BiizzedLogin.jsx - Email/Password + Google Sign-In (fixed navigation & error handling)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useGoogleAuthMutation } from '../slices/userApiSlice';
import { setCredentials } from '../slices/authslice';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import {
  FaArrowLeft, FaSpinner, FaNewspaper, FaEnvelope, FaLock,
  FaEye, FaEyeSlash,
} from 'react-icons/fa';

const BiizzedLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const [login, { isLoading: emailLoading }] = useLoginMutation();
  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Parse redirect URL from query params
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/feed';

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo && userInfo.token) {
      navigate(redirect, { replace: true });
    }
  }, [userInfo, navigate, redirect]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (loginError) setLoginError('');
  };

  // Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim()) {
      setLoginError('Email address is required');
      toast.error('Email address is required');
      return;
    }
    if (!password.trim()) {
      setLoginError('Password is required');
      toast.error('Password is required');
      return;
    }

    setLoginError('');

    try {
      const res = await login({ email, password }).unwrap();

      if (!res.token) throw new Error('Invalid response: missing token');
      if (!res._id || !res.email) throw new Error('Invalid response: missing user data');

      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome back, ${res.name || 'User'}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.data?.message || err?.message || 'Login failed. Check your credentials.';
      setLoginError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Google Login
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await googleAuth({ token: credential, mode: 'login' }).unwrap();

      if (!res.token) throw new Error('Google auth missing token');

      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome back, ${res.name || 'User'}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error('Google login error:', err);
      const errorMessage = err?.data?.message || 'Google login failed. Try signing up.';
      toast.error(errorMessage);
    }
  };

  const handleGoogleError = () => toast.error('Google login failed. Please try again.');

  const isLoading = emailLoading || googleLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <FaArrowLeft className="text-sm" />
          </button>
          <img src="/biizzed.png" alt="Biizzed" className="h-8 w-auto" />
          <div className="w-9" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaNewspaper className="text-[#1B3766] text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2 text-sm">Sign in to continue to Biizzed</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] ${
                      loginError ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] ${
                      loginError ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-[#1B3766] hover:underline">
                  Forgot password?
                </Link>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-xs">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {emailLoading ? <FaSpinner className="animate-spin" /> : null}
                {emailLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="flex justify-center">
              {googleLoading ? (
                <div className="flex items-center gap-3 px-8 py-3 bg-gray-100 rounded-xl">
                  <FaSpinner className="animate-spin text-[#1B3766]" />
                  <span className="text-gray-600 text-sm">Signing in...</span>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="pill"
                  width="300"
                />
              )}
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                to={redirect ? `/signup?redirect=${redirect}` : '/signup'}
                className="text-[#1B3766] font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to Biizzed's{' '}
            <Link to="/terms" className="underline">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BiizzedLogin;