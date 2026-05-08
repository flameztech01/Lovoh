import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Admin from '../models/adminModel.js';

const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Using Authorization header token');
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log('Using cookie token');
  }

  if (!token) {
    res.status(401);
    throw new Error('Not Authorized, no token found');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId).select('-password');

    if (!admin) {
      res.status(401);
      throw new Error('Not Authorized, admin not found');
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not Authorized, invalid token');
  }
});

export { protectAdmin };