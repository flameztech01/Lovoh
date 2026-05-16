// screens/EventLogin.jsx – With proper error handling and forgot password modal
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../slices/authslice";
import {
  useGoogleAuthMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../slices/userApiSlice";
import { toast } from "react-toastify";
import {
  FaGoogle,
  FaArrowLeft,
  FaCalendarAlt,
  FaTicketAlt,
  FaSpinner,
  FaEnvelope,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaTimes,
} from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";

const EventLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { userInfo } = useSelector((state) => state.auth);

  // Mutations
  const [googleAuth, { isLoading: googleLoading }] = useGoogleAuthMutation();
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [forgotPassword, { isLoading: forgotLoading }] =
    useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetLoading }] =
    useResetPasswordMutation();

  const redirect = searchParams.get("redirect") || "/dashboard";

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState("email"); // 'email' or 'reset'
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  // Email/Password Login – FIXED: preventDefault first
  const handleEmailLogin = async (e) => {
    e.preventDefault(); // 🔥 MUST be first to prevent page reload
    e.stopPropagation(); // Add this too
    console.log("Form submit intercepted");

    // Basic validation
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password");
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...result }));
      toast.success(`Welcome back, ${result.name}!`);
      navigate(redirect);
    } catch (err) {
      console.error("Login error:", err);
      // Safely extract error message from RTK Query error structure
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Login failed. Check your email and password.";
      toast.error(errorMsg);
      // Optionally clear password field for security
      setPassword("");
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      // Google OAuth 2.0 token client
      const client = window.google?.accounts?.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "email profile",
        callback: async (response) => {
          if (response.access_token) {
            try {
              const result = await googleAuth({
                token: response.access_token,
                mode: "login",
              }).unwrap();
              dispatch(setCredentials({ ...result }));
              toast.success(`Welcome back, ${result.name}!`);
              navigate(redirect);
            } catch (err) {
              toast.error(err?.data?.message || "Google login failed");
            }
          } else {
            toast.error("Google authentication failed");
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      toast.error("Google Sign-In is not available. Please try again later.");
    }
  };

  // ----- Forgot Password Flow -----
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError("Email is required");
      return;
    }
    setResetError("");
    try {
      await forgotPassword({ email: resetEmail }).unwrap();
      setModalStep("reset");
      toast.success("OTP sent to your email");
    } catch (err) {
      const msg = err?.data?.message || "Failed to send OTP. Try again.";
      setResetError(msg);
      toast.error(msg);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) {
      setResetError("OTP is required");
      return;
    }
    if (!newPassword) {
      setResetError("New password is required");
      return;
    }
    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }
    setResetError("");
    try {
      await resetPassword({ email: resetEmail, otp, newPassword }).unwrap();
      toast.success("Password reset successfully. Please log in.");
      setShowModal(false);
      // Reset modal state
      setModalStep("email");
      setResetEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err?.data?.message || "Reset failed. Invalid OTP or expired.";
      setResetError(msg);
      toast.error(msg);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalStep("email");
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Header />

      <div className="max-w-md mx-auto px-4 py-16 pt-24">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-8 transition-colors text-sm group"
        >
          <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
            <FaCalendarAlt className="text-[#1B3766] text-sm" />
            <span className="text-[#1B3766] font-semibold text-xs uppercase tracking-wider">
              Event Creator
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm">
            Sign in to manage your events and track registrations
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-xs text-[#1B3766] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-6"
            >
              {loginLoading ? (
                <FaSpinner className="w-5 h-5 animate-spin" />
              ) : (
                <FaEnvelope className="w-5 h-5" />
              )}
              <span>
                {loginLoading ? "Signing in..." : "Sign In with Email"}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">
                or sign in with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-[#1B3766] hover:text-[#1B3766] hover:bg-blue-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <FaSpinner className="w-5 h-5 animate-spin" />
            ) : (
              <FaGoogle className="w-5 h-5" />
            )}
            <span>
              {googleLoading ? "Signing in..." : "Continue with Google"}
            </span>
          </button>

          {/* Benefits */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaTicketAlt className="text-[#1B3766] flex-shrink-0" />
              <span>Create and manage events</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaCalendarAlt className="text-[#1B3766] flex-shrink-0" />
              <span>Track registrations in real-time</span>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link
            to={`/signup${redirect ? `?redirect=${redirect}` : ""}`}
            className="text-[#1B3766] font-semibold hover:underline"
          >
            Create one here
          </Link>
        </p>
      </div>

      <Footer />

      {/* Forgot Password Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>

            {modalStep === "email" ? (
              // Step 1: Enter Email
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Reset Password
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Enter your email and we'll send you a reset code.
                </p>
                <form onSubmit={handleSendOtp}>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      placeholder="you@example.com"
                    />
                  </div>
                  {resetError && (
                    <p className="text-red-500 text-xs mb-3">{resetError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : null}
                    {forgotLoading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
              </div>
            ) : (
              // Step 2: Enter OTP and New Password
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Set New Password
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Enter the 6‑digit code sent to {resetEmail}
                </p>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      placeholder="123456"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full pr-10 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                        placeholder="•••••••• (min 6 chars)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <FaEyeSlash className="text-sm" />
                        ) : (
                          <FaEye className="text-sm" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {resetError && (
                    <p className="text-red-500 text-xs mb-3">{resetError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : null}
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventLogin;
