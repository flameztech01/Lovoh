import jwt from 'jsonwebtoken';

const generateToken = (res, adminId) => {
    const token = jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development' || true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return token;
};

export default generateToken;
