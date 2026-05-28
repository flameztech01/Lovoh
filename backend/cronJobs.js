// cronJobs.js
import cron from 'node-cron';
import axios from 'axios';

const triggerReminders = async () => {
  try {
    // Call your local API (since cron runs on same VPS)
    const response = await axios.post(
      'http://localhost:5000/api/events/send-all-reminders',
      {},
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ [${new Date().toISOString()}] Reminders sent:`, response.data.message);
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Failed to send reminders:`, error.response?.data?.message || error.message);
  }
};

// Run every day at 9:00 AM
cron.schedule('0 9 * * *', () => {
  console.log('🕘 Running morning reminder check...');
  triggerReminders();
});

// Run every day at 5:00 PM (for evening events next day)
cron.schedule('0 17 * * *', () => {
  console.log('🕔 Running evening reminder check...');
  triggerReminders();
});

// Run at 8:00 AM on event days
cron.schedule('0 8 * * *', () => {
  console.log('🌅 Running morning event day check...');
  triggerReminders();
});

console.log('✅ Reminder cron jobs scheduled and running');