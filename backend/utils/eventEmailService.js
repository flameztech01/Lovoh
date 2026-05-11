// utils/eventEmailService.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'Lovoh Create <events@lovohcreate.com>';

// Template wrapper
const sendEmail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

// Generate ticket HTML for email
const generateTicketHTML = (registration, event) => {
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

// Additional attendees list HTML
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

// Ticket summary box
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

// ==================== REGISTRATION CONFIRMATION ====================

export const sendRegistrationConfirmation = async (email, name, eventTitle, eventDate, eventTime, venue, registration, event) => {
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
      ${generateTicketHTML(registration, event || { title: eventTitle, date: eventDate, time: eventTime, venue })}
      <div style="background:#f1f5f9;padding:20px;text-align:center;font-size:12px;color:#999">
        © ${new Date().getFullYear()} Lovoh Create. All rights reserved.
      </div>
    </div>
  `;
  await sendEmail(email, subject, html);
};

// ==================== NEW REGISTRATION TO CREATOR ====================

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

// ==================== PAYMENT CONFIRMATION ====================

export const sendPaymentConfirmation = async (email, name, eventTitle, amount, registration, event) => {
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
      ${generateTicketHTML(registration, event || { title: eventTitle })}
    </div>
  `;
  await sendEmail(email, subject, html);
};

// ==================== PAYMENT TO CREATOR ====================

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

// ==================== INDIVIDUAL TICKET TO ATTENDEE ====================

export const sendTicketToAttendee = async (email, name, eventTitle, eventDate, eventTime, venue, ticketId, seatNumber, event) => {
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
  await sendEmail(email, subject, html);
};

// ==================== EVENT REPORT NOTICE ====================

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

// ==================== WALLET SETUP CONFIRMATION ====================

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

// ==================== WITHDRAWAL CONFIRMATION ====================

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

// ==================== SETTLEMENT NOTIFICATION ====================

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
        <p style="font-size:14px;color:#666">
          The funds should reflect in your bank account within 1-3 business days depending on your bank.
        </p>
        <a href="${process.env.FRONTEND_URL}/events/dashboard/wallet" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:10px">View Wallet</a>
      </div>
    </div>
  `;
  await sendEmail(email, subject, html);
};