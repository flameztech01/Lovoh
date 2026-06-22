// utils/sendOTPEmail.js
import { Resend } from 'resend';

// Environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'otp@lovohcreate.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Lovoh Create';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://lovohcreate.com';

const getResendClient = () => {
  if (!RESEND_API_KEY) {
    console.warn('Resend API key not configured. Emails will be logged to console in development.');
    return null;
  }
  return new Resend(RESEND_API_KEY);
};

/**
 * Send an OTP email for email verification
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - One-time password
 */
export const sendOTPEmail = async (toEmail, otp) => {
  const resend = getResendClient();

  if (!resend) {
    console.log(`[DEV] OTP for ${toEmail}: ${otp}`);
    return;
  }

  const subject = 'Verify your email address – Lovoh Create';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification – Lovoh Create</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background-color: #0043FC; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; }
    .content { padding: 30px 25px; text-align: center; }
    .otp { display: inline-block; background: #e8f0fe; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0043FC; border-radius: 8px; margin: 25px 0; }
    .info { color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 30px; }
    .footer { text-align: center; padding: 15px 20px; background: #f5f5f5; font-size: 12px; color: #888; }
    .footer a { color: #0043FC; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lovoh Create</h1>
    </div>
    <div class="content">
      <h2 style="margin-top: 0; color: #333;">Verify your email</h2>
      <p class="info">
        Thank you for joining Lovoh Create! Use the code below to complete your registration.
      </p>
      <div class="otp">${otp}</div>
      <p class="info">
        This code is valid for <strong>10 minutes</strong>.<br />
        If you didn't request this, please ignore this email.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Lovoh Create. All rights reserved. <br />
      <a href="${FRONTEND_URL}" target="_blank">${FRONTEND_URL.replace(/^https?:\/\//, '')}</a>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [toEmail],
      subject,
      html,
    });
    console.log(`OTP email sent to ${toEmail} – ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
};

/**
 * Send a password reset OTP email
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - One-time password
 */
export const sendPasswordResetEmail = async (toEmail, otp) => {
  const resend = getResendClient();

  if (!resend) {
    console.log(`[DEV] Password reset OTP for ${toEmail}: ${otp}`);
    return;
  }

  const subject = 'Reset your password – Lovoh Create';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset – Lovoh Create</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background-color: #0043FC; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; }
    .content { padding: 30px 25px; text-align: center; }
    .otp { display: inline-block; background: #e8f0fe; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0043FC; border-radius: 8px; margin: 25px 0; }
    .info { color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 30px; }
    .warning { color: #d32f2f; font-size: 12px; margin-top: 16px; }
    .footer { text-align: center; padding: 15px 20px; background: #f5f5f5; font-size: 12px; color: #888; }
    .footer a { color: #0043FC; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lovoh Create</h1>
    </div>
    <div class="content">
      <h2 style="margin-top: 0; color: #333;">Reset your password</h2>
      <p class="info">
        You requested to reset your password. Use the code below to create a new password.
      </p>
      <div class="otp">${otp}</div>
      <p class="info">
        This code expires in <strong>10 minutes</strong>.<br />
        If you didn't request a password reset, please ignore this email.
      </p>
      <p class="warning">Never share this code with anyone.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Lovoh Create. All rights reserved. <br />
      <a href="${FRONTEND_URL}" target="_blank">${FRONTEND_URL.replace(/^https?:\/\//, '')}</a>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [toEmail],
      subject,
      html,
    });
    console.log(`Password reset email sent to ${toEmail} – ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Resend password reset email error:', error);
    throw error;
  }
};