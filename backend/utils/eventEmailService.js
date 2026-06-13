import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'Lovoh Create <events@lovohcreate.com>';

// Helper to send email with attachments
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      attachments,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

// Convert data URL to buffer and return attachment object
const createQRAttachment = (qrCodeDataUrl, cid = 'qr_code') => {
  if (!qrCodeDataUrl) return null;
  // data:image/png;base64,xxxxx
  const base64Data = qrCodeDataUrl.split(',')[1];
  if (!base64Data) return null;
  const buffer = Buffer.from(base64Data, 'base64');
  return {
    filename: 'ticket_qr.png',
    content: buffer,
    cid, // Content-ID used in HTML: <img src="cid:qr_code" />
  };
};

// Generate ticket HTML (no inline QR data URL, only cid reference)
const generateTicketHTML = (registration, event, qrCid = null) => {
  const ticketId = registration.ticketId || 'Pending';
  const seatNumber = registration.seatNumber || '';
  const ticketType = registration.ticketType || 'General';
  const quantity = registration.quantity || 1;
  const totalAmount = registration.totalAmount || 0;

  return `
    <div style="max-width:500px;margin:20px auto;background:#fff;border:2px dashed #1B3766;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1B3766,#254899);padding:20px;text-align:center">
        <h2 style="color:#fff;margin:0;font-size:20px">🎟️ Event Ticket</h2>
        <p style="color:#79FFFF;margin:5px 0 0;font-size:12px">Present this ticket at the event for check-in</p>
      </div>
      <div style="padding:20px">
        <p style="text-align:center;font-size:16px;font-weight:bold;color:#1B3766;margin:0 0 15px">${event?.title || 'Event'}</p>
        <div style="background:#f8f9fa;border-radius:12px;padding:15px;margin-bottom:15px">
          <p style="margin:5px 0;font-size:13px"><strong>📅 Date:</strong> ${new Date(event?.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin:5px 0;font-size:13px"><strong>⏰ Time:</strong> ${event?.time || 'TBD'}</p>
          <p style="margin:5px 0;font-size:13px"><strong>📍 Venue:</strong> ${event?.venue || event?.location || 'TBD'}</p>
          <p style="margin:5px 0;font-size:13px"><strong>👤 Attendee:</strong> ${registration.name}</p>
          ${seatNumber ? `<p style="margin:5px 0;font-size:13px"><strong>💺 Seat:</strong> #${seatNumber}</p>` : ''}
          ${ticketType !== 'General' ? `<p style="margin:5px 0;font-size:13px"><strong>🎫 Type:</strong> ${ticketType}</p>` : ''}
          ${quantity > 1 ? `<p style="margin:5px 0;font-size:13px"><strong>📦 Quantity:</strong> ${quantity} ticket(s)</p>` : ''}
          ${totalAmount > 0 ? `<p style="margin:5px 0;font-size:13px"><strong>💰 Amount:</strong> ₦${totalAmount.toLocaleString()}</p>` : ''}
        </div>
        
        ${qrCid ? `<div style="text-align:center;margin-bottom:15px"><img src="cid:${qrCid}" alt="QR Code" style="width:180px;height:180px;border:1px solid #ddd;border-radius:8px;padding:10px;" /><p style="font-size:12px;color:#666;margin:5px 0 0">Scan to verify your ticket</p></div>` : ''}
        
        <div style="background:#1B3766;border-radius:8px;padding:12px;text-align:center;margin-bottom:10px">
          <p style="color:#79FFFF;font-size:11px;margin:0">TICKET ID</p>
          <p style="color:#fff;font-size:18px;font-weight:bold;margin:5px 0;letter-spacing:2px">${ticketId}</p>
        </div>
        <p style="text-align:center;font-size:11px;color:#999;margin:0">This ticket is unique. Do not share.</p>
      </div>
      <div style="background:#f1f5f9;padding:12px;text-align:center;font-size:10px;color:#999">
        © ${new Date().getFullYear()} Lovoh Creates. All rights reserved.
      </div>
    </div>
  `;
};

// ==================== REGISTRATION CONFIRMATION (with QR attachment) ====================
export const sendRegistrationConfirmation = async (email, name, eventTitle, eventDate, eventTime, venue, registration, event, qrCodeDataUrl = null) => {
  const subject = `🎉 You're registered for ${eventTitle}!`;
  const isVirtual = event?.isVirtual;
  const meetingLink = event?.meetingLink;

  const locationBlock = isVirtual
    ? `
      <p style="margin:5px 0"><strong>🌐 Online Event</strong></p>
      ${meetingLink ? `<p style="margin:5px 0"><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}" style="color:#1B3766">${meetingLink}</a></p>` : ''}
    `
    : (venue ? `<p style="margin:5px 0"><strong>📍 Venue:</strong> ${venue}</p>` : '');

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#1B3766,#254899);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">Registration Confirmed! 🎉</h1>
      </div>
      <div style="padding:30px">
        <p style="font-size:16px;color:#333">Hi ${name},</p>
        <p style="font-size:16px;color:#333;line-height:1.6">
          Your registration for <strong>${eventTitle}</strong> has been confirmed.
        </p>
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:5px 0"><strong>📅 Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin:5px 0"><strong>⏰ Time:</strong> ${eventTime || 'TBD'}</p>
          ${locationBlock}
        </div>

        ${generateTicketSummary(registration)}
        ${generateAttendeesList(registration)}

        <p style="font-size:14px;color:#666">Your ticket is attached below. Bring it to the event!</p>
      </div>
      ${generateTicketHTML(registration, event || { title: eventTitle, date: eventDate, time: eventTime, venue }, 'ticket_qr')}
      <div style="background:#f1f5f9;padding:20px;text-align:center;font-size:12px;color:#999">
        © ${new Date().getFullYear()} Lovoh Create. All rights reserved.
      </div>
    </div>
  `;

  const attachments = [];
  if (qrCodeDataUrl) {
    const qrAtt = createQRAttachment(qrCodeDataUrl, 'ticket_qr');
    if (qrAtt) attachments.push(qrAtt);
  }
  await sendEmail(email, subject, html, attachments);
};

