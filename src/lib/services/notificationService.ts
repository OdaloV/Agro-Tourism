// src/lib/services/notificationService.ts
import nodemailer from 'nodemailer';
import pool from '@/lib/db';
import { Resend } from 'resend';

// Initialize Resend for email
const resend = new Resend(process.env.RESEND_API_KEY);

// Email transporter (fallback if Resend not available)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Check if user wants to receive email notifications
async function shouldSendEmail(userId: number, notificationType: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT email_notifications, booking_updates, reminders, marketing_emails 
       FROM notification_preferences 
       WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) return true; // Default to true if no preferences set
    
    const prefs = result.rows[0];
    
    switch (notificationType) {
      case 'booking_update':
        return prefs.email_notifications && prefs.booking_updates;
      case 'reminder':
        return prefs.email_notifications && prefs.reminders;
      case 'marketing':
        return prefs.email_notifications && prefs.marketing_emails;
      default:
        return prefs.email_notifications;
    }
  } catch (error) {
    console.error('Error checking email preferences:', error);
    return true;
  }
}

// Check if user wants to receive SMS notifications
async function shouldSendSMS(userId: number): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT sms_notifications FROM notification_preferences WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) return false;
    return result.rows[0].sms_notifications;
  } catch (error) {
    console.error('Error checking SMS preferences:', error);
    return false;
  }
}

