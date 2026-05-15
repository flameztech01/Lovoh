// screens/BiizzedLogin.jsx - Removed email login placeholder
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleAuthMutation } from '../slices/userApiSlice';
import { setCredentials } from '../slices/authslice';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import {
  FaArrowLeft, FaSpinner, FaNewspaper,
} from 'react-icons/fa';

const BiizzedLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [googleAuth, { isLoading }] = useGoogleAuthMutation();

  const redirect = location.search?.split('=')[1] || '/feed';

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, navigate, redirect]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await googleAuth({ token: credential, mode: 'login' }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome back, ${res.name || 'User'}!`);
      navigate(redirect);
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
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
            <FaArrowLeft className="text-sm" />
          </button>
          <img src="/biizzed.png" alt="Biizzed" className="h-8 w-auto" />
          <div className="w-9" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaNewspaper className="text-[#1B3766] text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2 text-sm">Sign in to continue to Biizzed</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Google Button */}
            <div className="flex justify-center">
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
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to={redirect ? `/signup?redirect=${redirect}` : '/signup'} className="text-[#1B3766] font-medium hover:underline">
              Sign up
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to Biizzed's{' '}
            <Link to="/terms" className="underline">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BiizzedLogin;