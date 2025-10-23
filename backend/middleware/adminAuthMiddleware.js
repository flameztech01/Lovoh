import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Admin from '../models/adminModel.js';

const protectAdmin = asyncHandler(async (req, res, next) => {
    console.log('=== ADMIN AUTH DEBUG ===');
    console.log('Cookies:', req.cookies);
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    let token = req.cookies.jwt;

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.admin = await Admin.findById(decoded.adminId).select('-password');
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not Authorized, invalid token');
        }
    } else{
        res.status(401);    
        throw new Error('Not Authorized, no Token');
    }
});

export {protectAdmin};