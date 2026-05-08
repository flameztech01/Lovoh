import jwt from 'jsonwebtoken';

const generateUserToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.cookie('jwt_user', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'None',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    console.log('Token generated:', token.substring(0, 30) + '...');
console.log('Cookie set with maxAge:', 30 * 24 * 60 * 60 * 1000);

    return token;
};

export default generateUserToken;