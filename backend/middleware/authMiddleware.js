import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Admin from '../models/adminModel.js';

// @desc    Protect routes - Verify JWT token (handles both admin & user tokens)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for user token first, then admin token
  if (req.cookies && req.cookies.jwt_user) {
    token = req.cookies.jwt_user;
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // Check Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle both token types: user token has userId, admin token has adminId + userId
    const userId = decoded.userId;

    if (!userId) {
      res.status(401);
      throw new Error('Not authorized, invalid token payload');
    }

    // Get user from token
    req.user = await User.findById(userId).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    // Optional: attach admin flag if present
    req.isAdmin = !!decoded.adminId;

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, invalid token');
  }
});

// Unified auth middleware
const protectBoth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt_user) {
    token = req.cookies.jwt_user;
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
        req.user.role = 'user';
        return next();
      }
    }

    if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId).select('-password');
      if (admin) {
        req.user = admin;
        req.user.role = 'admin';
        return next();
      }
    }

    res.status(401);
    throw new Error('Not authorized, invalid token');
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, invalid token');
  }
});


export { protect, protectBoth };