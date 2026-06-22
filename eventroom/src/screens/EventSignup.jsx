// screens/EventSignup.jsx – Full‑screen split layout with inline error/success feedback
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authslice';
import {
  useGoogleAuthMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendOTPMutation,
} from '../slices/userApiSlice';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import {
  FaGoogle,
  FaArrowLeft,
  FaCalendarAlt,
  FaSpinner,
  FaTimes,
  FaEnvelope,
  FaKey,
  FaUser,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaCheck,
} from 'react-icons/fa';

// ========== LEGAL MODAL ==========
const LegalModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const content = type === 'terms'
    ? {
        title: 'Terms of Service',
        body: `
          <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p>Welcome to Eventroom, a platform owned and operated by Lovoh Create. By using our services, you agree to the following terms.</p>
          <h4>1. Acceptance of Terms</h4>
          <p>By creating an account, you agree to comply with these Terms of Service. If you do not agree, please do not use the platform.</p>
          <h4>2. User Accounts</h4>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration.</p>
          <h4>3. Content and Events</h4>
          <p>You retain all rights to the content you post. Event listings and ticket sales are subject to our refund and cancellation policies.</p>
          <h4>4. Prohibited Conduct</h4>
          <p>You may not post illegal, harmful, or abusive content. Harassment, spam, and impersonation are strictly forbidden.</p>
          <h4>5. Termination</h4>
          <p>We reserve the right to suspend or terminate accounts that violate these terms or for any other reason at our discretion.</p>
          <h4>6. Disclaimer of Warranties</h4>
          <p>The platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error‑free service.</p>
          <h4>7. Limitation of Liability</h4>
          <p>Lovoh Create shall not be liable for any indirect, incidental, or consequential damages arising from the use of the platform.</p>
          <h4>8. Changes to Terms</h4>
          <p>We may update these terms periodically. Continued use constitutes acceptance of the updated terms.</p>
          <p><strong>Contact:</strong> For any questions, contact us at support@lovohcreate.com.</p>
        `,
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
          <p>We may share your information with trusted third‑party service providers (e.g., email delivery, analytics) only to operate our services. We ensure they adhere to strict confidentiality.</p>
          <h4>4. Data Security</h4>
          <p>We implement industry‑standard security measures to protect your data. However, no method of transmission over the internet is completely secure.</p>
          <h4>5. Cookies and Tracking</h4>
          <p>We use cookies to enhance user experience and analyze traffic. You can control cookie preferences in your browser settings.</p>
          <h4>6. Your Rights</h4>
          <p>You may access, modify, or delete your personal data at any time. Contact us to exercise your rights.</p>
          <h4>7. Children's Privacy</h4>
          <p>Our platform is not intended for children under 13. We do not knowingly collect data from minors.</p>
          <h4>8. Changes to Policy</h4>
          <p>We may update this policy. We will notify you of significant changes.</p>
          <p><strong>Contact:</strong> For privacy inquiries, email privacy@lovohcreate.com.</p>
        `,
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

// ========== MAIN SIGNUP COMPONENT ==========
const EventSignup = () => {
  const [signupMethod, setSignupMethod] = useState('email');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [signupError, setSignupError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Legal modal state
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState('terms');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userInfo } = useSelector((state) => state.auth);

  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [verifyEmail, { isLoading: verifyLoading }] = useVerifyEmailMutation();
  const [resendOTP, { isLoading: resendLoading }] = useResendOTPMutation();

  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, navigate, redirect]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (signupError) setSignupError('');
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    setPhoneNumber(digits);
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
    const { name, username, email, password, confirmPassword } = formData;
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
    if (!password) {
      setSignupError('Password is required');
      toast.error('Password is required');
      return;
    }
    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setSignupError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      setSignupError('Please accept the terms and conditions');
      toast.error('Please accept the terms and conditions');
      return;
    }

    setSignupError('');
    try {
      await register({ name, username, email, password, phone: fullPhone }).unwrap();
      setRegisterEmail(email);
      setShowOTPModal(true);
      setOtpSuccess('Verification code sent to your email');
      toast.success('Account created! Check your email for the verification code.');
      setResendTimer(60);
    } catch (error) {
      const msg = error?.data?.message || 'Registration failed. Email or username may already exist.';
      setSignupError(msg);
      toast.error(msg);
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');
    setOtpSuccess('');
    if (!otp.trim() || otp.length !== 6) {
      setOtpError('Please enter a valid 6‑digit OTP');
      toast.error('Please enter a valid 6‑digit OTP');
      return;
    }
    try {
      const result = await verifyEmail({ email: registerEmail, otp }).unwrap();
      if (!result.token) throw new Error('Invalid response: missing token');
      dispatch(setCredentials({ ...result }));
      toast.success('Email verified! Welcome to Eventroom 🎉');
      setShowOTPModal(false);
      navigate(redirect);
    } catch (error) {
      const msg = error?.data?.message || 'Invalid or expired OTP';
      setOtpError(msg);
      toast.error(msg);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setOtpError('');
    setOtpSuccess('');
    try {
      await resendOTP({ email: registerEmail }).unwrap();
      toast.success('New OTP sent');
      setResendTimer(60);
      setOtpSuccess('New OTP sent successfully');
    } catch (error) {
      const msg = error?.data?.message || 'Failed to resend OTP';
      setOtpError(msg);
      toast.error(msg);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const fullPhone = getFullPhoneNumber();
    setSignupError('');
    if (!phoneNumber.trim()) {
      setSignupError('Phone number is required');
      toast.error('Phone number is required');
      return;
    }
    if (!termsAccepted) {
      setSignupError('Please accept the terms and conditions');
      toast.error('Please accept the terms and conditions');
      return;
    }
    try {
      const { credential } = credentialResponse;
      const result = await googleAuth({
        token: credential,
        phone: fullPhone,
        mode: 'signup',
      }).unwrap();
      if (!result.token) throw new Error('Google auth missing token');
      dispatch(setCredentials({ ...result }));
      toast.success(`Welcome to Eventroom, ${result.name || 'Creator'}! 🎉`);
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

  const isLoading = registerLoading || googleLoading;

  return (
    <div className="fixed inset-0 w-full h-full bg-white flex overflow-hidden">
      {/* LEFT PANEL – Image (Event theme) */}
      <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80"
          alt="Event stage"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 pt-8">
          <img
            src="/eventroom.png"
            alt="Eventroom Logo"
            className="h-8 w-auto object-contain brightness-0 invert"
          />
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-10 pb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 mb-6">
            <FaCalendarAlt className="text-white/60 text-2xl mb-3" />
            <p className="text-white/80 text-sm italic">
              Create, manage, and promote events with ease on Eventroom.
            </p>
          </div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-3 max-w-md">
            Host Events.<br />Grow Your Audience.<br />Anywhere.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            From conferences to workshops, Eventroom gives you all the tools you need.
          </p>
          <div className="mt-6 w-10 h-0.5 bg-white/40 rounded-full" />
        </div>
      </div>

      {/* RIGHT PANEL – Form */}
      <div className="w-full lg:w-1/2 h-full bg-gray-50 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
              <FaArrowLeft className="text-sm" />
            </button>
            <div className="flex flex-col items-center">
              <img src="/eventroom.png" alt="Eventroom" className="h-8 w-auto" />
              <span className="text-[10px] text-gray-400 mt-0.5">a Lovoh Create product</span>
            </div>
            <div className="w-9" />
          </div>
        </div>

        {/* Form Container - scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-6 lg:py-8">
          <div className="max-w-md mx-auto w-full">
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-6">
              <div className="w-14 h-14 bg-[#1B3766]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaCalendarAlt className="text-[#1B3766] text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Join Eventroom</h1>
              <p className="text-gray-500 text-sm mt-1">
                <span className="font-semibold">Eventroom</span> — a Lovoh Create product
              </p>
            </div>

            {/* Mobile Title */}
            <div className="lg:hidden text-center mb-5">
              <h1 className="text-xl font-bold text-gray-900">Join Eventroom</h1>
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
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text" name="name" value={formData.name} onChange={handleChange} required
                        placeholder="John Doe"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Username *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text" name="username" value={formData.username} onChange={handleChange} required
                        placeholder="johndoe"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email Address *</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange} required
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Password *</label>
                    <div className="relative">
                      <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                        placeholder="•••••••• (min 6 chars)"
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
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                        placeholder="Confirm your password"
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      />
                      <button
                        type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number *</label>
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
                          type="tel" value={phoneNumber} onChange={handlePhoneChange} required
                          placeholder="Phone number"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">We'll send important event notifications to this number.</p>
                  </div>

                  {/* Terms */}
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 text-[#1B3766] focus:ring-[#1B3766] rounded"
                      />
                      <span className="text-xs text-gray-500">
                        I agree to the Terms of Service and Privacy Policy. I understand that paid events require wallet setup.
                      </span>
                    </label>
                  </div>

                  {signupError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-xs">{signupError}</p>
                    </div>
                  )}

                  <button
                    type="submit" disabled={registerLoading}
                    className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {registerLoading ? <FaSpinner className="animate-spin" /> : null}
                    {registerLoading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              ) : (
                /* Google Signup */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number *</label>
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
                          type="tel" value={phoneNumber} onChange={handlePhoneChange} required
                          placeholder="Phone number"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">We'll send important event notifications to this number.</p>
                  </div>

                  {/* Terms */}
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 text-[#1B3766] focus:ring-[#1B3766] rounded"
                      />
                      <span className="text-xs text-gray-500">
                        I agree to the Terms of Service and Privacy Policy. I understand that paid events require wallet setup.
                      </span>
                    </label>
                  </div>

                  {signupError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-xs">{signupError}</p>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="signup_with"
                      shape="pill"
                      width="300"
                    />
                  </div>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">free forever</span></div>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      'Create and publish events for free',
                      'Sell tickets with multiple types',
                      'Real‑time registration tracking',
                      'QR code check‑in system',
                      'Set up wallet for paid events (94% earnings)',
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheck className="text-green-500 text-xs flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lovoh Create ecosystem note */}
              <div className="mt-4 text-center text-[11px] text-gray-400 border-t border-gray-100 pt-4">
                Your Lovoh Create account works across{' '}
                <span className="font-medium text-gray-500">Biizzed</span>,{' '}
                <span className="font-medium text-gray-500">Úduua</span>, and{' '}
                <span className="font-medium text-gray-500">Eventroom</span>.
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-500 mt-5">
              Already have a Lovoh Create account?{' '}
              <Link
                to={redirect ? `/login?redirect=${redirect}` : '/login'}
                className="text-[#1B3766] font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>

            {/* Terms & Privacy with pop-up links */}
            <p className="text-center text-xs text-gray-400 mt-3 pb-4">
              By signing up, you agree to Eventroom's{' '}
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

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-fadeInUp">
            <button
              onClick={() => {
                setShowOTPModal(false);
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
                We sent a 6‑digit code to <strong>{registerEmail}</strong>
              </p>
            </div>

            <div className="space-y-4">
              {otpSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-xs">{otpSuccess}</p>
                </div>
              )}
              {otpError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-xs">{otpError}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (otpError) setOtpError('');
                    if (otpSuccess) setOtpSuccess('');
                  }}
                  placeholder="123456"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  autoFocus
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={verifyLoading}
                className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifyLoading ? <FaSpinner className="animate-spin" /> : null}
                {verifyLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-gray-400">Resend code in {resendTimer}s</p>
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
            </div>
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

export default EventSignup;