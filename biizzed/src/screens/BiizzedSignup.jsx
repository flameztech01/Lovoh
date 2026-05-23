// screens/BiizzedSignup.jsx - Email/Password + Google Signup with OTP Modal
import React, { useState, useEffect } from 'react';
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
import {
  FaArrowLeft, FaSpinner, FaNewspaper, FaCheck,
  FaBookOpen, FaVideo, FaUsers, FaPhone, FaGoogle,
  FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash,
  FaTimes,
} from 'react-icons/fa';

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

const BiizzedSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  // API hooks
  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [verifyEmail, { isLoading: verifyLoading }] = useVerifyEmailMutation();
  const [resendOTP, { isLoading: resendLoading }] = useResendOTPMutation();

  // UI state
  const [signupMethod, setSignupMethod] = useState('email');
  const [step, setStep] = useState('form');
  const [showPassword, setShowPassword] = useState(false);

  // Form data (without phone – phone handled separately)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]); // Nigeria default

  // OTP state
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

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
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    setPhoneNumber(digits);
  };

  // Combine country code + local number
  const getFullPhoneNumber = () => {
    let local = phoneNumber;
    if (local.startsWith('0') && selectedCountry.code !== '+0') {
      local = local.substring(1);
    }
    return `${selectedCountry.code}${local}`;
  };

  // Email/Password Registration
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    const { name, username, email, password } = formData;
    const fullPhone = getFullPhoneNumber();

    if (!name.trim()) { toast.error('Full name is required'); return; }
    if (!username.trim()) { toast.error('Username is required'); return; }
    if (!email.trim()) { toast.error('Email is required'); return; }
    if (!password.trim() || password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    try {
      const res = await register({ name, username, email, password, phone: fullPhone }).unwrap();
      setRegisteredEmail(res.email);
      setStep('otp');
      setCountdown(60);
      setCanResend(false);
      toast.success('Verification code sent to your email');
    } catch (error) {
      const msg = error?.data?.message || 'Registration failed. Email or username may already exist.';
      toast.error(msg);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    try {
      const res = await verifyEmail({ email: registeredEmail, otp }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome to Biizzed, ${res.name}! 🎉`);
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || 'Invalid or expired OTP');
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    try {
      await resendOTP({ email: registeredEmail }).unwrap();
      toast.success('New OTP sent to your email');
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to resend OTP');
    }
  };

  // Google Signup
  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    const fullPhone = getFullPhoneNumber();
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
      toast.error(error?.data?.message || 'Google signup failed. Account may already exist.');
    }
  };

  const handleGoogleError = () => toast.error('Google signup failed. Please try again.');

  const features = [
    { icon: FaNewspaper, title: 'Articles', desc: 'Write and share your insights' },
    { icon: FaBookOpen, title: 'Magazines', desc: 'Publish digital magazines' },
    { icon: FaVideo, title: 'Videos', desc: 'Upload educational content' },
    { icon: FaUsers, title: 'Community', desc: 'Connect with creators' },
  ];

  const isLoading = registerLoading || verifyLoading || resendLoading;

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
        <div className="w-full max-w-lg">
          {/* Hero */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaNewspaper className="text-[#1B3766] text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Join Biizzed</h1>
            <p className="text-gray-500 mt-2">Create, publish, and connect with a global audience</p>
          </div>

          {/* Method Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl mb-6">
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

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <div className="w-10 h-10 bg-[#1B3766]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <feature.icon className="text-[#1B3766] text-lg" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Signup Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {signupMethod === 'email' ? (
              step === 'form' && (
                <form onSubmit={handleEmailSignup} className="space-y-4">
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

                  {/* Phone Number with Country Code */}
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {registerLoading ? <FaSpinner className="animate-spin" /> : null}
                    Create Account
                  </button>
                </form>
              )
            ) : (
              /* Google Signup */
              <div className="space-y-4">
                {/* Phone (optional) for Google – same country code selector */}
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
                <div className="flex justify-center">
                  {googleLoading ? (
                    <div className="flex items-center gap-3 px-8 py-3 bg-gray-100 rounded-xl">
                      <FaSpinner className="animate-spin text-[#1B3766]" />
                      <span className="text-gray-600 text-sm">Creating account...</span>
                    </div>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="signup_with"
                      shape="pill"
                      width="300"
                    />
                  )}
                </div>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">free forever</span></div>
                </div>
                <div className="space-y-2">
                  {[
                    'Publish articles, magazines & videos',
                    'Build your audience & followers',
                    'Like, bookmark & share content',
                    'Connect with creators worldwide',
                    'Free to join, free to create',
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

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-[#1B3766] font-medium hover:underline">
              Sign in
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up, you agree to Biizzed's{' '}
            <Link to="/terms" className="underline">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      {step === 'otp' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setStep('form')}
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
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 mb-1">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
    </div>
  );
};

export default BiizzedSignup;