import jwt from 'jsonwebtoken';

const generateToken = (res, adminId) => {
    const token = jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        
    });
    console.log('Token generated:', token.substring(0, 30) + '...');
console.log('Cookie set with maxAge:', 30 * 24 * 60 * 60 * 1000);

    return token;
};

export default generateToken;