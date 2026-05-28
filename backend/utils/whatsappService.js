import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

// Format Nigerian phone numbers
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  // If number starts with 0, replace with 234 (Nigeria code)
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }
  // If number is 10 digits (no country code), add 234
  if (cleaned.length === 10) {
    cleaned = '234' + cleaned;
  }
  return cleaned;
};

// Send WhatsApp message
export const sendWhatsAppReminder = async (to, name, event, daysRemaining, reminderType, registration = null) => {
  const phoneNumber = formatPhoneNumber(to);
  if (!phoneNumber) {
    console.log(`Invalid phone number for ${name}`);
    return false;
  }

  // Build message based on reminder type (ONLY EVENT REMINDERS)
  let message = '';

  if (reminderType === '3_days') {
    message = `⏰ *${daysRemaining} DAYS LEFT!*\n\n`;
    message += `Hello ${name},\n\n`;
    message += `*${event.title}* is in ${daysRemaining} days!\n\n`;
    message += `📅 ${new Date(event.date).toLocaleDateString()}\n`;
    message += `⏰ ${event.time || 'TBD'}\n`;
    message += `📍 ${event.isVirtual ? 'Virtual Event' : event.venue || event.location}\n\n`;
    if (registration?.ticketId) {
      message += `🎫 Ticket: ${registration.ticketId}\n`;
    }
    message += `\nGet ready! We can't wait to see you! 🎉`;
  } 
  else if (reminderType === '2_days') {
    message = `🎉 *${event.title} - ${daysRemaining} Days Away!*\n\n`;
    message += `Hello ${name},\n\n`;
    message += `Your event is happening in ${daysRemaining} days!\n\n`;
    message += `📅 ${new Date(event.date).toLocaleDateString()}\n`;
    message += `⏰ ${event.time || 'TBD'}\n`;
    message += `📍 ${event.isVirtual ? 'Virtual Event' : event.venue || event.location}\n\n`;
    if (event.isVirtual && event.meetingLink) {
      message += `🔗 Link: ${event.meetingLink}\n\n`;
    }
    message += `_Powered by Lovoh Create_`;
  }
  else if (reminderType === '1_day') {
    message = `🚀 *TOMORROW! ${event.title}*\n\n`;
    message += `Hello ${name},\n\n`;
    message += `Your event is TOMORROW! 🎊\n\n`;
    message += `📅 ${new Date(event.date).toLocaleDateString()}\n`;
    message += `⏰ ${event.time || 'TBD'}\n`;
    message += `📍 ${event.isVirtual ? 'Virtual Event' : event.venue || event.location}\n\n`;
    if (registration?.ticketId) {
      message += `🎫 Ticket: ${registration.ticketId}\n`;
    }
    message += `\n💡 Arrive 15 minutes early!\n`;
    message += `_Powered by Lovoh Create_`;
  }
  else if (reminderType === 'event_today') {
    message = `🎯 *TODAY! ${event.title}*\n\n`;
    message += `Hello ${name},\n\n`;
    message += `Your event is TODAY! 🎉🎉🎉\n\n`;
    message += `📅 ${new Date(event.date).toLocaleDateString()}\n`;
    message += `⏰ ${event.time || 'TBD'}\n`;
    message += `📍 ${event.isVirtual ? 'Virtual Event' : event.venue || event.location}\n\n`;
    if (event.isVirtual && event.meetingLink) {
      message += `🔗 Join: ${event.meetingLink}\n\n`;
    }
    if (registration?.ticketId) {
      message += `🎫 Ticket: ${registration.ticketId}\n`;
    }
    message += `\nHave a great time! 🎊\n_Powered by Lovoh Create_`;
  }
  else {
    // General reminder for any other days
    message = `📅 *Reminder: ${event.title}*\n\n`;
    message += `Hello ${name},\n\n`;
    message += `This event is in ${daysRemaining} days:\n\n`;
    message += `📅 ${new Date(event.date).toLocaleDateString()}\n`;
    message += `⏰ ${event.time || 'TBD'}\n`;
    message += `📍 ${event.isVirtual ? 'Virtual Event' : event.venue || event.location}\n\n`;
    message += `View details: ${process.env.FRONTEND_URL}/events/${event.slug || event._id}\n\n`;
    message += `_Powered by Lovoh Create_`;
  }

  try {
    await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${phoneNumber}`,
      body: message,
    });
    console.log(`✅ WhatsApp sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error(`❌ WhatsApp failed for ${phoneNumber}:`, error.message);
    return false;
  }
};