// ==================== PAYMENT CONFIRMATION (with QR attachment) ====================
export const sendPaymentConfirmation = async (email, name, eventTitle, amount, registration, event, qrCodeDataUrl = null) => {
  const subject = `✅ Payment Confirmed - ${eventTitle}`;
  const isVirtual = event?.isVirtual;
  const meetingLink = event?.meetingLink;
  const venue = event?.venue || event?.location;

  const locationBlock = isVirtual
    ? `
      <p style="margin:5px 0"><strong>🌐 Online Event</strong></p>
      ${meetingLink ? `<p style="margin:5px 0"><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}" style="color:#1B3766">${meetingLink}</a></p>` : ''}
    `
    : (venue ? `<p style="margin:5px 0"><strong>📍 Venue:</strong> ${venue}</p>` : '');

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:linear-gradient(135deg,#059669,#10b981);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">Payment Confirmed! ✅</h1>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="font-size:16px">Hi ${name},</p>
        <p style="font-size:16px">Your payment of <strong>₦${amount.toLocaleString()}</strong> for <strong>${eventTitle}</strong> has been confirmed.</p>
        
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:5px 0"><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin:5px 0"><strong>⏰ Time:</strong> ${event.time || 'TBD'}</p>
          ${locationBlock}
        </div>
        
        ${generateTicketSummary(registration)}
        ${generateAttendeesList(registration)}
        
        <p style="font-size:14px;color:#666">You're all set! Your ticket is attached below. Bring it to the event for check-in.</p>
      </div>
      ${generateTicketHTML(registration, event || { title: eventTitle }, 'ticket_qr')}
    </div>
  `;

  const attachments = [];
  if (qrCodeDataUrl) {
    const qrAtt = createQRAttachment(qrCodeDataUrl, 'ticket_qr');
    if (qrAtt) attachments.push(qrAtt);
  }
  await sendEmail(email, subject, html, attachments);
};

