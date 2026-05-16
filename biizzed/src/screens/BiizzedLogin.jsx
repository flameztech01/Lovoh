// screens/BiizzedLogin.jsx – With forgot password modal
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useLoginMutation, 
  useGoogleAuthMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '../slices/userApiSlice';
import { setCredentials } from '../slices/authslice';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import {
  FaArrowLeft, FaSpinner, FaNewspaper, FaEnvelope, FaLock,
  FaEye, FaEyeSlash, FaTimes,
} from 'react-icons/fa';

const BiizzedLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const [login, { isLoading: emailLoading }] = useLoginMutation();
  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();
  const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetLoading }] = useResetPasswordMutation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Forgot password modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('email'); // 'email' or 'reset'
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/feed';

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
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome back, ${res.name || 'User'}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
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
      toast.error(err?.data?.message || 'Google login failed. Try signing up.');
    }
  };

  const handleGoogleError = () => toast.error('Google login failed. Please try again.');

  // ----- Forgot Password Flow -----
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Email is required');
      return;
    }
    setResetError('');
    try {
      await forgotPassword({ email: resetEmail }).unwrap();
      setModalStep('reset');
      toast.success('OTP sent to your email');
    } catch (err) {
      const msg = err?.data?.message || 'Failed to send OTP. Try again.';
      setResetError(msg);
      toast.error(msg);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) {
      setResetError('OTP is required');
      return;
    }
    if (!newPassword) {
      setResetError('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    setResetError('');
    try {
      await resetPassword({ email: resetEmail, otp, newPassword }).unwrap();
      toast.success('Password reset successfully. Please log in.');
      setShowModal(false);
      // Reset modal state
      setModalStep('email');
      setResetEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err?.data?.message || 'Reset failed. Invalid OTP or expired.';
      setResetError(msg);
      toast.error(msg);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalStep('email');
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
  };

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
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaNewspaper className="text-[#1B3766] text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2 text-sm">Sign in to continue to Biizzed</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] ${loginError ? 'border-red-300' : 'border-gray-200'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] ${loginError ? 'border-red-300' : 'border-gray-200'}`}
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
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-xs text-[#1B3766] hover:underline"
                >
                  Forgot password?
                </button>
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-500">OR</span></div>
            </div>

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

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to={redirect ? `/signup?redirect=${redirect}` : '/signup'} className="text-[#1B3766] font-medium hover:underline">Sign up</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to Biizzed's{' '}
            <Link to="/terms" className="underline">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>

            {modalStep === 'email' ? (
              // Step 1: Enter Email
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
                <p className="text-sm text-gray-500 mb-4">Enter your email and we'll send you a reset code.</p>
                <form onSubmit={handleSendOtp}>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      placeholder="you@example.com"
                    />
                  </div>
                  {resetError && <p className="text-red-500 text-xs mb-3">{resetError}</p>}
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? <FaSpinner className="animate-spin" /> : null}
                    {forgotLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              </div>
            ) : (
              // Step 2: Enter OTP and New Password
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Set New Password</h2>
                <p className="text-sm text-gray-500 mb-4">Enter the 6‑digit code sent to {resetEmail}</p>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">OTP Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      placeholder="123456"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full pr-10 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                        placeholder="•••••••• (min 6 chars)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {resetError && <p className="text-red-500 text-xs mb-3">{resetError}</p>}
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? <FaSpinner className="animate-spin" /> : null}
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BiizzedLogin;