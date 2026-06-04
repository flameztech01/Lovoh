// screens/UduuaLogin.jsx
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
  const [showNewPassword, setShowNewPassword] = useState(false);
  
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
      
      // Check for lockout
      if (errorMessage.toLowerCase().includes('locked')) {
        setIsLocked(true);
      }
      
      toast.error(errorMessage);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    toast.error('Google login failed. Please try again.');
  };

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
      closeModal();
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
          {/* Dark Overlay */}
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

        {/* Right Panel - Form (Full height, centered, scrollable if needed) */}
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

          {/* Form Container */}
          <div className="flex-1 flex flex-col justify-center px-4 py-6 lg:py-0 overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
              
              {/* Desktop Header */}
              <div className="hidden lg:block text-center mb-6">
                <div className="w-14 h-14 bg-gray-900/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FaShoppingBag className="text-gray-900 text-2xl" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-500 text-sm mt-1">Sign in to continue to Úduua</p>
              </div>

              {/* Mobile Title */}
              <div className="lg:hidden text-center mb-5">
                <h1 className="text-xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-500 text-xs mt-1">Sign in to your account</p>
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
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-500 mt-5">
                Don't have an account?{' '}
                <Link to={redirect ? `/shop/signup?redirect=${redirect}` : '/shop/signup'} className="text-gray-900 font-medium hover:underline">
                  Sign up
                </Link>
              </p>

              {/* Terms */}
              <p className="text-center text-xs text-gray-400 mt-3 pb-4">
                By continuing, you agree to Úduua's{' '}
                <Link to="/terms" className="underline">Terms</Link> and{' '}
                <Link to="/privacy" className="underline">Privacy</Link>
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
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="you@example.com"
                    />
                  </div>
                  {resetError && <p className="text-red-500 text-xs mb-3">{resetError}</p>}
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
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                        onChange={(e) => setNewPassword(e.target.value)}
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
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {resetError && <p className="text-red-500 text-xs mb-3">{resetError}</p>}
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