// ==================== INDIVIDUAL TICKET TO ATTENDEE (with QR attachment) ====================
export const sendTicketToAttendee = async (email, name, eventTitle, eventDate, eventTime, venue, ticketId, seatNumber, event, qrCodeDataUrl = null) => {
  const subject = `🎟️ Your Ticket for ${eventTitle}`;
  const isVirtual = event?.isVirtual;
  const meetingLink = event?.meetingLink;

  const locationBlock = isVirtual
    ? `
      <p style="margin:5px 0"><strong>🌐 Online Event</strong></p>
      ${meetingLink ? `<p style="margin:5px 0"><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}" style="color:#1B3766">${meetingLink}</a></p>` : ''}
    `
    : (venue ? `<p style="margin:5px 0"><strong>📍 Venue:</strong> ${venue}</p>` : '');

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#1B3766,#254899);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">Your Event Ticket 🎟️</h1>
        <p style="color:#79FFFF;margin:5px 0 0;font-size:14px">${eventTitle}</p>
      </div>
      <div style="padding:30px">
        <p style="font-size:16px;color:#333">Hi ${name},</p>
        <p style="font-size:16px;color:#333">A ticket has been purchased for you for this event!</p>
        
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:5px 0"><strong>📅 Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin:5px 0"><strong>⏰ Time:</strong> ${eventTime || 'TBD'}</p>
          ${locationBlock}
        </div>
        
        ${qrCodeDataUrl ? `<div style="text-align:center;margin:20px 0"><img src="cid:ticket_qr" alt="QR Code" style="width:200px;height:200px;border:1px solid #ddd;border-radius:8px;padding:10px;" /></div>` : ''}
        
        <div style="background:#1B3766;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
          <p style="color:#79FFFF;font-size:11px;margin:0">TICKET ID</p>
          <p style="color:#fff;font-size:22px;font-weight:bold;margin:5px 0;letter-spacing:2px">${ticketId || 'Pending'}</p>
          ${seatNumber ? `<p style="color:#79FFFF;font-size:13px;margin:5px 0">Seat: #${seatNumber}</p>` : ''}
        </div>
        
        <p style="font-size:14px;color:#666">Present this ticket at the event for check-in.</p>
      </div>
      <div style="background:#f1f5f9;padding:20px;text-align:center;font-size:12px;color:#999">
        © ${new Date().getFullYear()} Lovoh Create. All rights reserved.
      </div>
    </div>
  `;

  const attachments = [];
  if (qrCodeDataUrl) {
    const qrAtt = createQRAttachment(qrCodeDataUrl, 'ticket_qr');
    if (qrAtt) attachments.push(qrAtt);
  }
  await sendEmail(email, subject, html, attachments);
};

// ==================== Helper functions (unchanged) ====================
const generateAttendeesList = (registration) => {
  if (!registration?.additionalAttendees?.length) return '';
  return `
    <div style="background:#f8f9fa;border-radius:8px;padding:15px;margin:15px 0">
      <p style="font-size:14px;font-weight:bold;color:#1B3766;margin:0 0 10px">👥 Additional Attendees</p>
      ${registration.additionalAttendees.map(att => `
        <div style="margin:8px 0;padding:10px;background:#fff;border-radius:6px;border:1px solid #e5e7eb">
          <p style="margin:0;font-size:13px;font-weight:bold">${att.name}</p>
          <p style="margin:3px 0;font-size:11px;color:#666">📧 ${att.email || 'N/A'}</p>
          <p style="margin:3px 0;font-size:11px;color:#666">🎫 Ticket: ${att.ticketId || 'Pending'} | 💺 Seat: #${att.seatNumber || 'TBD'}</p>
        </div>
      `).join('')}
    </div>
  `;
};

const generateTicketSummary = (registration) => {
  const quantity = registration.quantity || 1;
  const ticketType = registration.ticketType || 'General';
  const totalAmount = registration.totalAmount || 0;
  const seatsPerTicket = registration.seatsPerTicket || 1;

  return `
    <div style="background:#f8f9fa;border-radius:8px;padding:15px;margin:15px 0">
      <p style="font-size:14px;font-weight:bold;color:#1B3766;margin:0 0 8px">📋 Ticket Summary</p>
      <p style="margin:3px 0;font-size:13px"><strong>Type:</strong> ${ticketType}</p>
      <p style="margin:3px 0;font-size:13px"><strong>Quantity:</strong> ${quantity} ticket(s)</p>
      ${seatsPerTicket > 1 ? `<p style="margin:3px 0;font-size:13px"><strong>Seats per Ticket:</strong> ${seatsPerTicket}</p>` : ''}
      <p style="margin:3px 0;font-size:13px"><strong>Total Seats:</strong> ${quantity * seatsPerTicket}</p>
      ${totalAmount > 0 ? `<p style="margin:3px 0;font-size:15px;font-weight:bold;color:#059669">Total Paid: ₦${totalAmount.toLocaleString()}</p>` : ''}
    </div>
  `;
};

// ==================== All other email functions (unchanged, they don't need QR) ====================
export const sendNewRegistrationToCreator = async (creatorEmail, eventTitle, attendeeName, attendeeEmail, type, ticketId, seatNumber, quantity = 1) => {
  const subject = `📋 New ${type === 'paid' ? 'Paid ' : ''}Registration for ${eventTitle}`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:linear-gradient(135deg,#1B3766,#254899);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">New Registration! 📋</h1>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="font-size:16px">Someone just registered for <strong>${eventTitle}</strong>.</p>
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:5px 0"><strong>Name:</strong> ${attendeeName}</p>
          <p style="margin:5px 0"><strong>Email:</strong> ${attendeeEmail}</p>
          <p style="margin:5px 0"><strong>Type:</strong> ${type === 'paid' ? '💰 Paid Registration' : '🆓 Free Registration'}</p>
          <p style="margin:5px 0"><strong>Quantity:</strong> ${quantity} ticket(s)</p>
          ${ticketId ? `<p style="margin:5px 0"><strong>🎫 Ticket ID:</strong> ${ticketId}</p>` : ''}
          ${seatNumber ? `<p style="margin:5px 0"><strong>💺 Seat:</strong> #${seatNumber}</p>` : ''}
        </div>
        <a href="${process.env.FRONTEND_URL}/events/dashboard/events" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">View Dashboard</a>
      </div>
    </div>
  `;
  await sendEmail(creatorEmail, subject, html);
};

export const sendPaymentToCreator = async (creatorEmail, eventTitle, attendeeName, amount, creatorPercentage) => {
  const creatorShare = (amount * creatorPercentage) / 100;
  const subject = `💰 Payment Received for ${eventTitle}`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:linear-gradient(135deg,#059669,#10b981);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">Payment Received! 💰</h1>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="font-size:16px">Good news! A payment has been received for <strong>${eventTitle}</strong>.</p>
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:5px 0"><strong>Attendee:</strong> ${attendeeName}</p>
          <p style="margin:5px 0"><strong>Total Amount:</strong> ₦${amount.toLocaleString()}</p>
          ${creatorPercentage > 0 ? `<p style="margin:5px 0"><strong>Your Share (${creatorPercentage}%):</strong> ₦${creatorShare.toLocaleString()}</p>` : ''}
        </div>
        <p style="font-size:14px;color:#666">${creatorPercentage > 0 ? 'Your share has been credited to your subaccount.' : 'This is a company event.'}</p>
        <a href="${process.env.FRONTEND_URL}/events/dashboard/wallet" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">View Wallet</a>
      </div>
    </div>
  `;
  await sendEmail(creatorEmail, subject, html);
};

export const sendEventReportNotice = async (creatorEmail, eventTitle, reportCount, action = 'reported') => {
  const subject = action === 'disabled' 
    ? `⚠️ Your event "${eventTitle}" has been disabled`
    : `⚠️ Your event "${eventTitle}" has been reported`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:${action === 'disabled' ? '#dc2626' : '#f59e0b'};padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">${action === 'disabled' ? 'Event Disabled ⚠️' : 'Event Reported ⚠️'}</h1>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="font-size:16px">${action === 'disabled'
          ? `Your event "${eventTitle}" has been disabled due to multiple reports. Please contact support for more information.`
          : `Your event "${eventTitle}" has been reported by a user. Current report count: ${reportCount}. If reports reach 5, the event may be disabled.`
        }</p>
        <p style="font-size:14px;color:#666">If you believe this is a mistake, please reach out to our support team.</p>
      </div>
    </div>
  `;
  await sendEmail(creatorEmail, subject, html);
};

export const sendWalletSetupConfirmation = async (email, name) => {
  const subject = '✅ Your Payment Wallet is Ready!';
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:linear-gradient(135deg,#1B3766,#254899);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">Wallet Ready! ✅</h1>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="font-size:16px">Hi ${name},</p>
        <p style="font-size:16px">Your payment wallet has been set up successfully. You can now create paid events and receive payments directly.</p>
        <p style="font-size:14px;color:#666">Earnings from your events will be automatically split and your share (94%) will be settled to your bank by Paystack.</p>
        <a href="${process.env.FRONTEND_URL}/events/dashboard/wallet" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">View Wallet</a>
      </div>
    </div>
  `;
  await sendEmail(email, subject, html);
};

export const sendWithdrawalConfirmation = async (email, name, amount) => {
  const subject = `💸 Withdrawal of ₦${amount.toLocaleString()} Initiated`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:linear-gradient(135deg,#1B3766,#254899);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">Withdrawal Initiated 💸</h1>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="font-size:16px">Hi ${name},</p>
        <p style="font-size:16px">Your withdrawal of <strong>₦${amount.toLocaleString()}</strong> has been initiated and will be sent to your registered bank account.</p>
        <p style="font-size:14px;color:#666">The transfer typically takes 1-3 business days to reflect in your account.</p>
      </div>
    </div>
  `;
  await sendEmail(email, subject, html);
};

export const sendSettlementNotification = async (email, name, totalAmount, transactionCount) => {
  const subject = `💰 ₦${totalAmount.toLocaleString()} Settled to Your Bank Account`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:linear-gradient(135deg,#059669,#10b981);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">Funds Settled! 💰</h1>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="font-size:16px">Hi ${name},</p>
        <p style="font-size:16px;line-height:1.6">
          Great news! <strong>₦${totalAmount.toLocaleString()}</strong> from <strong>${transactionCount} event registration${transactionCount > 1 ? 's' : ''}</strong> has been settled to your bank account.
        </p>
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:5px 0;font-size:18px;font-weight:bold;color:#059669">₦${totalAmount.toLocaleString()}</p>
          <p style="margin:5px 0;font-size:14px;color:#666">${transactionCount} transaction${transactionCount > 1 ? 's' : ''} settled</p>
        </div>
        <p style="font-size:14px;color:#666">The funds should reflect in your bank account within 1-3 business days depending on your bank.</p>
        <a href="${process.env.FRONTEND_URL}/events/dashboard/wallet" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:10px">View Wallet</a>
      </div>
    </div>
  `;
  await sendEmail(email, subject, html);
};

export const sendEventReminder = async (email, name, event, daysRemaining, reminderType, registration = null) => {
  let subject = '';
  let reminderText = '';
  
  if (reminderType === '3_days') {
    subject = `⏰ Only 3 Days Left! ${event.title}`;
    reminderText = 'Your event is just 3 days away! Get ready!';
  } else if (reminderType === '2_days') {
    subject = `🎉 ${event.title} is in 2 Days!`;
    reminderText = 'Get ready! Your event is happening in 2 days.';
  } else if (reminderType === '1_day') {
    subject = `🚀 Tomorrow! ${event.title}`;
    reminderText = 'Your event is TOMORROW! Here\'s everything you need to know.';
  } else if (reminderType === 'event_today') {
    subject = `🎯 TODAY is the Day! ${event.title}`;
    reminderText = 'Your event is TODAY! Get ready and don\'t be late!';
  } else {
    subject = `📅 Reminder: ${event.title} is in ${daysRemaining} days`;
    reminderText = `Your event is coming up in ${daysRemaining} days! Don't miss it!`;
  }
  
  const isVirtual = event?.isVirtual;
  const meetingLink = event?.meetingLink;
  const venue = event?.venue || event?.location;
  
  const locationBlock = isVirtual
    ? `
      <p style="margin:5px 0"><strong>🌐 Online Event</strong></p>
      ${meetingLink ? `<p style="margin:5px 0"><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}" style="color:#1B3766">${meetingLink}</a></p>` : ''}
    `
    : (venue ? `<p style="margin:5px 0"><strong>📍 Venue:</strong> ${venue}</p>` : '');
  
  const ticketInfo = registration ? `
    <div style="background:#1B3766;border-radius:8px;padding:15px;margin:20px 0;text-align:center">
      <p style="color:#79FFFF;font-size:11px;margin:0">YOUR TICKET ID</p>
      <p style="color:#fff;font-size:18px;font-weight:bold;margin:5px 0;letter-spacing:2px">${registration.ticketId || 'N/A'}</p>
      ${registration.seatNumber ? `<p style="color:#79FFFF;font-size:13px;margin:5px 0">Seat: #${registration.seatNumber}</p>` : ''}
    </div>
  ` : '';
  
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#1B3766,#254899);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0">Event Reminder ⏰</h1>
        <p style="color:#79FFFF;margin:10px 0 0;font-size:16px">${reminderText}</p>
      </div>
      <div style="padding:30px">
        <p style="font-size:16px;color:#333">Hi ${name},</p>
        <p style="font-size:16px;color:#333;line-height:1.6">
          This is a reminder for <strong>${event.title}</strong>.
        </p>
        
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:5px 0;font-size:14px;font-weight:bold;color:#1B3766">Event Details:</p>
          <p style="margin:5px 0"><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin:5px 0"><strong>⏰ Time:</strong> ${event.time || 'TBD'}</p>
          ${locationBlock}
          ${event.description ? `<p style="margin:10px 0 0;color:#666">${event.description.substring(0, 200)}${event.description.length > 200 ? '...' : ''}</p>` : ''}
        </div>
        
        ${ticketInfo}
        
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:8px">
          <p style="margin:0;font-size:14px;color:#92400e">
            <strong>💡 Quick Tips:</strong><br>
            • Arrive at least 15 minutes early<br>
            • Have your ticket ready (digital or printed)<br>
            • Bring a valid ID for verification
          </p>
        </div>
        
        <a href="${process.env.FRONTEND_URL}/events/${event.slug || event._id}" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:10px">View Event Details</a>
      </div>
      <div style="background:#f1f5f9;padding:20px;text-align:center;font-size:12px;color:#999">
        <p style="margin:0">Need help? Contact us at eventroom@lovohcreate.com</p>
        <p style="margin:5px 0 0">© ${new Date().getFullYear()} Lovoh Create. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await sendEmail(email, subject, html);
};