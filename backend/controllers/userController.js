// controllers/userController.js - with notification calls for follower events
import express from 'express';
import mongoose from 'mongoose';
import userMessage from '../models/userMessageModel.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import generateUserToken from "../utils/generateUserToken.js";
import { OAuth2Client } from "google-auth-library";
import { notifyFollowerEvent } from './notificationController.js';   // <-- new
import bcrypt from 'bcryptjs';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/sendOTPEmail.js'; // your email utility

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getUserInfoFromAccessToken = async (accessToken) => {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo ",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user info from Google");
  }

  return response.json();
};

const googleAuth = asyncHandler(async (req, res) => {
  const { token: googleToken, phone, mode } = req.body;

  if (!googleToken) {
    res.status(400);
    throw new Error("Google token is required");
  }

  if (!mode || !["signup", "login"].includes(mode)) {
    res.status(400);
    throw new Error("Valid mode is required");
  }

  let googleId = "";
  let email = "";
  let name = "";
  let picture = "";

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    googleId = payload?.sub || "";
    email = payload?.email || "";
    name = payload?.name || "";
    picture = payload?.picture || "";
  } catch (error) {
    const userInfo = await getUserInfoFromAccessToken(googleToken);

    googleId = userInfo?.sub || `google-${userInfo?.email || Date.now()}`;
    email = userInfo?.email || "";
    name = userInfo?.name || "";
    picture = userInfo?.picture || "";
  }

  if (!email) {
    res.status(400);
    throw new Error("Google account email is required");
  }

  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  });

  if (mode === "signup") {
    const cleanedPhone = String(phone || "").trim();

    if (!cleanedPhone) {
      res.status(400);
      throw new Error("Phone number is required");
    }

    if (user) {
      res.status(400);
      throw new Error("Account already exists. Please login instead.");
    }

    const baseUsername = (email?.split("@")[0] || name || "user")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9_]/g, "") || "user";

    let username = baseUsername;
    let counter = 1;

    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter++}`;
    }

    user = await User.create({
      googleId,
      name: name || "",
      username,
      email,
      phone: cleanedPhone,
      profile: picture || "",
      password: `google-auth-${googleId}`,
      isVerified: true,
      authMethod: "google",
    });
  }

  if (mode === "login") {
    if (!user) {
      res.status(404);
      throw new Error("No account found with this email. Please sign up first.");
    }

    // Only add Google ID if not already present
    if (!user.googleId) {
      user.googleId = googleId;
    }

    // Update profile picture only if user doesn't have one
    if (!user.profile && picture) {
      user.profile = picture;
    }

    // Update name only if user doesn't have one
    if (!user.name && name) {
      user.name = name;
    }

    user.isVerified = true;
    // DO NOT change authMethod to 'google' for existing email/password users
    // Only set authMethod to 'google' during signup.
    await user.save();
  }

  const token = generateUserToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profile: user.profile,
    authMethod: user.authMethod,
    token,
  });
});



const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user with email & password (OTP sent)
// @route   POST /api/users/register
// @access  Public
// @desc    Register new user with email & password (OTP sent)
// @route   POST /api/users/register
// @access  Public
// @desc    Register new user with email & password (OTP sent)
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, phone } = req.body;

  if (!name || !username || !email || !password) {
    res.status(400);
    throw new Error('Name, username, email, and password are required');
  }

  // Check if user already exists (verified or unverified)
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    // If the user is already verified → block re-registration
    if (existingUser.isVerified) {
      res.status(400);
      throw new Error('User with that email or username already exists. Please login instead.');
    }

    // Unverified user → update their information and send a new OTP
    existingUser.name = name;
    existingUser.username = username;
    existingUser.password = password;        // model's pre-save will hash it
    existingUser.phone = phone || '';
    existingUser.otp = generateOTP();
    existingUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await existingUser.save();

    // Send new OTP email (fire and forget)
    sendOTPEmail(existingUser.email, existingUser.otp).catch((err) =>
      console.error('OTP email error:', err)
    );

    return res.status(200).json({
      message: 'An unverified account already exists. A new OTP has been sent to your email.',
      email: existingUser.email,
    });
  }

  // No existing user – create a brand new account
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    name,
    username,
    email,
    password,
    phone: phone || '',
    isVerified: false,
    authMethod: 'email',
    otp,
    otpExpiry,
  });

  // Send OTP email (fire and forget)
  sendOTPEmail(user.email, otp).catch((err) =>
    console.error('OTP email error:', err)
  );

  res.status(201).json({
    message: 'Registration successful. Please check your email for the OTP.',
    email: user.email,
  });
});

// @desc    Verify email using OTP
// @route   POST /api/users/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Email already verified');
  }

  if (!user.otp || !user.otpExpiry) {
    res.status(400);
    throw new Error('No OTP found. Please request a new one.');
  }

  if (user.otp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  if (user.otpExpiry < new Date()) {
    res.status(400);
    throw new Error('OTP has expired. Please request a new one.');
  }

  // Verify user
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // Generate token and log in
  const token = generateUserToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    profile: user.profile,
    authMethod: user.authMethod,
    token,
  });
});

// @desc    Resend OTP to unverified user
// @route   POST /api/users/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Email is already verified');
  }

  // Generate new OTP
  const otp = generateOTP();   // same generateOTP() shown above
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // Send email
  sendOTPEmail(user.email, otp).catch((err) =>
    console.error('OTP email error:', err)
  );

  res.status(200).json({
    message: 'New OTP sent to your email',
    email: user.email,
  });
});

// @desc    Login with email & password
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // If the user's password is auto-generated for Google auth, they cannot use email login
  if (!user.password || user.password.startsWith('google-auth-')) {
    res.status(401);
    throw new Error('This account uses Google Sign-In. Please log in with Google.');
  }

  if (!user.isVerified) {
    res.status(403);
    throw new Error('Email not verified. Please verify first.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateUserToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    profile: user.profile,
    authMethod: user.authMethod,
    token,
  });
});

// @desc    Update user profile (name and profile picture)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name } = req.body;

  if (name !== undefined && name.trim() !== "") {
    user.name = name.trim();
  }

  if (req.file) {
    user.profile = req.file.path;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    profile: updatedUser.profile,
    authMethod: updatedUser.authMethod,
    message: req.file ? "Profile updated with new picture" : "Profile updated",
  });
});

// @desc    Get current user's profile info
// @route   GET /api/users/profile
// @access  Private
const getProfileInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('followers', 'name username profile')
    .populate('following', 'name username profile')
    .populate('likedArticles', 'title slug featuredImage images category readTime')
    .populate('likedMagazines', 'title slug coverImage category')
    .populate('bookmarkedArticles', 'title slug featuredImage images category')
    .populate('bookmarkedMagazines', 'title slug coverImage category');

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// @desc    Get user profile by ID (public)
// @route   GET /api/users/profile/:id
// @access  Public
const getProfileById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -email -phone')
    .populate('followers', 'name username profile')
    .populate('following', 'name username profile');

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// @desc    Follow a user
// @route   POST /api/users/follow/:id
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  console.log('🔵 followUser called');
  console.log('  req.params.id:', req.params.id, 'type:', typeof req.params.id);
  console.log('  req.user._id:', req.user._id);
  
  const userToFollowId = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(userToFollowId)) {
    console.log('❌ Invalid ObjectId format');
    res.status(400);
    throw new Error('Invalid user ID format');
  }

  const userToFollow = await User.findById(userToFollowId);
  if (!userToFollow) {
    console.log('❌ User not found');
    res.status(404);
    throw new Error('User not found');
  }

  const currentUser = await User.findById(req.user._id);
  
  const isAlreadyFollowing = currentUser.following.includes(userToFollowId);
  if (isAlreadyFollowing) {
    console.log('❌ Already following');
    res.status(400);
    throw new Error('Already following this user');
  }

  if (req.user._id.toString() === userToFollowId) {
    console.log('❌ Cannot follow yourself');
    res.status(400);
    throw new Error('Cannot follow yourself');
  }

  currentUser.following.push(userToFollowId);
  userToFollow.followers.push(req.user._id);
  
  await currentUser.save();
  await userToFollow.save();

  // 🔔 Notify the target user
  await notifyFollowerEvent({
    targetUserId: userToFollowId,
    followerName: currentUser.name || currentUser.username,
    type: 'follow',
  });

  console.log('✅ Follow successful');
  res.json({ message: 'Followed successfully' });
});

// @desc    Unfollow a user
// @route   POST /api/users/unfollow/:id
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    res.status(400);
    throw new Error("You cannot unfollow yourself");
  }

  const userToUnfollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);

  if (!userToUnfollow) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!currentUser.following.includes(req.params.id)) {
    res.status(400);
    throw new Error("You are not following this user");
  }

  currentUser.following.pull(req.params.id);
  currentUser.followingCount = currentUser.following.length;
  await currentUser.save();

  userToUnfollow.followers.pull(req.user._id);
  userToUnfollow.followersCount = userToUnfollow.followers.length;
  await userToUnfollow.save();

  // 🔔 Notify the target user
  await notifyFollowerEvent({
    targetUserId: req.params.id,
    followerName: currentUser.name || currentUser.username,
    type: 'unfollow',
  });

  res.json({
    message: `You have unfollowed ${userToUnfollow.name}`,
    following: false,
    followersCount: userToUnfollow.followersCount,
    followingCount: currentUser.followingCount,
  });
});

// @desc    Get user's followers
// @route   GET /api/users/followers/:id
// @access  Public
const getFollowers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findById(req.params.id)
    .populate({
      path: 'followers',
      select: 'name username profile bio',
      options: {
        limit: limit * 1,
        skip: (page - 1) * limit,
      },
    });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const total = user.followers.length;

  res.json({
    followers: user.followers,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get user's following
// @route   GET /api/users/following/:id
// @access  Public
const getFollowing = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findById(req.params.id)
    .populate({
      path: 'following',
      select: 'name username profile bio',
      options: {
        limit: limit * 1,
        skip: (page - 1) * limit,
      },
    });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const total = user.following.length;

  res.json({
    following: user.following,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get users to follow (suggestions)
// @route   GET /api/users/suggestions
// @access  Private
const getUserSuggestions = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  
  const excludeIds = [...currentUser.following, req.user._id];
  
  const suggestions = await User.find({
    _id: { $nin: excludeIds },
    isVerified: true,
  })
    .select('name username profile bio followersCount')
    .sort({ followersCount: -1 })
    .limit(10);

  res.json(suggestions);
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'None',
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await User.updateMany(
    { followers: req.user._id },
    { $pull: { followers: req.user._id }, $inc: { followersCount: -1 } }
  );
  
  await User.updateMany(
    { following: req.user._id },
    { $pull: { following: req.user._id }, $inc: { followingCount: -1 } }
  );

  if (user.profile && !user.profile.includes("googleusercontent")) {
    try {
      const publicId = user.profile.split("/").pop().split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`The_Brave_ProfilePicture/${publicId}`);
      }
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }
  }

  await User.deleteOne({ _id: req.user._id });

  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'None',
  });

  res.status(200).json({ message: "Account deleted successfully" });
});

const postMessage = asyncHandler(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Input all Fields');
  }

  const messages = await userMessage.create({
    name, email, subject, message,
  });

  res.status(201).json(messages);
});


// @desc    Send OTP for password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });

  // For security, always return same message even if email not found
  if (!user) {
    return res.status(200).json({ message: 'If that email exists, we have sent a reset code.' });
  }

  // Do not allow password reset for accounts that never set a password (e.g., pure Google)
  if (!user.password || user.password.startsWith('google-auth-')) {
    return res.status(400).json({ message: 'This account uses Google Sign-In. Please log in with Google.' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOtp = otp;
  user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  // Send email (don't await – fire and forget to avoid delaying response)
  sendPasswordResetEmail(user.email, otp).catch(err => console.error('Password reset email error:', err));

  res.status(200).json({ message: 'Password reset code sent to your email.' });
});

// @desc    Reset password using OTP
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    res.status(400);
    throw new Error('Email, OTP, and new password are required');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check OTP existence and match
  if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Check expiry
  if (user.resetPasswordExpiry < new Date()) {
    res.status(400);
    throw new Error('OTP has expired. Please request a new one.');
  }

  // Update password (pre‑save hook will hash it)
  user.password = newPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successful. Please log in with your new password.' });
});

export {
  postMessage,
  googleAuth,
  registerUser,
  verifyEmail,
  resendOTP,
  loginUser,
  updateProfile,
  logout,
  deleteAccount,
  getProfileInfo,
  getProfileById,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserSuggestions,
  forgotPassword,
  resetPassword,
};