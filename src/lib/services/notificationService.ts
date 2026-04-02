// src/lib/services/notificationService.ts
import nodemailer from 'nodemailer';
import pool from '@/lib/db';

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send email notification
export async function sendEmailNotification(to: string, subject: string, html: string) {
  const settings = await getNotificationSettings();
  if (!settings.emailEnabled) return;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}

// Send SMS notification (using Africa's Talking or Twilio)
export async function sendSMSNotification(phone: string, message: string) {
  const settings = await getNotificationSettings();
  if (!settings.smsEnabled) return;
  
  // Example with Africa's Talking
  // const response = await fetch('https://api.africastalking.com/version1/messaging', {
  //   method: 'POST',
  //   headers: {
  //     'apiKey': process.env.AT_API_KEY,
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   body: new URLSearchParams({
  //     username: process.env.AT_USERNAME,
  //     to: phone,
  //     message: message,
  //     from: process.env.AT_SENDER_ID,
  //   }),
  // });
}

// Get notification settings
async function getNotificationSettings() {
  const result = await pool.query(
    "SELECT key, value FROM platform_settings WHERE key IN ('notification_email', 'notification_sms')"
  );
  
  const settings: Record<string, string> = {};
  result.rows.forEach(row => {
    settings[row.key] = row.value;
  });
  
  return {
    emailEnabled: settings.notification_email === 'true',
    smsEnabled: settings.notification_sms === 'true',
  };
}

// Send new registration notification to admin
export async function notifyNewFarmerRegistration(farmerName: string, farmName: string) {
  const adminEmail = await getAdminEmail();
  const subject = 'New Farmer Registration - Pending Verification';
  const html = `
    <h2>New Farmer Registration</h2>
    <p><strong>Farmer:</strong> ${farmerName}</p>
    <p><strong>Farm:</strong> ${farmName}</p>
    <p><strong>Status:</strong> Pending Verification</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard">Review Now</a>
  `;
  
  await sendEmailNotification(adminEmail, subject, html);
}

// Send verification approved notification
export async function notifyFarmerApproved(farmerEmail: string, farmerName: string, farmName: string) {
  const subject = 'Your Farm Has Been Verified!';
  const html = `
    <h2>Congratulations ${farmerName}!</h2>
    <p>Your farm <strong>${farmName}</strong> has been verified and is now live!</p>
    <p>Visitors can now discover and book experiences on your farm.</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/farmer/dashboard">Go to Dashboard</a>
  `;
  
  await sendEmailNotification(farmerEmail, subject, html);
}

async function getAdminEmail() {
  const result = await pool.query(
    "SELECT value FROM platform_settings WHERE key = 'platform_email'"
  );
  return result.rows[0]?.value || 'admin@harvesthost.com';
}