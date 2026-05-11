// screens/EventSignup.jsx
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
import {
  FaGoogle,
  FaArrowLeft,
  FaCalendarAlt,
  FaTicketAlt,
  FaChartBar,
  FaWallet,
  FaSpinner,
  FaTimes,
  FaEnvelope,
  FaKey,
  FaUser,
  FaPhone,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EventSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { userInfo } = useSelector((state) => state.auth);

  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [verifyEmail, { isLoading: verifyLoading }] = useVerifyEmailMutation();
  const [resendOTP, { isLoading: resendLoading }] = useResendOTPMutation();

  const redirect = searchParams.get('redirect') || '/events/dashboard';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  // Resend timer countdown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatPhoneNumber = (value) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('234')) cleaned = '0' + cleaned.slice(3);
    return cleaned.slice(0, 11);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData({ ...formData, phone: formatPhoneNumber(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    const { name, username, email, password, confirmPassword, phone } = formData;

    // Validation
    if (!name.trim() || !username.trim() || !email.trim() || !password || !confirmPassword || !phone.trim()) {
      toast.error('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    try {
      await register({ name, username, email, password, phone }).unwrap();
      setRegisterEmail(email);
      setShowOTPModal(true);
      toast.success('Account created! Check your email for the verification code.');
      setResendTimer(60);
    } catch (error) {
      toast.error(error?.data?.message || 'Registration failed');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }
    try {
      const result = await verifyEmail({ email: registerEmail, otp }).unwrap();
      dispatch(setCredentials({ ...result }));
      toast.success('Email verified! Welcome!');
      setShowOTPModal(false);
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || 'Invalid OTP');
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOTP({ email: registerEmail }).unwrap();
      toast.success('New OTP sent');
      setResendTimer(60);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleGoogleSignup = async () => {
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    try {
      const auth2 = window.google?.accounts?.id;
      if (!auth2) {
        toast.error('Google SignIn unavailable');
        return;
      }
      const token = await new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: (response) => {
            if (response.access_token) resolve(response.access_token);
            else reject(new Error('Google authentication failed'));
          },
        });
        client.requestAccessToken();
      });
      const result = await googleAuth({
        token,
        phone: formData.phone,
        mode: 'signup',
      }).unwrap();
      dispatch(setCredentials({ ...result }));
      toast.success('Account created! Welcome!');
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Header />

      <div className="max-w-md mx-auto px-4 py-16 pt-24">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-8 transition-colors text-sm group"
        >
          <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
            <FaCalendarAlt className="text-[#1B3766] text-sm" />
            <span className="text-[#1B3766] font-semibold text-xs uppercase tracking-wider">
              Event Creator
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-500 text-sm">Start creating and managing events in minutes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleEmailSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08012345678"
                  maxLength={11}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Nigerian phone number (11 digits)</p>
            </div>

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

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={registerLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-6"
            >
              {registerLoading ? (
                <FaSpinner className="w-5 h-5 animate-spin" />
              ) : (
                <FaUser className="w-5 h-5" />
              )}
              <span>{registerLoading ? 'Creating account...' : 'Sign Up with Email'}</span>
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">or sign up with</span>
            </div>
          </div>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {googleLoading ? (
              <FaSpinner className="w-5 h-5 animate-spin text-gray-500" />
            ) : (
              <FaGoogle className="w-5 h-5 text-red-500" />
            )}
            <span>{googleLoading ? 'Signing up...' : 'Sign up with Google'}</span>
          </button>

          {/* Benefits */}
          <div className="mt-6 space-y-3">
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

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            to={`/events/login${redirect ? `?redirect=${redirect}` : ''}`}
            className="text-[#1B3766] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowOTPModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Verify Email</h2>
              <p className="text-gray-500 text-sm mt-2">
                A 6‑digit code was sent to <strong>{registerEmail}</strong>
              </p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent"
              />
              <button
                onClick={handleVerifyOTP}
                disabled={verifyLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {verifyLoading ? (
                  <FaSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  <FaEnvelope className="w-5 h-5" />
                )}
                <span>{verifyLoading ? 'Verifying...' : 'Verify Email'}</span>
              </button>
              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || resendLoading}
                  className="text-sm text-[#1B3766] hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {resendLoading
                    ? 'Sending...'
                    : resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : 'Resend code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventSignup;