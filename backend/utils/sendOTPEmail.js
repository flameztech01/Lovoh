// utils/sendOTPEmail.js
import { Resend } from 'resend';
import UduuaSettings from '../models/uduuaSettingsModel.js';

let resendClient = null;

const getResendClient = async () => {
  if (resendClient) return resendClient;
  
  const settings = await UduuaSettings.findOne();
  
  if (settings && settings.email.resendApiKey) {
    resendClient = new Resend(settings.email.resendApiKey);
  } else {
    console.warn('Resend API key not configured. Email would be sent to console in development.');
    return null;
  }
  
  return resendClient;
};

const getEmailSettings = async () => {
  const settings = await UduuaSettings.findOne();
  return {
    fromEmail: settings?.email?.fromEmail || 'noreply@uduua.com',
    fromName: settings?.email?.fromName || 'Úduua Marketplace',
  };
};

export const sendOTPEmail = async (toEmail, otp) => {
  const resend = await getResendClient();
  const emailSettings = await getEmailSettings();
  
  if (!resend) {
    console.log(`[DEV] OTP for ${toEmail}: ${otp}`);
    return;
  }
  
  const subject = 'Verify your email address – Úduua';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification – Úduua</title>
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
      <h1>Úduua</h1>
    </div>
    <div class="content">
      <h2 style="margin-top: 0; color: #333;">Verify your email</h2>
      <p class="info">
        Thank you for joining Úduua! Use the code below to complete your registration.
      </p>
      <div class="otp">${otp}</div>
      <p class="info">
        This code is valid for <strong>10 minutes</strong>.<br />
        If you didn't request this, please ignore this email.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Úduua. All rights reserved. <br />
      <a href="${process.env.FRONTEND_URL || 'https://uduua.com'}" target="_blank">uduua.com</a>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: `${emailSettings.fromName} <${emailSettings.fromEmail}>`,
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

export const sendPasswordResetEmail = async (toEmail, otp) => {
  const resend = await getResendClient();
  const emailSettings = await getEmailSettings();
  
  if (!resend) {
    console.log(`[DEV] Password reset OTP for ${toEmail}: ${otp}`);
    return;
  }
  
  const subject = 'Reset your password – Úduua';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset – Úduua</title>
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
      <h1>Úduua</h1>
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
      &copy; ${new Date().getFullYear()} Úduua. All rights reserved. <br />
      <a href="${process.env.FRONTEND_URL || 'https://uduua.com'}" target="_blank">uduua.com</a>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: `${emailSettings.fromName} <${emailSettings.fromEmail}>`,
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