// Send email notification using Resend
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HarvestHost <noreply@harvesthost.com>',
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }
    
    console.log(`Email sent to ${to}:`, data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// Send SMS notification (using Africa's Talking)
export async function sendSMS(to: string, message: string) {
  try {
    // Format phone number for Kenya
    let formattedNumber = to;
    if (!to.startsWith('+')) {
      formattedNumber = `+254${to.replace(/^0/, '')}`;
    }
    
    // This would integrate with Africa's Talking
    console.log(`SMS would be sent to ${formattedNumber}: ${message}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return { success: false, error };
  }
}

// Send booking confirmation (respects user preferences)
export async function sendBookingConfirmation(userId: number, email: string, bookingDetails: any) {
  const shouldSend = await shouldSendEmail(userId, 'booking_update');
  if (!shouldSend) {
    console.log(`User ${userId} opted out of booking update emails`);
    return;
  }
  
  const subject = `Booking Confirmed: ${bookingDetails.farmName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Booking Confirmed! 🎉</h2>
      <p>Dear ${bookingDetails.visitorName},</p>
      <p>Your booking at <strong>${bookingDetails.farmName}</strong> has been confirmed.</p>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📅 Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
        <p><strong>🎯 Activity:</strong> ${bookingDetails.activityName}</p>
        <p><strong>👥 Guests:</strong> ${bookingDetails.participants}</p>
        <p><strong>💰 Amount:</strong> KES ${bookingDetails.amount.toLocaleString()}</p>
      </div>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/visitor/dashboard/bookings" 
         style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">
        View My Bookings
      </a>
      
      <p style="margin-top: 20px;">Thank you for choosing HarvestHost!</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
}

// Send reminder notification (respects user preferences)
export async function sendReminderNotification(userId: number, email: string, reminderDetails: any) {
  const shouldSend = await shouldSendEmail(userId, 'reminder');
  if (!shouldSend) {
    console.log(`User ${userId} opted out of reminder emails`);
    return;
  }
  
  const subject = `Reminder: Your farm visit at ${reminderDetails.farmName} is tomorrow!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #065f46, #047857); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Farm Visit Reminder</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p>Dear ${reminderDetails.visitorName},</p>
        <p>This is a reminder that you have a farm experience booked for <strong>tomorrow</strong>!</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>🌾 Farm:</strong> ${reminderDetails.farmName}</p>
          <p><strong>📅 Date:</strong> ${new Date(reminderDetails.date).toLocaleDateString()}</p>
          <p><strong>🎯 Activity:</strong> ${reminderDetails.activityName}</p>
          <p><strong>👥 Guests:</strong> ${reminderDetails.participants}</p>
        </div>
        
        <p>Please arrive 15 minutes early.</p>
      </div>
    </div>
  `;
  
  await sendEmail(email, subject, html);
}

// Send visitor verification email
export async function sendVisitorVerificationEmail(email: string, name: string, code: string) {
  console.log(`=================================`);
  console.log(`🔐 VISITOR VERIFICATION CODE FOR ${email}: ${code}`);
  console.log(`=================================`);
  
  const subject = 'Verify Your Email - HarvestHost';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Welcome to HarvestHost!</h2>
      <p>Dear ${name},</p>
      <p>Please use the verification code below to complete your registration:</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 10px; margin: 20px 0;">
        ${code}
      </div>
      <p>This code will expire in <strong>15 minutes</strong>.</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
}

// Send farmer verification email
export async function sendVerificationEmail(email: string, name: string, code: string) {
  console.log(`=================================`);
  console.log(`🔐 FARMER VERIFICATION CODE FOR ${email}: ${code}`);
  console.log(`=================================`);
  
  const subject = 'Verify Your Email - Complete Your HarvestHost Registration';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Email Verification Required</h2>
      <p>Dear ${name},</p>
      <p>Please verify your email using the code below:</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 10px; margin: 20px 0;">
        ${code}
      </div>
      <p>This code will expire in <strong>15 minutes</strong>.</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
}

// Send farmer approval notification
export async function notifyFarmerApproved(farmerEmail: string, farmerName: string, farmName: string) {
  const subject = 'Your Farm Has Been Verified! 🎉';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Congratulations ${farmerName}!</h2>
      <p>Your farm <strong>${farmName}</strong> has been verified and is now live on HarvestHost!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/farmer/dashboard" 
         style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">
        Go to Dashboard
      </a>
    </div>
  `;
  
  await sendEmail(farmerEmail, subject, html);
}

// Send farmer rejection notification
export async function notifyFarmerRejected(farmerEmail: string, farmerName: string, farmName: string, rejectionReason: string) {
  const subject = 'Farm Verification Update - HarvestHost';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Verification Status: Rejected</h2>
      <p>Dear ${farmerName},</p>
      <p>Your farm "<strong>${farmName}</strong>" verification has been reviewed.</p>
      <div style="background: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
        <strong>Reason for rejection:</strong>
        <p style="margin: 10px 0 0 0;">${rejectionReason}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/farmer/verification" 
         style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">
        Resubmit Application
      </a>
    </div>
  `;
  
  await sendEmail(farmerEmail, subject, html);
}

// Send new farmer registration notification to admin
export async function notifyNewFarmerRegistration(farmerName: string, farmName: string) {
  const adminEmail = await getAdminEmail();
  const subject = 'New Farmer Registration - Pending Verification';
  const html = `
    <h2>New Farmer Registration</h2>
    <p><strong>Farmer:</strong> ${farmerName}</p>
    <p><strong>Farm:</strong> ${farmName}</p>
    <p><strong>Status:</strong> Pending Verification</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard">Review Now</a>
  `;
  
  await sendEmail(adminEmail, subject, html);
}

// Send registration confirmation
export async function sendRegistrationConfirmation(email: string, name: string, farmName: string) {
  const subject = 'Farm Registration Received - HarvestHost';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Registration Received!</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering your farm <strong>${farmName}</strong> with HarvestHost!</p>
      <p>Our team will review your application and get back to you soon.</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
}

// Get admin email from settings
async function getAdminEmail(): Promise<string> {
  try {
    const result = await pool.query(
      "SELECT value FROM platform_settings WHERE key = 'platform_email'"
    );
    return result.rows[0]?.value || 'admin@harvesthost.com';
  } catch (error) {
    return 'admin@harvesthost.com';
  }
}