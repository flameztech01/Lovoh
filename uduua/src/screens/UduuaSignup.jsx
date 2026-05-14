// screens/UduuaSignup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { 
  FaPhone, 
  FaArrowLeft, 
  FaShoppingBag, 
  FaTag, 
  FaBox, 
  FaShieldAlt, 
  FaGem, 
  FaArrowRight,
  FaStar,
  FaCheckCircle,
  FaHeadset,
  FaStore,
  FaRocket,
  FaHeart,
  FaUserFriends,
  FaChartLine
} from 'react-icons/fa';
import { useGoogleAuthMutation } from '../slices/userApiSlice.js';
import { setCredentials } from '../slices/authslice.js';
import { toast } from 'react-toastify';

const UduuaSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const [googleAuth] = useGoogleAuthMutation();

  useEffect(() => {
    if (userInfo) {
      const redirect = location.state?.from || '/uduua/shop';
      navigate(redirect);
    }
  }, [userInfo, navigate, location]);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);

    try {
      const res = await googleAuth({
        token: credentialResponse.credential,
        phone: phone.trim(),
        mode: 'signup',
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      toast.success('Account created successfully! Welcome to Úduua 🎉');
      navigate(location.state?.from || '/uduua/shop');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign up failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen w-full bg-white relative overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => navigate('/uduua/shop')}
          className="fixed top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-[#0043FC] transition-all duration-300 group bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm"
        >
          <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium hidden sm:inline">Back to Shop</span>
        </button>

        {/* Main Container */}
        <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Panel - Image/Illustration Section */}
            <div className="relative hidden lg:block bg-[#0a0f3c] overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat'
                }} />
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 right-10 animate-float">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <FaStore className="text-3xl text-white/40" />
                </div>
              </div>
              <div className="absolute bottom-20 left-10 animate-float-delayed">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaRocket className="text-2xl text-white/40" />
                </div>
              </div>
              <div className="absolute top-1/3 right-20 animate-pulse-slow">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <FaHeart className="text-xl text-white/40" />
                </div>
              </div>

              {/* Main Content */}
              <div className="relative h-full flex flex-col justify-between p-10">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0043FC] rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">U</span>
                  </div>
                  <div>
                    <span className="text-white font-bold text-2xl tracking-tight">Úduua</span>
                    <p className="text-white/50 text-xs">Premium Marketplace</p>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="py-8">
                  <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                    Start Your
                    <span className="text-[#79FFFF]"> Shopping Journey</span>
                  </h1>
                  <p className="text-white/70 text-base leading-relaxed">
                    Join our marketplace and discover quality products from verified brands.
                  </p>
                </div>

                {/* Stats Grid - Updated */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FaUserFriends className="text-[#79FFFF] text-sm" />
                      <span className="text-white font-bold text-lg">Trusted</span>
                    </div>
                    <p className="text-white/50 text-xs">Verified Brands</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FaChartLine className="text-[#79FFFF] text-sm" />
                      <span className="text-white font-bold text-lg">Bulk</span>
                    </div>
                    <p className="text-white/50 text-xs">Pricing Available</p>
                  </div>
                </div>

                {/* Feature List - Updated with realistic promises */}
                <div className="space-y-3">
                  {[
                    { icon: FaBox, text: 'Quality verified products' },
                    { icon: FaShieldAlt, text: 'Secure & encrypted payments' },
                    { icon: FaTag, text: 'Retail & bulk pricing available' },
                    { icon: FaHeadset, text: 'Dedicated customer support' }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-white/70">
                      <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                        <feature.icon className="text-[#79FFFF] text-sm" />
                      </div>
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* Trust Badge - Updated */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <FaCheckCircle className="text-[#79FFFF] text-sm" />
                    <span>Trusted by fast-growing brands</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="flex items-center justify-center px-6 py-12 md:px-10 lg:px-14">
              <div className="w-full max-w-md">
                {/* Mobile Logo (visible only on mobile) */}
                <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                  <div className="w-10 h-10 bg-[#0043FC] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">U</span>
                  </div>
                  <span className="text-gray-900 font-bold text-xl tracking-tight">Úduua</span>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#0043FC]/10 rounded-2xl flex items-center justify-center">
                    <FaShoppingBag className="text-2xl text-[#0043FC]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                  <p className="mt-2 text-gray-500 text-sm">
                    Join the Úduua community today
                  </p>
                </div>

                {/* Welcome Message Card */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                  <p className="text-sm text-gray-600">
                    Get access to quality products, bulk pricing, and exclusive deals
                  </p>
                </div>

                {/* Phone Number Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative transition-all duration-300 ${focused ? 'ring-2 ring-[#0043FC]/20' : ''}`}>
                    <FaPhone className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors ${focused ? 'text-[#0043FC]' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="+234 801 234 5678"
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition-all focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC]"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <FaCheckCircle className="text-[#0043FC] text-xs" />
                    We'll send you order updates
                  </p>
                </div>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wide">
                    <span className="bg-white px-4 text-gray-400">Sign up with</span>
                  </div>
                </div>

                {/* Google Sign Up Button */}
                <div className="w-full">
                  {isLoading ? (
                    <div className="w-full h-12 bg-gray-50 rounded-xl flex items-center justify-center gap-3 border border-gray-200">
                      <div className="w-5 h-5 border-2 border-[#0043FC] border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-600 text-sm">Creating account...</span>
                    </div>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      size="large"
                      width="100%"
                      text="signup_with"
                      shape="pill"
                      theme="outline"
                      logo_alignment="center"
                    />
                  )}
                </div>

                {/* Login Link */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => navigate('/uduua/shop/login')}
                      className="font-semibold text-[#0043FC] hover:text-[#0033cc] hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      Sign in
                      <FaArrowRight className="text-xs" />
                    </button>
                  </p>
                </div>

                {/* Terms */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">
                    By signing up, you agree to our{' '}
                    <a href="/terms" className="text-[#0043FC] hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-[#0043FC] hover:underline">Privacy Policy</a>
                  </p>
                </div>

                {/* Mobile Feature Highlights - Updated */}
                <div className="lg:hidden mt-8 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaBox className="text-[#0043FC] text-sm" />
                      <span>Quality verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaShieldAlt className="text-[#0043FC] text-sm" />
                      <span>Secure payments</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaTag className="text-[#0043FC] text-sm" />
                      <span>Bulk pricing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaHeadset className="text-[#0043FC] text-sm" />
                      <span>Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </GoogleOAuthProvider>
  );
};

export default UduuaSignup;