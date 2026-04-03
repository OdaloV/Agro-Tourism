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

// Send email notification (main function)
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
  
  // Add your SMS provider integration here
  // Example for Africa's Talking:
  // const africasTalking = require('africastalking')({
  //   apiKey: process.env.AFRICAS_TALKING_API_KEY,
  //   username: process.env.AFRICAS_TALKING_USERNAME,
  // });
  // await africasTalking.SMS.send({ to: phone, message, from: process.env.SMS_SENDER_ID });
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
  const subject = 'Your Farm Has Been Verified! 🎉';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Congratulations ${farmerName}!</h2>
      <p>Your farm <strong>${farmName}</strong> has been verified and is now live on HarvestHost!</p>
      <p>Visitors can now discover and book experiences on your farm.</p>
      <div style="margin: 20px 0;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/farmer/dashboard" 
           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Go to Dashboard
        </a>
      </div>
      <p>Best regards,<br>HarvestHost Team</p>
    </div>
  `;
  
  await sendEmailNotification(farmerEmail, subject, html);
}

// Send verification rejected notification
export async function notifyFarmerRejected(
  farmerEmail: string,
  farmerName: string,
  farmName: string,
  rejectionReason: string
) {
  const subject = 'Farm Verification Update - HarvestHost';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">Verification Status: Rejected</h2>
      <p>Dear ${farmerName},</p>
      <p>Your farm "<strong>${farmName}</strong>" verification has been reviewed.</p>
      
      <div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
        <strong>Reason for rejection:</strong>
        <p style="margin: 10px 0 0 0;">${rejectionReason}</p>
      </div>
      
      <p>Please correct the issues mentioned above and resubmit your application for review.</p>
      
      <div style="margin: 20px 0;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/farmer/verification" 
           style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Resubmit Application
        </a>
      </div>
      
      <p>If you have any questions, please contact our support team.</p>
      
      <p>Best regards,<br>HarvestHost Team</p>
    </div>
  `;
  
  await sendEmailNotification(farmerEmail, subject, html);
  console.log(`Rejection notification sent to ${farmerEmail}`);
}

// Get admin email from settings
async function getAdminEmail() {
  const result = await pool.query(
    "SELECT value FROM platform_settings WHERE key = 'platform_email'"
  );
  return result.rows[0]?.value || 'admin@harvesthost.com';
}

// Optional: Send test email
export async function sendTestEmail(to: string) {
  const subject = 'Test Email from HarvestHost';
  const html = `
    <h2>Test Email</h2>
    <p>This is a test email to verify your email configuration is working correctly.</p>
    <p>Time sent: ${new Date().toLocaleString()}</p>
  `;
  
  await sendEmailNotification(to, subject, html);
}