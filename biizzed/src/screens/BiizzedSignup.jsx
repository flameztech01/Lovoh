// screens/BiizzedSignup.jsx - Phone number field before Google signup
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleAuthMutation } from '../slices/userApiSlice';
import { setCredentials } from '../slices/authslice';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import {
  FaArrowLeft, FaSpinner, FaNewspaper, FaCheck,
  FaBookOpen, FaVideo, FaUsers, FaPhone, FaGoogle,
} from 'react-icons/fa';

const BiizzedSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [googleAuth, { isLoading }] = useGoogleAuthMutation();

  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');

  const redirect = location.search?.split('=')[1] || '/feed';

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, navigate, redirect]);

  const handlePhoneNext = (e) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!cleanedPhone || cleanedPhone.length < 10) {
      toast.error('Please enter a valid phone number (at least 10 digits)');
      return;
    }
    
    setPhone(cleanedPhone);
    setStep('google');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;

    try {
      const res = await googleAuth({
        token: credential,
        mode: 'signup',
        phone: phone,
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome to Biizzed, ${res.name || 'Creator'}! 🎉`);
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || 'Signup failed. Account may already exist.');
      setStep('phone');
    }
  };

  const handleGoogleError = () => toast.error('Google signup failed. Please try again.');

  const features = [
    { icon: FaNewspaper, title: 'Articles', desc: 'Write and share your insights' },
    { icon: FaBookOpen, title: 'Magazines', desc: 'Publish digital magazines' },
    { icon: FaVideo, title: 'Videos', desc: 'Upload educational content' },
    { icon: FaUsers, title: 'Community', desc: 'Connect with creators' },
  ];

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
        <div className="w-full max-w-lg">
          {/* Hero */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaNewspaper className="text-[#1B3766] text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 'phone' ? 'Join Biizzed' : 'Verify with Google'}
            </h1>
            <p className="text-gray-500 mt-2">
              {step === 'phone' 
                ? 'Create, publish, and connect with a global audience' 
                : 'Sign in with Google to complete registration'}
            </p>
          </div>

          {/* Features Grid - Only show on phone step */}
          {step === 'phone' && (
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
          )}

          {/* Signup Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {step === 'phone' ? (
              /* Phone Step */
              <form onSubmit={handlePhoneNext}>
                <div className="text-center mb-5">
                  <div className="w-14 h-14 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaPhone className="text-[#1B3766] text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Phone Number</h3>
                  <p className="text-sm text-gray-500 mt-1">Enter your phone number to get started</p>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08012345678"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold text-sm hover:bg-[#142952] transition-colors flex items-center justify-center gap-2"
                >
                  Continue with Google <FaGoogle className="text-sm" />
                </button>
              </form>
            ) : (
              /* Google Step */
              <>
                <div className="text-center mb-5">
                  <div className="w-14 h-14 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaPhone className="text-[#1B3766] text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Verify with Google to complete</p>
                </div>

                <div className="flex justify-center mb-5">
                  {isLoading ? (
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

                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">free forever</span></div>
                </div>

                {/* Benefits */}
                <div className="space-y-2 mb-5">
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

                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Change phone number
                </button>
              </>
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
    </div>
  );
};

export default BiizzedSignup;