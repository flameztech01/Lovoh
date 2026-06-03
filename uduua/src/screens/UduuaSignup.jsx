// screens/UduuaSignup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { 
  FaPhone, 
  FaArrowLeft, 
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaGoogle,
  FaTimes,
  FaKey,
  FaSpinner,
  FaShoppingBag,
  FaCheckCircle
} from 'react-icons/fa';
import { useGoogleAuthMutation, useRegisterMutation, useVerifyEmailMutation, useResendOTPMutation } from '../slices/userApiSlice.js';
import { setCredentials } from '../slices/authslice.js';
import { toast } from 'react-toastify';

const UduuaSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();
  const [verifyEmail, { isLoading: verifyLoading }] = useVerifyEmailMutation();
  const [resendOTP, { isLoading: resendLoading }] = useResendOTPMutation();

  const [signupMethod, setSignupMethod] = useState('manual');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [signupError, setSignupError] = useState('');
  
  const [manualFormData, setManualFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [googlePhone, setGooglePhone] = useState('');
  const [googleError, setGoogleError] = useState('');

  const { userInfo } = useSelector((state) => state.auth);
  const redirect = location.state?.from || location.search?.split('=')[1] || '/shop';

  useEffect(() => {
    if (userInfo && userInfo.token) {
      navigate(redirect, { replace: true });
    }
  }, [userInfo, navigate, redirect]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setManualFormData({ ...manualFormData, [name]: value.toLowerCase().replace(/\s/g, '') });
    } else {
      setManualFormData({ ...manualFormData, [name]: value });
    }
    if (signupError) setSignupError('');
  };

  const handleManualSignup = async (e) => {
    e.preventDefault();
    const { name, username, email, password, confirmPassword, phone } = manualFormData;

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

    setSignupError('');

    try {
      const res = await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        phone: phone.trim()
      }).unwrap();
      setRegisteredEmail(email.trim());
      setShowOtpModal(true);
      toast.success(res.message || 'Registration successful! Please verify your email.');
    } catch (err) {
      const errorMessage = err?.data?.message || 'Registration failed. Please try again.';
      setSignupError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      const res = await verifyEmail({ email: registeredEmail, otp }).unwrap();
      if (!res.token) throw new Error('Invalid response: missing token');
      dispatch(setCredentials({ ...res }));
      toast.success('Email verified successfully! Welcome to Úduua 🎉');
      setShowOtpModal(false);
      navigate(redirect, { replace: true });
    } catch (err) {
      const errorMessage = err?.data?.message || 'Verification failed. Please check your OTP.';
      toast.error(errorMessage);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOTP({ email: registeredEmail }).unwrap();
      toast.success('New OTP sent to your email');
      setResendTimer(60);
    } catch (err) {
      const errorMessage = err?.data?.message || 'Failed to resend OTP. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!googlePhone.trim()) {
      setGoogleError('Phone number is required');
      toast.error('Phone number is required');
      return;
    }
    setGoogleError('');
    try {
      const { credential } = credentialResponse;
      const res = await googleAuth({ 
        token: credential, 
        phone: googlePhone.trim(),
        mode: 'signup' 
      }).unwrap();
      if (!res.token) throw new Error('Google auth missing token');
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome to Úduua, ${res.name || 'User'}! 🎉`);
      navigate(redirect, { replace: true });
    } catch (err) {
      const errorMessage = err?.data?.message || 'Google sign up failed. Please try again.';
      setGoogleError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google signup error:', error);
    toast.error('Google sign up failed. Please try again.');
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp('');
    setRegisteredEmail('');
  };

  const isLoading = registerLoading || googleLoading;

  return (
    <div className="fixed inset-0 w-full h-full bg-white flex overflow-hidden">
      {/* Full Screen Grid - 50/50 Split */}
      <div className="flex flex-1 w-full h-full">
        
        {/* Left Panel - Image (Full height, no scroll) */}
        <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden bg-gray-900">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80"
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
                Join thousands of buyers discovering quality products from verified brands on Úduua.
              </p>
            </div>
            <h2 className="text-white text-4xl font-bold leading-tight mb-3 max-w-md">
              Start Your<br />Shopping Journey.<br />Grow Anywhere.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              From verified brands to bulk pricing, Úduua lets you shop seamlessly across all your devices.
            </p>
            <div className="mt-6 w-10 h-0.5 bg-white/40 rounded-full" />
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 h-full bg-gray-50 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button onClick={() => navigate('/shop')} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
                <FaArrowLeft className="text-sm" />
              </button>
              <img src="/uduua.png" alt="Úduua" className="h-8 w-auto" />
              <div className="w-9" />
            </div>
          </div>

          {/* Form Container - Added pt-8 for spacing and proper centering */}
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full flex flex-col justify-center px-4 py-8 lg:py-12">
              <div className="max-w-md mx-auto w-full">
                
                {/* Mobile Title - Only shows on mobile, hidden on desktop */}
                <div className="lg:hidden text-center mb-6">
                  <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
                  <p className="text-gray-500 text-xs mt-1">Join the Úduua community</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
                  
                  {/* Method Toggle */}
                  <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl mb-6">
                    <button
                      onClick={() => {
                        setSignupMethod('manual');
                        setSignupError('');
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        signupMethod === 'manual'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <FaEnvelope className="text-xs" />
                      Email Signup
                    </button>
                    <button
                      onClick={() => {
                        setSignupMethod('google');
                        setGoogleError('');
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        signupMethod === 'google'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <FaGoogle className="text-xs" />
                      Google Signup
                    </button>
                  </div>

                  {/* Manual Signup Form */}
                  {signupMethod === 'manual' && (
                    <form onSubmit={handleManualSignup} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Full Name *</label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="text"
                            name="name"
                            value={manualFormData.name}
                            onChange={handleManualChange}
                            required
                            placeholder="John Doe"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Username *</label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="text"
                            name="username"
                            value={manualFormData.username}
                            onChange={handleManualChange}
                            required
                            placeholder="johndoe"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email Address *</label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="email"
                            name="email"
                            value={manualFormData.email}
                            onChange={handleManualChange}
                            required
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="tel"
                            name="phone"
                            value={manualFormData.phone}
                            onChange={handleManualChange}
                            placeholder="+234 801 234 5678"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                            value={manualFormData.password}
                            onChange={handleManualChange}
                            required
                            placeholder="•••••••• (min 6 chars)"
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password *</label>
                        <div className="relative">
                          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={manualFormData.confirmPassword}
                            onChange={handleManualChange}
                            required
                            placeholder="Confirm your password"
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                          </button>
                        </div>
                      </div>

                      {signupError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-600 text-xs">{signupError}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {registerLoading ? <FaSpinner className="animate-spin" /> : null}
                        {registerLoading ? 'Creating account...' : 'Sign Up'}
                      </button>
                    </form>
                  )}

                  {/* Google Signup */}
                  {signupMethod === 'google' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number *</label>
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="tel"
                            value={googlePhone}
                            onChange={(e) => {
                              setGooglePhone(e.target.value);
                              setGoogleError('');
                            }}
                            placeholder="+234 801 234 5678"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                          <FaCheckCircle className="text-gray-400 text-xs" />
                          Required for order updates and account recovery
                        </p>
                      </div>

                      {googleError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-600 text-xs">{googleError}</p>
                        </div>
                      )}

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-3 text-xs text-gray-500">Sign up with</span>
                        </div>
                      </div>

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
                    </div>
                  )}
                </div>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-500 mt-6">
                  Already have an account?{' '}
                  <Link to={redirect ? `/shop/login?redirect=${redirect}` : '/shop/login'} className="text-gray-900 font-medium hover:underline">
                    Sign in here
                  </Link>
                </p>

                {/* Terms */}
                <p className="text-center text-xs text-gray-400 mt-4 pb-4">
                  By signing up, you agree to Úduua's{' '}
                  <Link to="/terms" className="underline">Terms</Link> and{' '}
                  <Link to="/privacy" className="underline">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-fadeInUp">
            <button onClick={closeOtpModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>

            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gray-900/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaKey className="text-gray-900 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit code sent to <strong>{registeredEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 text-center tracking-widest text-2xl"
                  placeholder="123456"
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-400 text-center">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || resendLoading}
                    className={`text-gray-700 font-medium hover:underline ${resendTimer > 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
                  </button>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeOtpModal}
                  disabled={verifyLoading}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifyLoading ? <FaSpinner className="animate-spin" /> : null}
                  {verifyLoading ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default UduuaSignup;