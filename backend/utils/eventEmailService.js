// utils/eventEmailService.js
import { Resend } from 'resend';
import axios from 'axios';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'Lovoh Create <events@lovohcreate.com>';

// ===== Helpers =====
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

const createQRAttachment = (qrCodeDataUrl, filename = 'ticket_qr.png') => {
  if (!qrCodeDataUrl) return null;
  const base64Data = qrCodeDataUrl.split(',')[1];
  if (!base64Data) return null;
  return {
    filename,
    content: Buffer.from(base64Data, 'base64'),
  };
};

const formatEventDate = (date) => {
  if (!date) return 'TBD';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatEventTime = (time) => {
  if (!time) return 'TBD';
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m || 0, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const getPosterUrl = (registrationId) =>
  `${process.env.EVENT_FRONTEND_URL}/poster/${registrationId}`;

// ===== Ticket HTML (beautiful ticket design) =====
const generateTicketHTML = (registration, event) => {
  const ticketId = registration.ticketId || 'Pending';
  const seatNumber = registration.seatNumber || '';
  const ticketType = registration.ticketType || 'General';
  const quantity = registration.quantity || 1;
  const totalAmount = registration.totalAmount || 0;

  return `
    <div style="max-width:520px;margin:20px auto;background:#fff;border:2px dashed #1B3766;border-radius:16px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#1B3766,#2d4a8a);padding:16px 20px;text-align:center;color:#fff;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;opacity:0.8;">Event Ticket</div>
        <div style="font-size:18px;font-weight:700;margin:4px 0 0;">${event?.title || 'Event'}</div>
      </div>
      <div style="padding:20px 24px;">
        <div style="display:flex;flex-wrap:wrap;gap:16px;">
          <div style="flex:2;min-width:200px;">
            <div style="margin-bottom:10px;">
              <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Date & Time</div>
              <div style="font-weight:600;color:#1B3766;">${formatEventDate(event?.date)}</div>
              <div style="font-size:14px;color:#333;">${formatEventTime(event?.time)}</div>
            </div>
            <div style="margin-bottom:10px;">
              <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Venue</div>
              <div style="font-weight:600;color:#1B3766;">${event?.venue || event?.location || 'TBD'}</div>
            </div>
            <div style="margin-bottom:10px;">
              <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Attendee</div>
              <div style="font-weight:600;color:#1B3766;">${registration.name}</div>
            </div>
            ${seatNumber ? `
              <div style="margin-bottom:10px;">
                <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Seat</div>
                <div style="font-weight:600;color:#1B3766;">#${seatNumber}</div>
              </div>
            ` : ''}
            ${ticketType !== 'General' ? `
              <div style="margin-bottom:10px;">
                <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Ticket Type</div>
                <div style="font-weight:600;color:#1B3766;">${ticketType}</div>
              </div>
            ` : ''}
            ${quantity > 1 ? `
              <div style="margin-bottom:10px;">
                <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Quantity</div>
                <div style="font-weight:600;color:#1B3766;">${quantity}</div>
              </div>
            ` : ''}
            ${totalAmount > 0 ? `
              <div style="margin-top:6px;padding:6px 12px;background:#ecfdf5;border-radius:6px;display:inline-block;">
                <span style="font-size:13px;font-weight:700;color:#059669;">₦${totalAmount.toLocaleString()}</span>
                <span style="font-size:11px;color:#059669;margin-left:4px;">PAID</span>
              </div>
            ` : ''}
          </div>
          <div style="flex:1;min-width:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f8fafc;border-radius:12px;padding:12px;">
            <div style="font-size:40px;line-height:1;">📱</div>
            <div style="font-size:11px;color:#666;margin-top:6px;text-align:center;">QR Code attached<br>as PNG image</div>
          </div>
        </div>
        <div style="margin-top:18px;padding:12px;background:#f1f5f9;border-radius:10px;text-align:center;border:1px dashed #cbd5e1;">
          <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;">Ticket ID</div>
          <div style="font-size:22px;font-weight:700;color:#1B3766;letter-spacing:3px;font-family:monospace;">${ticketId}</div>
        </div>
        <div style="font-size:11px;color:#999;text-align:center;margin-top:12px;">This ticket is unique. Do not share.</div>
      </div>
      <div style="background:#f1f5f9;padding:10px;text-align:center;font-size:10px;color:#999;border-top:1px dashed #d1d5db;">
        © ${new Date().getFullYear()} Lovoh Create · eventroom.lovohcreate.com
      </div>
    </div>
  `;
};

// ===== EMAIL: Registration Confirmation =====
export const sendRegistrationConfirmation = async (
  email,
  name,
  eventTitle,
  eventDate,
  eventTime,
  venue,
  registration,
  event,
  qrCodeDataUrl = null
) => {
  const subject = `✅ You're registered for "${eventTitle}"!`;
  const posterLink = getPosterUrl(registration._id);
  const formattedDate = formatEventDate(eventDate);
  const formattedTime = formatEventTime(eventTime);
  const location = event?.isVirtual
    ? '🌐 Online Event'
    : venue || event?.venue || event?.location || 'TBD';
  const meetingLink = event?.meetingLink;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:16px 20px;background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
          <div style="background:linear-gradient(135deg,#1B3766,#2d4a8a);padding:24px;text-align:center;border-radius:16px 16px 0 0;color:#fff;">
            <h1 style="margin:0;font-size:24px;font-weight:700;">🎉 Registration Confirmed!</h1>
            <p style="margin:4px 0 0;opacity:0.9;">You're all set for <strong>${eventTitle}</strong></p>
          </div>
          <div style="padding:24px;">
            <p style="font-size:18px;font-weight:600;color:#1B3766;margin:0 0 6px;">Hi ${name},</p>
            <p style="font-size:16px;color:#333;margin:0 0 16px;line-height:1.6;">
              Your registration for <strong>${eventTitle}</strong> is confirmed. Please review the details below and save your ticket.
            </p>

            <hr style="border:0;height:1px;background:#e5e7eb;margin:20px 0;">

            <div style="font-size:16px;font-weight:700;color:#1B3766;margin:0 0 12px;">📋 Event Summary</div>
            <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:0 0 16px;">
              <p style="margin:4px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
              <p style="margin:4px 0;"><strong>⏰ Time:</strong> ${formattedTime}</p>
              <p style="margin:4px 0;"><strong>📍 Location:</strong> ${location}</p>
              ${meetingLink ? `<p style="margin:4px 0;"><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}" style="color:#1B3766;">${meetingLink}</a></p>` : ''}
            </div>

            ${generateTicketHTML(registration, {
              title: eventTitle,
              date: eventDate,
              time: eventTime,
              venue: venue || event?.venue || event?.location,
            })}

            ${registration.additionalAttendees?.length > 0 ? `
              <hr style="border:0;height:1px;background:#e5e7eb;margin:20px 0;">
              <div style="font-size:16px;font-weight:700;color:#1B3766;margin:0 0 12px;">👥 Additional Attendees</div>
              <div style="background:#f8fafc;border-radius:12px;padding:16px;">
                ${registration.additionalAttendees.map(att => `
                  <div style="padding:6px 0;border-bottom:1px solid #e5e7eb;font-size:14px;">
                    <strong>${att.name}</strong> ${att.email ? `(📧 ${att.email})` : ''} ${att.seatNumber ? `💺 #${att.seatNumber}` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <hr style="border:0;height:1px;background:#e5e7eb;margin:20px 0;">

            <!-- Poster promotion -->
            <div style="background:#f0f7ff;border-radius:12px;padding:16px;text-align:center;border:1px solid #d0e0ff;">
              <h3 style="margin:0 0 8px;color:#1B3766;font-size:18px;">🎨 Create Your "I'm Attending" Poster</h3>
              <p style="margin:0 0 12px;color:#333;font-size:15px;">Personalise your poster with your photo and name, then share it on social media!</p>
              <a href="${posterLink}" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">🌟 Create Poster Now</a>
              <p style="font-size:13px;color:#666;margin-top:10px;">Link also available in your dashboard.</p>
            </div>

            <hr style="border:0;height:1px;background:#e5e7eb;margin:20px 0;">

            <div style="text-align:center;font-size:14px;color:#333;">
              Your ticket QR code is attached to this email as a PNG image.
            </div>
          </div>
          <div style="background:#f1f5f9;padding:16px;text-align:center;border-radius:0 0 16px 16px;font-size:13px;color:#666;">
            <p style="margin:0;">Need help? <a href="mailto:eventroom@lovohcreate.com" style="color:#1B3766;">eventroom@lovohcreate.com</a></p>
            <p style="margin:4px 0 0;">© ${new Date().getFullYear()} Lovoh Create</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const attachments = [];
  if (qrCodeDataUrl) {
    const qrAtt = createQRAttachment(qrCodeDataUrl);
    if (qrAtt) attachments.push(qrAtt);
  }
  await sendEmail(email, subject, html, attachments);
};

// ===== EMAIL: Payment Confirmation =====
export const sendPaymentConfirmation = async (
  email,
  name,
  eventTitle,
  amount,
  registration,
  event,
  qrCodeDataUrl = null
) => {
  const subject = `✅ Payment Confirmed – ${eventTitle}`;
  const posterLink = getPosterUrl(registration._id);
  const formattedDate = formatEventDate(event.date);
  const formattedTime = formatEventTime(event.time);
  const location = event?.isVirtual
    ? '🌐 Online Event'
    : event?.venue || event?.location || 'TBD';
  const meetingLink = event?.meetingLink;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:16px 20px;background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
          <div style="background:linear-gradient(135deg,#059669,#10b981);padding:24px;text-align:center;border-radius:16px 16px 0 0;color:#fff;">
            <h1 style="margin:0;font-size:24px;font-weight:700;">✅ Payment Confirmed!</h1>
            <p style="margin:4px 0 0;opacity:0.9;">Thank you for your payment</p>
          </div>
          <div style="padding:24px;">
            <p style="font-size:18px;font-weight:600;color:#1B3766;margin:0 0 6px;">Hi ${name},</p>
            <p style="font-size:16px;color:#333;margin:0 0 16px;line-height:1.6;">
              Your payment of <strong>₦${amount.toLocaleString()}</strong> for <strong>${eventTitle}</strong> has been received. You're now officially registered.
            </p>

            <div style="background:#ecfdf5;border-radius:12px;padding:16px;text-align:center;border:1px solid #d1fae5;">
              <div style="font-size:14px;color:#333;">Amount Paid</div>
              <div style="font-size:28px;font-weight:700;color:#059669;">₦${amount.toLocaleString()}</div>
            </div>

            <hr style="border:0;height:1px;background:#e5e7eb;margin:20px 0;">

            <div style="font-size:16px;font-weight:700;color:#1B3766;margin:0 0 12px;">📋 Event Details</div>
            <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:0 0 16px;">
              <p style="margin:4px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
              <p style="margin:4px 0;"><strong>⏰ Time:</strong> ${formattedTime}</p>
              <p style="margin:4px 0;"><strong>📍 Location:</strong> ${location}</p>
              ${meetingLink ? `<p style="margin:4px 0;"><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}" style="color:#1B3766;">${meetingLink}</a></p>` : ''}
            </div>

            ${generateTicketHTML(registration, event)}

            ${registration.additionalAttendees?.length > 0 ? `
              <hr style="border:0;height:1px;background:#e5e7eb;margin:20px 0;">
              <div style="font-size:16px;font-weight:700;color:#1B3766;margin:0 0 12px;">👥 Additional Attendees</div>
              <div style="background:#f8fafc;border-radius:12px;padding:16px;">
                ${registration.additionalAttendees.map(att => `
                  <div style="padding:6px 0;border-bottom:1px solid #e5e7eb;font-size:14px;">
                    <strong>${att.name}</strong> ${att.email ? `(📧 ${att.email})` : ''} ${att.seatNumber ? `💺 #${att.seatNumber}` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <hr style="border:0;height:1px;background:#e5e7eb;margin:20px 0;">

            <!-- Poster promotion -->
            <div style="background:#f0f7ff;border-radius:12px;padding:16px;text-align:center;border:1px solid #d0e0ff;">
              <h3 style="margin:0 0 8px;color:#1B3766;font-size:18px;">🎨 Create Your "I'm Attending" Poster</h3>
              <p style="margin:0 0 12px;color:#333;font-size:15px;">Personalise your poster with your photo and name, then share it on social media!</p>
              <a href="${posterLink}" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">🌟 Create Poster Now</a>
              <p style="font-size:13px;color:#666;margin-top:10px;">Link also available in your dashboard.</p>
            </div>

            <hr style="border:0;height:1px;background:#e5e7eb;margin:20px 0;">

            <div style="text-align:center;font-size:14px;color:#333;">
              Your ticket QR code is attached to this email as a PNG image.
            </div>
          </div>
          <div style="background:#f1f5f9;padding:16px;text-align:center;border-radius:0 0 16px 16px;font-size:13px;color:#666;">
            <p style="margin:0;">Need help? <a href="mailto:eventroom@lovohcreate.com" style="color:#1B3766;">eventroom@lovohcreate.com</a></p>
            <p style="margin:4px 0 0;">© ${new Date().getFullYear()} Lovoh Create</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const attachments = [];
  if (qrCodeDataUrl) {
    const qrAtt = createQRAttachment(qrCodeDataUrl);
    if (qrAtt) attachments.push(qrAtt);
  }
  await sendEmail(email, subject, html, attachments);
};

// ===== EMAIL: Individual Ticket to Attendee =====
export const sendTicketToAttendee = async (
  email,
  name,
  eventTitle,
  eventDate,
  eventTime,
  venue,
  ticketId,
  seatNumber,
  event,
  qrCodeDataUrl = null
) => {
  const subject = `🎟️ Your ticket for ${eventTitle}`;
  const formattedDate = formatEventDate(eventDate);
  const formattedTime = formatEventTime(eventTime);
  const location = event?.isVirtual
    ? '🌐 Online Event'
    : venue || event?.venue || event?.location || 'TBD';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:16px 20px;background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
          <div style="background:linear-gradient(135deg,#1B3766,#2d4a8a);padding:24px;text-align:center;border-radius:16px 16px 0 0;color:#fff;">
            <h1 style="margin:0;font-size:24px;font-weight:700;">🎟️ Your Ticket</h1>
            <p style="margin:4px 0 0;opacity:0.9;">${eventTitle}</p>
          </div>
          <div style="padding:24px;">
            <p style="font-size:18px;font-weight:600;color:#1B3766;margin:0 0 6px;">Hi ${name},</p>
            <p style="font-size:16px;color:#333;margin:0 0 16px;line-height:1.6;">
              You have a ticket for <strong>${eventTitle}</strong>. Please find your ticket details below.
            </p>

            <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:0 0 16px;">
              <p style="margin:4px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
              <p style="margin:4px 0;"><strong>⏰ Time:</strong> ${formattedTime}</p>
              <p style="margin:4px 0;"><strong>📍 Location:</strong> ${location}</p>
            </div>

            <div style="max-width:520px;margin:0 auto;background:#fff;border:2px dashed #1B3766;border-radius:16px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
              <div style="background:linear-gradient(135deg,#1B3766,#2d4a8a);padding:16px 20px;text-align:center;color:#fff;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;opacity:0.8;">Event Ticket</div>
                <div style="font-size:18px;font-weight:700;margin:4px 0 0;">${eventTitle}</div>
              </div>
              <div style="padding:20px 24px;">
                <div style="display:flex;flex-wrap:wrap;gap:16px;">
                  <div style="flex:2;min-width:200px;">
                    <div style="margin-bottom:10px;">
                      <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Attendee</div>
                      <div style="font-weight:600;color:#1B3766;">${name}</div>
                    </div>
                    ${seatNumber ? `
                      <div style="margin-bottom:10px;">
                        <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Seat</div>
                        <div style="font-weight:600;color:#1B3766;">#${seatNumber}</div>
                      </div>
                    ` : ''}
                  </div>
                  <div style="flex:1;min-width:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f8fafc;border-radius:12px;padding:12px;">
                    <div style="font-size:40px;line-height:1;">📱</div>
                    <div style="font-size:11px;color:#666;margin-top:6px;text-align:center;">QR Code attached<br>as PNG image</div>
                  </div>
                </div>
                <div style="margin-top:18px;padding:12px;background:#f1f5f9;border-radius:10px;text-align:center;border:1px dashed #cbd5e1;">
                  <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;">Ticket ID</div>
                  <div style="font-size:22px;font-weight:700;color:#1B3766;letter-spacing:3px;font-family:monospace;">${ticketId || 'Pending'}</div>
                </div>
                <div style="font-size:11px;color:#999;text-align:center;margin-top:12px;">This ticket is unique. Do not share.</div>
              </div>
              <div style="background:#f1f5f9;padding:10px;text-align:center;font-size:10px;color:#999;border-top:1px dashed #d1d5db;">
                © ${new Date().getFullYear()} Lovoh Create · eventroom.lovohcreate.com
              </div>
            </div>
          </div>
          <div style="background:#f1f5f9;padding:16px;text-align:center;border-radius:0 0 16px 16px;font-size:13px;color:#666;">
            <p style="margin:0;">Need help? <a href="mailto:eventroom@lovohcreate.com" style="color:#1B3766;">eventroom@lovohcreate.com</a></p>
            <p style="margin:4px 0 0;">© ${new Date().getFullYear()} Lovoh Create</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const attachments = [];
  if (qrCodeDataUrl) {
    const qrAtt = createQRAttachment(qrCodeDataUrl);
    if (qrAtt) attachments.push(qrAtt);
  }
  await sendEmail(email, subject, html, attachments);
};

// ===== EMAIL: Creator notification (new registration) =====
export const sendNewRegistrationToCreator = async (
  creatorEmail,
  eventTitle,
  attendeeName,
  attendeeEmail,
  type,
  ticketId,
  seatNumber,
  quantity = 1
) => {
  const subject = `📋 New ${type === 'paid' ? 'Paid ' : ''}Registration for ${eventTitle}`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#1B3766,#2d4a8a);padding:24px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:24px;">📋 New Registration</h1>
        <p style="margin:4px 0 0;opacity:0.9;">${eventTitle}</p>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;color:#333;"><strong>${attendeeName}</strong> just registered!</p>
        <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:12px 0;">
          <p style="margin:4px 0;"><strong>Name:</strong> ${attendeeName}</p>
          <p style="margin:4px 0;"><strong>Email:</strong> ${attendeeEmail}</p>
          <p style="margin:4px 0;"><strong>Type:</strong> ${type === 'paid' ? '💰 Paid' : '🆓 Free'}</p>
          <p style="margin:4px 0;"><strong>Quantity:</strong> ${quantity} ticket(s)</p>
          ${ticketId ? `<p style="margin:4px 0;"><strong>🎫 Ticket ID:</strong> ${ticketId}</p>` : ''}
          ${seatNumber ? `<p style="margin:4px 0;"><strong>💺 Seat:</strong> #${seatNumber}</p>` : ''}
        </div>
        <a href="${process.env.EVENT_FRONTEND_URL}/events/dashboard/events" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View Dashboard</a>
      </div>
      <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#666;">
        © ${new Date().getFullYear()} Lovoh Create
      </div>
    </div>
  `;
  await sendEmail(creatorEmail, subject, html);
};

// ===== EMAIL: Payment to Creator =====
export const sendPaymentToCreator = async (
  creatorEmail,
  eventTitle,
  attendeeName,
  amount,
  creatorPercentage
) => {
  const creatorShare = (amount * creatorPercentage) / 100;
  const subject = `💰 Payment Received for ${eventTitle}`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#059669,#10b981);padding:24px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:24px;">💰 Payment Received</h1>
        <p style="margin:4px 0 0;opacity:0.9;">${eventTitle}</p>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;color:#333;">A payment has been received for <strong>${eventTitle}</strong>.</p>
        <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:12px 0;">
          <p style="margin:4px 0;"><strong>Attendee:</strong> ${attendeeName}</p>
          <p style="margin:4px 0;"><strong>Total Amount:</strong> ₦${amount.toLocaleString()}</p>
          ${creatorPercentage > 0 ? `<p style="margin:4px 0;"><strong>Your Share (${creatorPercentage}%):</strong> ₦${creatorShare.toLocaleString()}</p>` : ''}
        </div>
        <p style="font-size:14px;color:#666;">${creatorPercentage > 0 ? 'Your share has been credited to your subaccount.' : 'This is a company event.'}</p>
        <a href="${process.env.EVENT_FRONTEND_URL}/events/dashboard/wallet" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View Wallet</a>
      </div>
      <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#666;">
        © ${new Date().getFullYear()} Lovoh Create
      </div>
    </div>
  `;
  await sendEmail(creatorEmail, subject, html);
};

// ===== EMAIL: Event report notice =====
export const sendEventReportNotice = async (
  creatorEmail,
  eventTitle,
  reportCount,
  action = 'reported'
) => {
  const subject =
    action === 'disabled'
      ? `⚠️ Your event "${eventTitle}" has been disabled`
      : `⚠️ Your event "${eventTitle}" has been reported`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      <div style="background:${action === 'disabled' ? '#dc2626' : '#f59e0b'};padding:24px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:24px;">${action === 'disabled' ? 'Event Disabled' : 'Event Reported'}</h1>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;color:#333;">${
          action === 'disabled'
            ? `Your event "${eventTitle}" has been disabled due to multiple reports.`
            : `Your event "${eventTitle}" has been reported. Current reports: ${reportCount}.`
        }</p>
        <p style="font-size:14px;color:#666;">If you believe this is a mistake, please contact support.</p>
      </div>
      <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#666;">
        © ${new Date().getFullYear()} Lovoh Create
      </div>
    </div>
  `;
  await sendEmail(creatorEmail, subject, html);
};

// ===== EMAIL: Wallet setup confirmation =====
export const sendWalletSetupConfirmation = async (email, name) => {
  const subject = '✅ Your Payment Wallet is Ready!';
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#1B3766,#2d4a8a);padding:24px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:24px;">✅ Wallet Ready</h1>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;color:#333;">Hi ${name},</p>
        <p style="font-size:16px;color:#333;">Your payment wallet has been set up successfully. You can now create paid events and receive payments directly.</p>
        <p style="font-size:14px;color:#666;">Earnings from your events will be automatically split and your share (94%) will be settled to your bank by Paystack.</p>
        <a href="${process.env.EVENT_FRONTEND_URL}/events/dashboard/wallet" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View Wallet</a>
      </div>
      <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#666;">
        © ${new Date().getFullYear()} Lovoh Create
      </div>
    </div>
  `;
  await sendEmail(email, subject, html);
};

// ===== EMAIL: Withdrawal confirmation =====
export const sendWithdrawalConfirmation = async (email, name, amount) => {
  const subject = `💸 Withdrawal of ₦${amount.toLocaleString()} Initiated`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#1B3766,#2d4a8a);padding:24px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:24px;">💸 Withdrawal Initiated</h1>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;color:#333;">Hi ${name},</p>
        <p style="font-size:16px;color:#333;">Your withdrawal of <strong>₦${amount.toLocaleString()}</strong> has been initiated and will be sent to your registered bank account.</p>
        <p style="font-size:14px;color:#666;">The transfer typically takes 1-3 business days.</p>
      </div>
      <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#666;">
        © ${new Date().getFullYear()} Lovoh Create
      </div>
    </div>
  `;
  await sendEmail(email, subject, html);
};

// ===== EMAIL: Settlement notification =====
export const sendSettlementNotification = async (email, name, totalAmount, transactionCount) => {
  const subject = `💰 ₦${totalAmount.toLocaleString()} Settled to Your Bank Account`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#059669,#10b981);padding:24px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:24px;">💰 Funds Settled</h1>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;color:#333;">Hi ${name},</p>
        <p style="font-size:16px;color:#333;line-height:1.6;">
          Great news! <strong>₦${totalAmount.toLocaleString()}</strong> from <strong>${transactionCount} event registration${transactionCount > 1 ? 's' : ''}</strong> has been settled to your bank account.
        </p>
        <div style="background:#f8fafc;border-radius:12px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#059669;">₦${totalAmount.toLocaleString()}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#666;">${transactionCount} transaction${transactionCount > 1 ? 's' : ''} settled</p>
        </div>
        <p style="font-size:14px;color:#666;">The funds should reflect within 1-3 business days.</p>
        <a href="${process.env.EVENT_FRONTEND_URL}/events/dashboard/wallet" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View Wallet</a>
      </div>
      <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#666;">
        © ${new Date().getFullYear()} Lovoh Create
      </div>
    </div>
  `;
  await sendEmail(email, subject, html);
};

// ===== EMAIL: Event reminder =====
export const sendEventReminder = async (
  email,
  name,
  event,
  daysRemaining,
  reminderType,
  registration = null
) => {
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

  const formattedDate = formatEventDate(event.date);
  const formattedTime = formatEventTime(event.time);
  const location = event?.isVirtual ? '🌐 Online Event' : event?.venue || event?.location || 'TBD';
  const meetingLink = event?.meetingLink;

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#1B3766,#2d4a8a);padding:24px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:24px;">⏰ Reminder</h1>
        <p style="margin:4px 0 0;opacity:0.9;">${reminderText}</p>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;color:#333;">Hi ${name},</p>
        <p style="font-size:16px;color:#333;">This is a reminder for <strong>${event.title}</strong>.</p>
        <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:12px 0;">
          <p style="margin:4px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
          <p style="margin:4px 0;"><strong>⏰ Time:</strong> ${formattedTime}</p>
          <p style="margin:4px 0;"><strong>📍 Location:</strong> ${location}</p>
          ${meetingLink ? `<p style="margin:4px 0;"><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}" style="color:#1B3766;">${meetingLink}</a></p>` : ''}
        </div>
        ${registration ? `
          <div style="background:#1B3766;border-radius:8px;padding:12px;text-align:center;color:#fff;margin:12px 0;">
            <p style="margin:0;font-size:12px;color:#79FFFF;">YOUR TICKET ID</p>
            <p style="margin:4px 0;font-size:20px;font-weight:bold;letter-spacing:2px;">${registration.ticketId || 'N/A'}</p>
            ${registration.seatNumber ? `<p style="margin:0;font-size:14px;color:#79FFFF;">Seat: #${registration.seatNumber}</p>` : ''}
          </div>
        ` : ''}
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;margin:12px 0;border-radius:8px;">
          <p style="margin:0;font-size:14px;color:#92400e;">
            <strong>💡 Quick Tips:</strong><br>
            • Arrive at least 15 minutes early<br>
            • Have your ticket ready (digital or printed)<br>
            • Bring a valid ID for verification
          </p>
        </div>
        <a href="${process.env.EVENT_FRONTEND_URL}/events/${event.slug || event._id}" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View Event Details</a>
      </div>
      <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#666;">
        <p style="margin:0;">Need help? <a href="mailto:eventroom@lovohcreate.com" style="color:#1B3766;">eventroom@lovohcreate.com</a></p>
        <p style="margin:4px 0 0;">© ${new Date().getFullYear()} Lovoh Create</p>
      </div>
    </div>
  `;
  await sendEmail(email, subject, html);
};

// ===== EMAIL: Poster generation confirmation =====
export const sendPosterEmail = async (email, name, eventTitle, posterUrl, registration = null) => {
  const subject = `🎨 Your "I'm Attending" Poster for ${eventTitle}`;

  let attachment = null;
  try {
    const response = await axios.get(posterUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    attachment = {
      filename: `poster_${eventTitle.replace(/\s+/g, '_')}.png`,
      content: buffer,
    };
  } catch (err) {
    console.warn('Could not download poster for attachment:', err);
  }

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#1B3766,#2d4a8a);padding:24px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:24px;">🎨 Your Poster is Ready!</h1>
        <p style="margin:4px 0 0;opacity:0.9;">${eventTitle}</p>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;color:#333;">Hi ${name},</p>
        <p style="font-size:16px;color:#333;line-height:1.6;">
          Your personalised <strong>"I'm Attending"</strong> poster for <strong>${eventTitle}</strong> has been generated!
        </p>
        <div style="background:#f8fafc;border-radius:12px;padding:16px;text-align:center;">
          <a href="${posterUrl}" target="_blank" style="display:inline-block;background:#1B3766;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
            📥 Download Poster
          </a>
          <p style="margin:8px 0 0;font-size:13px;color:#666;">The poster is also attached to this email.</p>
        </div>
        ${registration ? `
          <div style="background:#f8fafc;border-radius:12px;padding:12px;margin:12px 0;">
            <p style="font-size:14px;font-weight:bold;color:#1B3766;margin:0 0 4px;">📋 Registration Details</p>
            <p style="margin:3px 0;font-size:13px;"><strong>Ticket ID:</strong> ${registration.ticketId || 'N/A'}</p>
            ${registration.seatNumber ? `<p style="margin:3px 0;font-size:13px;"><strong>Seat:</strong> #${registration.seatNumber}</p>` : ''}
          </div>
        ` : ''}
        <p style="font-size:14px;color:#666;">Share your poster on social media and let everyone know you'll be there! 🎉</p>
      </div>
      <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#666;">
        <p style="margin:0;">Need help? <a href="mailto:eventroom@lovohcreate.com" style="color:#1B3766;">eventroom@lovohcreate.com</a></p>
        <p style="margin:4px 0 0;">© ${new Date().getFullYear()} Lovoh Create</p>
      </div>
    </div>
  `;

  const attachments = attachment ? [attachment] : [];
  await sendEmail(email, subject, html, attachments);
};