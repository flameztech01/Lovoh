// screens/CustomFormLogin.jsx - Simple & Mobile Friendly
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleAuthMutation } from '../slices/userApiSlice';
import { setCredentials } from '../slices/authslice';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { FaSpinner, FaClipboardList, FaCheck, FaShieldAlt, FaLock } from 'react-icons/fa';

const CustomFormLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [googleAuth, { isLoading }] = useGoogleAuthMutation();

  const redirect = location.search?.split('=')[1] || '/custom-form/dashboard';

  useEffect(() => {
    if (userInfo) navigate('/custom-form/dashboard');
  }, [userInfo, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await googleAuth({ token: credential, mode: 'login' }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome back, ${res.name || 'User'}!`);
      navigate('/custom-form/dashboard');
    } catch (error) {
      toast.error(error?.data?.message || 'Login failed. Try signing up.');
    }
  };

  const handleGoogleError = () => toast.error('Google login failed. Please try again.');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1B3766] rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-white text-sm" />
            </div>
            <span className="text-lg font-bold text-gray-900">FormFlow</span>
          </div>
          <Link to="/custom-form/signup" className="text-sm text-[#1B3766] font-medium hover:underline">
            Sign Up
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaClipboardList className="text-[#1B3766] text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2 text-sm">Sign in to your FormFlow account</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Google Button */}
            <div className="flex justify-center mb-5">
              {isLoading ? (
                <div className="flex items-center gap-3 px-8 py-3 bg-gray-100 rounded-xl">
                  <FaSpinner className="animate-spin text-[#1B3766]" />
                  <span className="text-gray-600 text-sm">Signing in...</span>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="pill"
                  width="300"
                />
              )}
            </div>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">what you get</span></div>
            </div>

            {/* Benefits */}
            <div className="space-y-2.5 mb-5">
              {[
                'Unlimited forms & submissions',
                'Drag & drop form builder',
                'Real-time analytics',
                'CSV data exports',
                'Team collaboration',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCheck className="text-green-500 text-xs flex-shrink-0" /> {benefit}
                </div>
              ))}
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
              <span className="flex items-center gap-1"><FaLock className="text-[10px]" /> SSL Encrypted</span>
              <span className="flex items-center gap-1"><FaShieldAlt className="text-[10px]" /> Secure</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/custom-form/signup" className="text-[#1B3766] font-medium hover:underline">
              Sign up free
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            © {new Date().getFullYear()} FormFlow
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomFormLogin;