// screens/BiizzedLogin.jsx
// Full-screen Login: Left random articles slider | Right form (scrollable, spacious)
// Matching the Signup page design exactly with Capacitor browser support

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import {
  FaArrowLeft, FaSpinner, FaNewspaper,
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle,
  FaTimes, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark,
  FaRegComment, FaQuoteLeft,
} from 'react-icons/fa';
import { useGetArticlesQuery } from '../slices/articlesApiSlice';

// ========== RANDOM ARTICLES SLIDER COMPONENT (Full height) ==========
const ArticlesSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const intervalRef = useRef(null);

  const { data: articlesData, isLoading } = useGetArticlesQuery({
    status: 'published',
    page: 1,
    limit: 10,
    sort: '-createdAt',
  });

  const articles = articlesData?.articles || [];
  const [randomizedArticles, setRandomizedArticles] = useState([]);

  useEffect(() => {
    if (articles.length > 0) {
      const shuffled = [...articles];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setRandomizedArticles(shuffled.slice(0, 5));
    }
  }, [articles]);

  useEffect(() => {
    if (randomizedArticles.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % randomizedArticles.length);
      }, 8000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [randomizedArticles.length]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % randomizedArticles.length);
      }, 8000);
    }
  }, [randomizedArticles.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? randomizedArticles.length - 1 : prev - 1));
    resetTimer();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % randomizedArticles.length);
    resetTimer();
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (isLoading || randomizedArticles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FaSpinner className="text-4xl text-white/50 animate-spin mb-4" />
        <p className="text-white/60 text-sm">Loading inspiring stories...</p>
      </div>
    );
  }

  const currentArticle = randomizedArticles[currentIndex];
  const fallbackImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format';

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        key={currentArticle._id}
        className="absolute inset-0 transition-opacity duration-700 ease-in-out animate-fadeIn"
      >
        <div className="absolute inset-0">
          <img
            src={currentArticle.featuredImage || fallbackImage}
            alt={currentArticle.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = fallbackImage; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-6 pb-12">
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              <FaNewspaper className="text-[10px]" />
              Article
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2 line-clamp-3">
            {currentArticle.title}
          </h2>

          {currentArticle.excerpt && (
            <p className="text-white/80 text-sm mb-4 line-clamp-2">
              {currentArticle.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 text-white/70 text-xs mb-4">
            <span>By {currentArticle.author || 'Biizzed Creator'}</span>
            <span>•</span>
            <span>{Math.ceil((currentArticle.content?.length || 1000) / 1000)} min read</span>
          </div>

          <div className="flex items-center gap-4 text-white/60 text-xs">
            <span className="flex items-center gap-1">
              <FaRegHeart /> {(currentArticle.likesCount || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <FaRegComment /> {(currentArticle.comments?.length || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <FaRegBookmark /> {(currentArticle.bookmarks?.length || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {randomizedArticles.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full items-center justify-center text-white transition-colors z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full items-center justify-center text-white transition-colors z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {randomizedArticles.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {randomizedArticles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); resetTimer(); }}
              className={`transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 h-1.5 bg-white rounded-full'
                  : 'w-1.5 h-1.5 bg-white/50 rounded-full hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute top-8 left-6 right-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <FaQuoteLeft className="text-white/40 text-xl mb-2" />
          <p className="text-white/80 text-sm italic">
            Welcome back to Biizzed — continue your creative journey.
          </p>
        </div>
      </div>
    </div>
  );
};

// ========== GOOGLE LOGIN BUTTON COMPONENT (Works with Capacitor) ==========
const GoogleLoginButton = ({ onSuccess, onError, isLoading }) => {
  const isNative = Capacitor.isNativePlatform();

  // For web platform, use the standard GoogleLogin button
  if (!isNative) {
    return (
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="outline"
          size="large"
          text="continue_with"
          shape="pill"
          width="300"
        />
      </div>
    );
  }

  // For native platform, open Google Sign-In in browser
  const handleNativeGoogleLogin = async () => {
    try {
      // Get your Google OAuth URL
      const clientId = '423161329900-6rifobklf0pl8l6hfjnct8ek8qbo4gou.apps.googleusercontent.com';
      const redirectUri = 'https://biizzed.lovohcreate.com/auth/google/callback'; // Update with your redirect URI
      const scope = 'email profile';
      const responseType = 'token id_token';
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&nonce=${Math.random().toString(36)}`;
      
      // Open Google Sign-In in browser
      await Browser.open({
        url: googleAuthUrl,
        presentationStyle: 'popover',
        toolbarColor: '#1B3766',
      });
      
      toast.info('Please complete sign-in in the browser window');
      
    } catch (error) {
      console.error('Native Google Sign-In Error:', error);
      toast.error('Failed to open Google Sign-In. Please try again.');
    }
  };

  return (
    <button
      onClick={handleNativeGoogleLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
    >
      {isLoading ? (
        <FaSpinner className="animate-spin text-[#1B3766]" />
      ) : (
        <FaGoogle className="text-[#4285F4] text-lg" />
      )}
      <span className="text-gray-700 font-medium">
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </span>
    </button>
  );
};

// ========== LEGAL MODAL (Terms & Privacy) ==========
const LegalModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const content = type === 'terms' ? {
    title: 'Terms of Service',
    body: `
      <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p>Welcome to Biizzed, a platform owned and operated by Lovoh Create. By using our services, you agree to the following terms.</p>
      <h4>1. Acceptance of Terms</h4>
      <p>By creating an account, you agree to comply with these Terms of Service. If you do not agree, please do not use the platform.</p>
      <h4>2. User Accounts</h4>
      <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration.</p>
      <h4>3. Content Ownership</h4>
      <p>You retain all rights to the content you publish. By posting, you grant Lovoh Create a non-exclusive license to display and distribute your content through the platform.</p>
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
  } : {
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
            className="px-6 py-2 bg-[#1B3766] text-white rounded-xl hover:bg-[#142952] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN LOGIN COMPONENT ==========
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

  const redirect = location.search?.split('=')[1] || '/feed';

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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await googleAuth({ token: credential, mode: 'login' }).unwrap();
      if (!res.token) throw new Error('Google auth missing token');
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome back, ${res.name || 'User'}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err?.data?.message || 'Google login failed. Try signing up.';
      setLoginError(msg);
      toast.error(msg);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    const msg = 'Google login failed. Please try again.';
    setLoginError(msg);
    toast.error(msg);
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
      // Close modal after a short delay
      setTimeout(() => {
        closeModal();
      }, 2000);
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

  const isLoading = emailLoading || googleLoading;

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row">
      {/* LEFT SIDE - RANDOM ARTICLES SLIDER (Desktop only, full height) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#1B3766] h-full">
        <ArticlesSlider />
      </div>

      {/* RIGHT SIDE - LOGIN FORM (Full height, scrollable, spacious) */}
      <div className="flex-1 h-full bg-gray-50 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
              <FaArrowLeft className="text-sm" />
            </button>
            <div className="flex flex-col items-center">
              <img src="/biizzed.png" alt="Biizzed" className="h-8 w-auto" />
              <span className="text-[10px] text-gray-400 mt-0.5">a Lovoh Create product</span>
            </div>
            <div className="w-9" />
          </div>
        </div>

        {/* Form Container - scrollable, content starts from top */}
        <div className="flex-1 flex flex-col px-4 py-6 lg:py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-6">
              <div className="w-14 h-14 bg-[#1B3766]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaNewspaper className="text-[#1B3766] text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to <span className="font-semibold">Biizzed</span> — a Lovoh Create product
              </p>
            </div>

            {/* Mobile Title */}
            <div className="lg:hidden text-center mb-5">
              <h1 className="text-xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-500 text-xs mt-1">
                Sign in with your <span className="font-semibold">Lovoh Create</span> account
              </p>
            </div>

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
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] ${
                        loginError ? 'border-red-300' : 'border-gray-200'
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

              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                isLoading={googleLoading}
              />

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
              <Link to={redirect ? `/signup?redirect=${redirect}` : '/signup'} className="text-[#1B3766] font-medium hover:underline">
                Sign up
              </Link>
            </p>

            {/* Terms & Copyright with pop-up links */}
            <p className="text-center text-xs text-gray-400 mt-3 pb-4">
              By continuing, you agree to Biizzed's{' '}
              <button onClick={() => openLegalModal('terms')} className="underline hover:text-gray-600 cursor-pointer">
                Terms
              </button>
              {' and '}
              <button onClick={() => openLegalModal('privacy')} className="underline hover:text-gray-600 cursor-pointer">
                Privacy
              </button>
              <br />
              <span className="text-[10px] text-gray-300 mt-1 block">
                © {new Date().getFullYear()} Lovoh Create — All rights reserved.
              </span>
            </p>
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
                  <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaLock className="text-[#1B3766] text-2xl" />
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
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
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
                    className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? <FaSpinner className="animate-spin" /> : null}
                    {forgotLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaEnvelope className="text-[#1B3766] text-2xl" />
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
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-center tracking-widest"
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
                        className="w-full pr-10 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
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
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
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

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalModalType}
      />

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-in-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.28s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BiizzedLogin;