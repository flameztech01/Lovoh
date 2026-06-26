// screens/UduuaLogin.jsx – Added brand logos in ecosystem section
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaGoogle,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaKey,
  FaSpinner,
  FaEnvelope,
  FaLock,
  FaShoppingBag,
  FaExclamationTriangle,
  FaClock
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { setCredentials } from '../slices/authslice.js';
import {
  useGoogleAuthMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation
} from '../slices/userApiSlice';

// ========== LEGAL MODAL (Terms & Privacy) ==========
const LegalModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const content = type === 'terms'
    ? {
        title: 'Terms of Service',
        body: `
          <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p>Welcome to Úduua, a platform owned and operated by Lovoh Create. By using our services, you agree to the following terms.</p>
          <h4>1. Acceptance of Terms</h4>
          <p>By creating an account, you agree to comply with these Terms of Service. If you do not agree, please do not use the platform.</p>
          <h4>2. User Accounts</h4>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration.</p>
          <h4>3. Content and Transactions</h4>
          <p>You retain all rights to the content you post. Transactions on Úduua are subject to our payment and refund policies.</p>
          <h4>4. Prohibited Conduct</h4>
          <p>You may not post illegal, harmful, or abusive content. Harassment, spam, and impersonation are strictly forbidden.</p>
          <h4>5. Termination</h4>
          <p>We reserve the right to suspend or terminate accounts that violate these terms or for any other reason at our discretion.</p>
          <h4>6. Disclaimer of Warranties</h4>
          <p>The platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.</p>
          <h4>7. Limitation of Liability</h4>
          <p>Lovoh Create shall not be liable for any indirect, incidental, or consequential damages arising from the use of the platform.</p>
          <h4>8. Changes to Terms</h4>
          <p>We may update these terms periodically. Continued use constitutes acceptance of the updated terms.</p>
          <p><strong>Contact:</strong> For any questions, contact us at support@lovohcreate.com.</p>
        `
      }
    : {
        title: 'Privacy Policy',
        body: `
          <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p>Lovoh Create ("we") values your privacy. This policy explains how we collect, use, and protect your personal information.</p>
          <h4>1. Information We Collect</h4>
          <p>We collect information you provide during registration, such as your name, email address, phone number, and username. We also collect usage data to improve our services.</p>
          <h4>2. How We Use Your Information</h4>
          <p>We use your data to create your account, provide services, send notifications, and improve the platform. We do not sell your data to third parties.</p>
          <h4>3. Data Sharing</h4>
          <p>We may share your information with trusted third-party service providers (e.g., email delivery, analytics) only to operate our services. We ensure they adhere to strict confidentiality.</p>
          <h4>4. Data Security</h4>
          <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is completely secure.</p>
          <h4>5. Cookies and Tracking</h4>
          <p>We use cookies to enhance user experience and analyze traffic. You can control cookie preferences in your browser settings.</p>
          <h4>6. Your Rights</h4>
          <p>You may access, modify, or delete your personal data at any time. Contact us to exercise your rights.</p>
          <h4>7. Children's Privacy</h4>
          <p>Our platform is not intended for children under 13. We do not knowingly collect data from minors.</p>
          <h4>8. Changes to Policy</h4>
          <p>We may update this policy. We will notify you of significant changes.</p>
          <p><strong>Contact:</strong> For privacy inquiries, email privacy@lovohcreate.com.</p>
        `
      };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl animate-fadeInUp">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{content.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 space-y-4">
          <div dangerouslySetInnerHTML={{ __html: content.body }} />
        </div>
        <div className="p-4 border-t border-gray-200 flex-shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN LOGIN COMPONENT ==========
const UduuaLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [login, { isLoading: emailLoading }] = useLoginMutation();
  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();
  const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetLoading }] = useResetPasswordMutation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  // Forgot password modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('email');
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Legal modal state
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState('terms');

  const { userInfo } = useSelector((state) => state.auth);

  const redirect = location.search ? location.search.split('=')[1] : '/shop';

  useEffect(() => {
    if (userInfo && userInfo.token) {
      navigate(redirect, { replace: true });
    }
  }, [userInfo, navigate, redirect]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (loginError) setLoginError('');
    if (isLocked) setIsLocked(false);
  };

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

      // Check for lockout message
      if (errorMessage.toLowerCase().includes('locked') || errorMessage.toLowerCase().includes('too many failed attempts')) {
        setIsLocked(true);

        // Extract lock time from message (e.g., "30 minutes")
        const match = errorMessage.match(/(\d+)\s*minutes?/i);
        if (match) {
          setLockTimeRemaining(parseInt(match[1]));

          // Start countdown timer
          let timeLeft = parseInt(match[1]);
          const timer = setInterval(() => {
            timeLeft--;
            setLockTimeRemaining(timeLeft);
            if (timeLeft <= 0) {
              clearInterval(timer);
              setIsLocked(false);
              setLockTimeRemaining(0);
              toast.info('Account unlocked. You can now try logging in again.', { autoClose: 5000 });
            }
          }, 60000);

          // Store timer to clean up
          window._lockTimer = timer;
        }
      }

      // Display appropriate toast based on error type
      if (errorMessage.toLowerCase().includes('attempts remaining')) {
        toast.error(errorMessage, { autoClose: 8000 });
      } else if (errorMessage.toLowerCase().includes('locked')) {
        toast.error(errorMessage, { autoClose: 10000 });
      } else if (errorMessage.toLowerCase().includes('google')) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Google Account Detected</span>
            <span className="text-sm">This email uses Google Sign-In. Please log in with Google instead.</span>
          </div>,
          { autoClose: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await googleAuth({ token: credential, mode: 'login' }).unwrap();
      if (!res.token) throw new Error('Google auth missing token');
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome back, ${res.name || 'User'}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
      const errorMessage = err?.data?.message || 'Google login failed. Try signing up.';
      setLoginError(errorMessage);
      // Check for lockout
      if (errorMessage.toLowerCase().includes('locked')) {
        setIsLocked(true);
      }
      toast.error(errorMessage);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    setLoginError('Google login failed. Please try again.');
    toast.error('Google login failed. Please try again.');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (!resetEmail.trim()) {
      setResetError('Email is required');
      toast.error('Email is required');
      return;
    }
    try {
      await forgotPassword({ email: resetEmail }).unwrap();
      setModalStep('reset');
      setResetSuccess('OTP sent to your email');
      toast.success('OTP sent to your email');
    } catch (err) {
      const msg = err?.data?.message || 'Failed to send OTP. Try again.';
      setResetError(msg);
      toast.error(msg);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (!otp) {
      setResetError('OTP is required');
      toast.error('OTP is required');
      return;
    }
    if (!newPassword) {
      setResetError('New password is required');
      toast.error('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    try {
      await resetPassword({ email: resetEmail, otp, newPassword }).unwrap();
      setResetSuccess('Password reset successfully. Please log in.');
      toast.success('Password reset successfully. Please log in.');
      // Close modal after short delay
      setTimeout(() => closeModal(), 2000);
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
    setResetSuccess('');
  };

  const openLegalModal = (type) => {
    setLegalModalType(type);
    setLegalModalOpen(true);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (window._lockTimer) {
        clearInterval(window._lockTimer);
      }
    };
  }, []);

  const isLoading = emailLoading || googleLoading;

  // Render lock message if account is locked
  const renderLockMessage = () => {
    if (!isLocked && !loginError?.toLowerCase().includes('locked')) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FaExclamationTriangle className="text-red-500 text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Account Temporarily Locked</p>
            <p className="text-sm text-red-700 mt-1">
              Too many failed login attempts.
              {lockTimeRemaining > 0 && (
                <span className="block mt-1 font-medium">
                  <FaClock className="inline mr-1 text-xs" />
                  Try again in {lockTimeRemaining} minute{lockTimeRemaining !== 1 ? 's' : ''}
                </span>
              )}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Forgot your password? Use the "Forgot Password" link below to reset it.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-white flex overflow-hidden">
      {/* Full Screen Grid - 50/50 Split */}
      <div className="flex flex-1 w-full h-full">

        {/* Left Panel - Image (Full height, no scroll) */}
        <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden bg-gray-900">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&auto=format&fit=crop&q=80"
            alt="Shopping"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

          {/* Top Bar with Logo and Back Button */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 pt-8">
            <img
              src="/uduua.png"
              alt="Úduua Logo"
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
            >
              <FaArrowLeft className="text-xs" />
              <span>Back to Website</span>
            </button>
          </div>

          {/* Bottom Text */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-10 pb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 mb-6">
              <FaShoppingBag className="text-white/60 text-2xl mb-3" />
              <p className="text-white/80 text-sm italic">
                Welcome back to Úduua — your seamless shopping experience awaits.
              </p>
            </div>
            <h2 className="text-white text-4xl font-bold leading-tight mb-3 max-w-md">
              Shop Smarter.<br />Save More.<br />Grow Anywhere.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              From verified brands to bulk pricing, Úduua lets you shop seamlessly across all your devices.
            </p>
            <div className="mt-6 w-10 h-0.5 bg-white/40 rounded-full" />
          </div>
        </div>

        {/* Right Panel - Form (scrollable, spacious) */}
        <div className="w-full lg:w-1/2 h-full bg-gray-50 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button onClick={() => navigate('/shop')} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
                <FaArrowLeft className="text-sm" />
              </button>
              <div className="flex flex-col items-center">
                <img src="/uduua.png" alt="Úduua" className="h-8 w-auto" />
                <span className="text-[10px] text-gray-400 mt-0.5">a Lovoh Create product</span>
              </div>
              <div className="w-9" />
            </div>
          </div>

          {/* Form Container - scrollable, content starts from top */}
          <div className="flex-1 overflow-y-auto px-4 py-6 lg:py-8">
            <div className="max-w-md mx-auto w-full">
              {/* Desktop Header */}
              <div className="hidden lg:block text-center mb-6">
                <div className="w-14 h-14 bg-gray-900/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FaShoppingBag className="text-gray-900 text-2xl" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Sign in to <span className="font-semibold">Úduua</span> — a Lovoh Create product
                </p>
              </div>

              {/* Mobile Title */}
              <div className="lg:hidden text-center mb-5">
                <h1 className="text-xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-500 text-xs mt-1">
                  Sign in with your <span className="font-semibold">Lovoh Create</span> account
                </p>
              </div>

              {/* Lock Message */}
              {renderLockMessage()}

              {/* Login Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email Address *</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLocked}
                        placeholder="you@example.com"
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          loginError && !isLocked ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Password *</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLocked}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          loginError && !isLocked ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLocked}
                      >
                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      disabled={isLocked}
                      className="text-xs text-gray-600 hover:text-gray-900 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {loginError && !isLocked && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-xs">{loginError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || isLocked}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {emailLoading ? <FaSpinner className="animate-spin" /> : null}
                    {emailLoading ? 'Signing in...' : isLocked ? 'Account Locked' : 'Sign In'}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-500">OR</span></div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="pill"
                    width="300"
                  />
                </div>

                {/* 🆕 Lovoh Create ecosystem with brand logos */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-center text-[11px] text-gray-400 mb-3">
                    Your Lovoh Create account works across these platforms:
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    {/* Biizzed */}
                    <div className="flex flex-col items-center gap-1">
                      <img
                        src="/biizzed.png"
                        alt="Biizzed"
                        className="h-7 w-auto object-contain"
                      />
                      <span className="text-[10px] font-medium text-gray-600">Biizzed</span>
                    </div>
                    {/* Úduua */}
                    <div className="flex flex-col items-center gap-1">
                      <img
                        src="/uduua.png"
                        alt="Úduua"
                        className="h-7 w-auto object-contain"
                      />
                      <span className="text-[10px] font-medium text-gray-600">Úduua</span>
                    </div>
                    {/* EventRoom */}
                    <div className="flex flex-col items-center gap-1">
                      <img
                        src="/eventroom.png"
                        alt="EventRoom"
                        className="h-7 w-auto object-contain"
                      />
                      <span className="text-[10px] font-medium text-gray-600">EventRoom</span>
                    </div>
                  </div>
                  <div className="flex justify-center mt-3">
                    <span className="text-[9px] text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                      <span className="font-medium text-gray-400">Lovoh Create</span> — one account, all brands
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-500 mt-5">
                Don't have a Lovoh Create account?{' '}
                <Link to={redirect ? `/shop/signup?redirect=${redirect}` : '/shop/signup'} className="text-gray-900 font-medium hover:underline">
                  Sign up
                </Link>
              </p>

              {/* Terms & Privacy with pop-up links */}
              <p className="text-center text-xs text-gray-400 mt-3 pb-4">
                By continuing, you agree to Úduua's{' '}
                <button
                  onClick={() => openLegalModal('terms')}
                  className="underline hover:text-gray-600 cursor-pointer"
                >
                  Terms
                </button>
                {' and '}
                <button
                  onClick={() => openLegalModal('privacy')}
                  className="underline hover:text-gray-600 cursor-pointer"
                >
                  Privacy Policy
                </button>
                <br />
                <span className="text-[10px] text-gray-300 mt-1 block">
                  © {new Date().getFullYear()} Lovoh Create — All rights reserved.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-fadeInUp">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>

            {modalStep === 'email' ? (
              <div>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gray-900/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaLock className="text-gray-900 text-2xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                  <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you a reset code.</p>
                </div>
                <form onSubmit={handleSendOtp}>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (resetError) setResetError('');
                        if (resetSuccess) setResetSuccess('');
                      }}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="you@example.com"
                    />
                  </div>
                  {resetError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-red-600 text-xs">{resetError}</p>
                    </div>
                  )}
                  {resetSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <p className="text-green-700 text-xs">{resetSuccess}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? <FaSpinner className="animate-spin" /> : null}
                    {forgotLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gray-900/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaEnvelope className="text-gray-900 text-2xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Set New Password</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the 6-digit code sent to <strong>{resetEmail}</strong>
                  </p>
                </div>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">OTP Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        if (resetError) setResetError('');
                        if (resetSuccess) setResetSuccess('');
                      }}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 text-center tracking-widest"
                      placeholder="123456"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (resetError) setResetError('');
                          if (resetSuccess) setResetSuccess('');
                        }}
                        required
                        className="w-full pr-10 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                    <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (resetError) setResetError('');
                        if (resetSuccess) setResetSuccess('');
                      }}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {resetError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-red-600 text-xs">{resetError}</p>
                    </div>
                  )}
                  {resetSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <p className="text-green-700 text-xs">{resetSuccess}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
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

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalModalType}
      />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.28s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UduuaLogin;