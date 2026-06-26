// screens/BiizzedSignup.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGoogleAuthMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendOTPMutation,
} from '../slices/userApiSlice';
import { setCredentials } from '../slices/authslice';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import {
  FaArrowLeft, FaSpinner, FaNewspaper,
  FaCheck, FaPhone, FaGoogle,
  FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash,
  FaTimes, FaRegComment, FaQuoteLeft,
} from 'react-icons/fa';
import { useGetArticlesQuery } from '../slices/articlesApiSlice';

// ========== COUNTRY CODES ==========
const countryCodes = [
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
];

// ========== RANDOM ARTICLES SLIDER COMPONENT ==========
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
              <FaRegComment /> {(currentArticle.comments?.length || 0).toLocaleString()}
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
            Join Biizzed — share your stories, build your community.
          </p>
        </div>
      </div>
    </div>
  );
};

// ========== GOOGLE SIGNUP BUTTON COMPONENT ==========
const GoogleSignupButton = ({ onSuccess, onError, isLoading }) => {
  const isNative = Capacitor.isNativePlatform();

  if (!isNative) {
    return (
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="outline"
          size="large"
          text="signup_with"
          shape="pill"
          width="300"
        />
      </div>
    );
  }

  const handleNativeGoogleSignup = async () => {
    try {
      const clientId = '423161329900-6rifobklf0pl8l6hfjnct8ek8qbo4gou.apps.googleusercontent.com';
      const redirectUri = 'https://biizzed.lovohcreate.com/auth/google/callback';
      const scope = 'email profile';
      const responseType = 'token id_token';
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&nonce=${Math.random().toString(36)}`;

      await Browser.open({
        url: googleAuthUrl,
        presentationStyle: 'popover',
        toolbarColor: '#1B3766',
      });
      toast.info('Please complete sign-up in the browser window');
    } catch (error) {
      console.error('Native Google Sign-Up Error:', error);
      toast.error('Failed to open Google Sign-Up. Please try again.');
    }
  };

  return (
    <button
      onClick={handleNativeGoogleSignup}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
    >
      {isLoading ? (
        <FaSpinner className="animate-spin text-[#1B3766]" />
      ) : (
        <FaGoogle className="text-[#4285F4] text-lg" />
      )}
      <span className="text-gray-700 font-medium">
        {isLoading ? 'Signing up...' : 'Continue with Google'}
      </span>
    </button>
  );
};

// ========== TERMS & PRIVACY MODAL ==========
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

// ========== MAIN SIGNUP COMPONENT ==========
const BiizzedSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [verifyEmail, { isLoading: verifyLoading }] = useVerifyEmailMutation();
  const [resendOTP, { isLoading: resendLoading }] = useResendOTPMutation();

  const [signupMethod, setSignupMethod] = useState('email');
  const [step, setStep] = useState('form');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);

  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const [signupError, setSignupError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState('terms');

  const redirect = location.search?.split('=')[1] || '/feed';

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, navigate, redirect]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (signupError) setSignupError('');
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    setPhoneNumber(digits);
    if (signupError) setSignupError('');
  };

  const getFullPhoneNumber = () => {
    let local = phoneNumber;
    if (local.startsWith('0') && selectedCountry.code !== '+0') {
      local = local.substring(1);
    }
    return `${selectedCountry.code}${local}`;
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    setOtpSuccess('');

    const { name, username, email, password } = formData;
    const fullPhone = getFullPhoneNumber();

    if (!name.trim()) {
      setSignupError('Full name is required');
      toast.error('Full name is required');
      return;
    }
    if (!username.trim()) {
      setSignupError('Username is required');
      toast.error('Username is required');
      return;
    }
    if (!email.trim()) {
      setSignupError('Email address is required');
      toast.error('Email address is required');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setSignupError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await register({ name, username, email, password, phone: fullPhone }).unwrap();
      setRegisteredEmail(res.email);
      setStep('otp');
      setCountdown(60);
      setCanResend(false);
      setOtpSuccess(`Verification code sent to ${res.email}`);
      toast.success('Verification code sent to your email');
    } catch (error) {
      const msg = error?.data?.message || 'Registration failed. Email or username may already exist.';
      setSignupError(msg);
      toast.error(msg);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter the 6-digit code');
      toast.error('Please enter the 6-digit code');
      return;
    }
    try {
      const res = await verifyEmail({ email: registeredEmail, otp }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome to Biizzed, ${res.name}! 🎉`);
      navigate(redirect);
    } catch (error) {
      const msg = error?.data?.message || 'Invalid or expired OTP';
      setOtpError(msg);
      toast.error(msg);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setOtpError('');
    setOtpSuccess('');
    try {
      await resendOTP({ email: registeredEmail }).unwrap();
      toast.success('New OTP sent to your email');
      setCountdown(60);
      setCanResend(false);
      setOtpSuccess('New OTP sent successfully');
    } catch (error) {
      const msg = error?.data?.message || 'Failed to resend OTP';
      setOtpError(msg);
      toast.error(msg);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    const fullPhone = getFullPhoneNumber();
    setSignupError('');
    try {
      const res = await googleAuth({
        token: credential,
        mode: 'signup',
        phone: fullPhone,
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome to Biizzed, ${res.name || 'Creator'}! 🎉`);
      navigate(redirect);
    } catch (error) {
      const msg = error?.data?.message || 'Google signup failed. Account may already exist.';
      setSignupError(msg);
      toast.error(msg);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google signup error:', error);
    setSignupError('Google signup failed. Please try again.');
    toast.error('Google signup failed. Please try again.');
  };

  const openLegalModal = (type) => {
    setLegalModalType(type);
    setLegalModalOpen(true);
  };

  const isLoading = registerLoading || verifyLoading || resendLoading;

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row">
      {/* LEFT SIDE - FIXED, NO SCROLL */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#1B3766] h-full overflow-hidden">
        <ArticlesSlider />
      </div>

      {/* RIGHT SIDE - SCROLLABLE FORM AREA */}
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

        {/* SCROLLABLE FORM CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-6 lg:py-8">
          <div className="max-w-md mx-auto w-full">
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-6">
              <div className="w-14 h-14 bg-[#1B3766]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaNewspaper className="text-[#1B3766] text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Join Biizzed</h1>
              <p className="text-gray-500 text-sm mt-1">
                <span className="font-semibold">Biizzed</span> — a Lovoh Create product
              </p>
            </div>

            {/* Mobile Title */}
            <div className="lg:hidden text-center mb-5">
              <h1 className="text-xl font-bold text-gray-900">Join Biizzed</h1>
              <p className="text-gray-500 text-xs mt-1">
                Create your <span className="font-semibold">Lovoh Create</span> account
              </p>
            </div>

            {/* Method Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl mb-5">
              <button
                onClick={() => {
                  setSignupMethod('email');
                  setSignupError('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  signupMethod === 'email' ? 'bg-white text-[#1B3766] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Email Signup
              </button>
              <button
                onClick={() => {
                  setSignupMethod('google');
                  setSignupError('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  signupMethod === 'google' ? 'bg-white text-[#1B3766] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Google Signup
              </button>
            </div>

            {/* Signup Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
              {signupMethod === 'email' ? (
                step === 'form' && (
                  <form onSubmit={handleEmailSignup} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Full Name *</label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="text" name="name" value={formData.name} onChange={handleChange}
                          required placeholder="John Doe"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Username *</label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="text" name="username" value={formData.username} onChange={handleChange}
                          required placeholder="johndoe"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="email" name="email" value={formData.email} onChange={handleChange}
                          required placeholder="you@example.com"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Password *</label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                          required placeholder="•••••••• (min 6 chars)"
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                        />
                        <button
                          type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                        </button>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Phone (Optional)</label>
                      <div className="flex gap-2">
                        <div className="relative w-28">
                          <select
                            value={selectedCountry.code}
                            onChange={(e) => {
                              const country = countryCodes.find(c => c.code === e.target.value);
                              if (country) setSelectedCountry(country);
                            }}
                            className="w-full pl-2 pr-7 py-2.5 border border-gray-200 rounded-xl text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                          >
                            {countryCodes.map((country) => (
                              <option key={country.code + country.name} value={country.code}>
                                {country.flag} {country.code}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        <div className="relative flex-1">
                          <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="Phone number"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Inline Error Message */}
                    {signupError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-xs">{signupError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                    >
                      {registerLoading ? <FaSpinner className="animate-spin" /> : null}
                      Create Account
                    </button>
                  </form>
                )
              ) : (
                /* Google Signup */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone (Optional)</label>
                    <div className="flex gap-2">
                      <div className="relative w-28">
                        <select
                          value={selectedCountry.code}
                          onChange={(e) => {
                            const country = countryCodes.find(c => c.code === e.target.value);
                            if (country) setSelectedCountry(country);
                          }}
                          className="w-full pl-2 pr-7 py-2.5 border border-gray-200 rounded-xl text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code + country.name} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <div className="relative flex-1">
                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="Phone number"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inline Error Message for Google */}
                  {signupError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-xs">{signupError}</p>
                    </div>
                  )}

                  <GoogleSignupButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    isLoading={googleLoading}
                  />

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">free forever</span></div>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      'Publish articles, magazines & videos',
                      'Build your audience & followers',
                      'Like, bookmark & share content',
                      'Connect with creators worldwide',
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheck className="text-green-500 text-xs flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

            {/* Login Link */}
            <p className="text-center text-sm text-gray-500 mt-5">
              Already have a Lovoh Create account?{' '}
              <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-[#1B3766] font-medium hover:underline">
                Sign in
              </Link>
            </p>

            {/* Terms & Copyright with pop-up links */}
            <p className="text-center text-xs text-gray-400 mt-3 pb-4">
              By signing up, you agree to Biizzed's{' '}
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

      {/* OTP Modal */}
      {step === 'otp' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-fadeInUp">
            <button
              onClick={() => {
                setStep('form');
                setOtpError('');
                setOtpSuccess('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaEnvelope className="text-[#1B3766] text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="text-sm text-gray-500 mt-1">
                We sent a 6-digit code to <strong>{registeredEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP}>
              {/* Success message */}
              {otpSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-700 text-xs">{otpSuccess}</p>
                </div>
              )}
              {/* Error message */}
              {otpError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-xs">{otpError}</p>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 mb-1">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (otpError) setOtpError('');
                  }}
                  placeholder="123456"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={verifyLoading}
                className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifyLoading ? <FaSpinner className="animate-spin" /> : null}
                Verify & Continue
              </button>

              <div className="text-center mt-4">
                {countdown > 0 ? (
                  <p className="text-xs text-gray-400">Resend code in {countdown}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="text-xs text-[#1B3766] hover:underline disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal Modal (Terms & Privacy) */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalModalType}
      />

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

export default BiizzedSignup;