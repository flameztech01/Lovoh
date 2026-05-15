// screens/UduuaLogin.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaGoogle,
  FaArrowRight,
  FaShoppingBag,
  FaCheckCircle,
  FaStore,
  FaArrowLeft,
  FaTruck,
  FaShieldAlt,
  FaBox,
  FaHeadset,
  FaStar,
  FaUserFriends,
  FaHeart,
  FaTag,
  FaChartLine
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import { setCredentials } from '../slices/authslice.js';
import { useGoogleAuthMutation } from '../slices/userApiSlice';

const UduuaLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [isLoading, setIsLoading] = useState(false);
  const [googleAuth] = useGoogleAuthMutation();
  const { userInfo } = useSelector((state) => state.auth);
  
  const redirect = location.search ? location.search.split('=')[1] : '/shop';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  // Google Login Handler
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await googleAuth({ 
          token: tokenResponse.access_token,
          mode: 'login'
        }).unwrap();
        
        dispatch(setCredentials({ ...res }));
        toast.success('Login successful! Welcome back.');
        navigate(redirect);
      } catch (error) {
        toast.error(error?.data?.message || 'Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error('Google login failed. Please try again.');
      setIsLoading(false);
    },
  });

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      {/* Back Button */}
      <button
        onClick={() => navigate('/shop')}
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
                <FaHeart className="text-2xl text-white/40" />
              </div>
            </div>
            <div className="absolute top-1/3 right-20 animate-pulse-slow">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <FaShoppingBag className="text-xl text-white/40" />
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
                  Welcome
                  <span className="text-[#79FFFF]"> Back!</span>
                </h1>
                <p className="text-white/70 text-base leading-relaxed">
                  Sign in to access your account, track orders, and enjoy a seamless shopping experience.
                </p>
              </div>

              {/* Stats Grid */}
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

              {/* Trust Badge */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <FaCheckCircle className="text-[#79FFFF] text-sm" />
                  <span>Trusted by fast-growing brands</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
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
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="mt-2 text-gray-500 text-sm">
                  Sign in to continue shopping at Úduua
                </p>
              </div>

              {/* Welcome Message Card */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-gray-600">
                  Access your profile, track orders, and enjoy exclusive member benefits
                </p>
              </div>

              {/* Google Login Button */}
              <button
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
                className="w-full py-3.5 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-[#0043FC] hover:bg-[#0043FC]/5 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0043FC] border-t-transparent rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <FaGoogle className="text-red-500 text-xl" />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-white px-4 text-gray-400">New to Úduua?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    to="/shop/signup"
                    className="font-semibold text-[#0043FC] hover:text-[#0033cc] hover:underline inline-flex items-center gap-1 transition-colors"
                  >
                    Create account
                    <FaArrowRight className="text-xs" />
                  </Link>
                </p>
              </div>

              {/* Terms */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  By continuing, you agree to our{' '}
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
    </div>
  );
};

export default UduuaLogin;