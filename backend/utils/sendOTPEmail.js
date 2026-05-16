// utils/sendOTPEmail.js (or sendEmailUtils.js)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an OTP email to the provided address.
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - The 6‑digit OTP code
 * @returns {Promise<object>} Resend API response
 */
export const sendOTPEmail = async (toEmail, otp) => {
  const fromEmail = process.env.EMAIL_FROM || 'noreply@lovohcreate.com';
  const subject = 'Verify your email address – Lovoh Create';
  
  // HTML email template
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification – Lovoh Create</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background-color: #ff69b4; padding: 30px 20px; text-align: center; }
    .header img { height: 40px; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 10px 0 0; }
    .content { padding: 30px 25px; text-align: center; }
    .otp { display: inline-block; background: #fff0f5; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ff1493; border-radius: 8px; margin: 25px 0; }
    .info { color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 30px; }
    .footer { text-align: center; padding: 15px 20px; background: #f5f5f5; font-size: 12px; color: #888; }
    .footer a { color: #ff69b4; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <!-- Replace with actual logo URL if you have one -->
      <img src="https://lovohcreate.com/logo.png" alt="Lovoh Create" style="height: 40px;" />
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
        If you didn’t request this, please ignore this email.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Lovoh Create. All rights reserved. <br />
      <a href="https://lovohcreate.com" target="_blank">lovohcreate.com</a>
    </div>
  </div>
</body>
</html>
  `;

  const text = `Your Lovoh Create verification code is: ${otp}. It expires in 10 minutes. If you didn't request this, ignore this email.`;

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      text,
    });
    console.log(`OTP email sent to ${toEmail} – ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
};

/**
 * Sends a password reset OTP email.
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - The 6‑digit reset code
 * @returns {Promise<object>} Resend API response
 */
export const sendPasswordResetEmail = async (toEmail, otp) => {
  const fromEmail = process.env.EMAIL_FROM || 'noreply@lovohcreate.com';
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
    .header { background-color: #ff69b4; padding: 30px 20px; text-align: center; }
    .header img { height: 40px; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 10px 0 0; }
    .content { padding: 30px 25px; text-align: center; }
    .otp { display: inline-block; background: #fff0f5; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ff1493; border-radius: 8px; margin: 25px 0; }
    .info { color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 30px; }
    .warning { color: #d32f2f; font-size: 12px; margin-top: 16px; }
    .footer { text-align: center; padding: 15px 20px; background: #f5f5f5; font-size: 12px; color: #888; }
    .footer a { color: #ff69b4; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://lovohcreate.com/logo.png" alt="Lovoh Create" style="height: 40px;" />
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
        If you didn’t request a password reset, please ignore this email.
      </p>
      <p class="warning">Never share this code with anyone.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Lovoh Create. All rights reserved. <br />
      <a href="https://lovohcreate.com" target="_blank">lovohcreate.com</a>
    </div>
  </div>
</body>
</html>
  `;

  const text = `Your Lovoh Create password reset code is: ${otp}. It expires in 10 minutes. If you didn't request this, ignore this email. Never share this code.`;

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      text,
    });
    console.log(`Password reset email sent to ${toEmail} – ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Resend password reset email error:', error);
    throw error;
  }
};