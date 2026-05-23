// screens/EventSignup.jsx – Modern toggle layout (Email / Google) with international phone
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
  FaCheck,
  FaQrcode,
  FaUsers,
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ==================== STANDALONE PATHS ====================
const getEventsListPath = () => '/';
const getLoginPath = (redirect) => (redirect ? `/login?redirect=${redirect}` : '/login');
const getDashboardPath = () => '/dashboard';

// ==================== COUNTRY CODES ====================
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

const EventSignup = () => {
  const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'google'
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]); // Nigeria default
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

  const redirect = searchParams.get('redirect') || getDashboardPath();

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, navigate, redirect]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    if (!name.trim() || !username.trim() || !email.trim() || !password || !confirmPassword || !phoneNumber.trim()) {
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
      await register({ name, username, email, password, phone: fullPhone }).unwrap();
      setRegisterEmail(email);
      setShowOTPModal(true);
      toast.success('Account created! Check your email for the verification code.');
      setResendTimer(60);
    } catch (error) {
      const msg = error?.data?.message || 'Registration failed. Email or username may already exist.';
      toast.error(msg);
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
    const fullPhone = getFullPhoneNumber();
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    try {
      const auth2 = window.google?.accounts?.id;
      if (!auth2) {
        toast.error('Google Sign-In unavailable');
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
        phone: fullPhone,
        mode: 'signup',
      }).unwrap();
      dispatch(setCredentials({ ...result }));
      toast.success('Account created! Welcome!');
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || 'Signup failed');
    }
  };

  const features = [
    { icon: FaCalendarAlt, title: 'Create Events', desc: 'Publish & promote in minutes' },
    { icon: FaTicketAlt, title: 'Sell Tickets', desc: 'Multiple ticket types & prices' },
    { icon: FaQrcode, title: 'Check‑in', desc: 'Ticket ID check-in' },
    { icon: FaUsers, title: 'Audience', desc: 'Track registrations live' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-16 pt-24">
        <button
          onClick={() => navigate(getEventsListPath())}
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

        {/* Features Grid (similar to Biizzed) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 bg-[#1B3766]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <feature.icon className="text-[#1B3766] text-lg" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Method Toggle */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl mb-6 max-w-xs mx-auto">
          <button
            onClick={() => setSignupMethod('email')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              signupMethod === 'email' ? 'bg-white text-[#1B3766] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Email Signup
          </button>
          <button
            onClick={() => setSignupMethod('google')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              signupMethod === 'google' ? 'bg-white text-[#1B3766] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Google Signup
          </button>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          {signupMethod === 'email' ? (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name *</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Username *</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="Choose a username"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email Address *</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Password *</label>
                <div className="relative">
                  <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required placeholder="At least 6 characters"
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password *</label>
                <div className="relative">
                  <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Re-enter password"
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  />
                  <button
                    type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Phone (same for both methods) */}
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
                      type="tel" value={phoneNumber} onChange={handlePhoneChange} placeholder="Phone number"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
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

              <button
                type="submit" disabled={registerLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B3766] text-white rounded-xl font-semibold text-sm hover:bg-[#142952] transition-all disabled:opacity-50 shadow-md mt-4"
              >
                {registerLoading ? <FaSpinner className="w-5 h-5 animate-spin" /> : <FaUser className="w-5 h-5" />}
                <span>{registerLoading ? 'Creating account...' : 'Sign Up with Email'}</span>
              </button>
            </form>
          ) : (
            /* Google Signup section */
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
                      type="tel" value={phoneNumber} onChange={handlePhoneChange} placeholder="Phone number"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
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

              <div className="flex justify-center pt-2">
                {googleLoading ? (
                  <div className="flex items-center gap-3 px-8 py-3 bg-gray-100 rounded-xl">
                    <FaSpinner className="animate-spin text-[#1B3766]" />
                    <span className="text-gray-600 text-sm">Creating account...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleSignup}
                    disabled={!termsAccepted || !phoneNumber.trim() || googleLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-[#1B3766] hover:text-[#1B3766] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <FaGoogle className="w-5 h-5 text-red-500" />
                    Sign up with Google
                  </button>
                )}
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">free forever</span></div>
              </div>

              {/* Benefits List (similar to Biizzed) */}
              <div className="space-y-2">
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
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to={getLoginPath(redirect)} className="text-[#1B3766] font-semibold hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          By signing up, you agree to EventRoom's{' '}
          <Link to="/terms" className="underline">Terms of Service</Link> and{' '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>

      {/* OTP Modal (unchanged) */}
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
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              />
              <button
                onClick={handleVerifyOTP}
                disabled={verifyLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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