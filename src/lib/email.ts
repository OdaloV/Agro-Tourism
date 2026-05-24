import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resend = new Resend(process.env.RESEND_API_KEY);
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const smtpFromEmail = process.env.SMTP_FROM_EMAIL || resendFromEmail;

const smtpTransporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

async function sendViaSMTP(to: string, subject: string, html: string) {
  if (!smtpTransporter) {
    return {
      success: false,
      error: new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.'),
    };
  }

  const info = await smtpTransporter.sendMail({
    from: smtpFromEmail,
    to,
    subject,
    html,
  });

  console.log(`Email sent via SMTP to ${to}:`, info.messageId);
  return { success: true, data: info };
}

export async function sendEmail(to: string, subject: string, html: string) {
  const from = process.env.RESEND_FROM_EMAIL ? resendFromEmail : 'onboarding@resend.dev';

  if (process.env.RESEND_API_KEY) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Resend email error:', error);
        if (smtpTransporter) {
          console.log('Falling back to SMTP after Resend validation failure');
          return sendViaSMTP(to, subject, html);
        }
        return { success: false, error };
      }

      console.log(`Email sent to ${to}:`, data?.id);
      return { success: true, data };
    } catch (error: any) {
      console.error('Failed to send email via Resend:', error);
      if (smtpTransporter) {
        console.log('Falling back to SMTP after Resend failure');
        return sendViaSMTP(to, subject, html);
      }
      return { success: false, error };
    }
  }

  return sendViaSMTP(to, subject, html);
}

// Send booking reminder email with calendar link
export async function sendBookingReminderEmail({
  to,
  farmerEmail,
  bookingReference,
  farmName,
  activityName,
  bookingDate,
  reminderTime,
  calendarLink,
}: {
  to: string;
  farmerEmail: string;
  bookingReference: string;
  farmName: string;
  activityName: string;
  bookingDate: string;
  reminderTime: string;
  calendarLink?: string;
}) {
  const formattedDate = new Date(bookingDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const calendarHtml = calendarLink ? `
    <div style="margin: 20px 0; text-align: center;">
      <a href="${calendarLink}" 
         style="background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        📅 Add to Google Calendar
      </a>
    </div>
  ` : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🌾 Booking Reminder</h1>
      </div>
      
      <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #374151; font-size: 16px;">Hello,</p>
        
        <p style="color: #374151; font-size: 16px;">
          This is a reminder that your booking at <strong>${farmName}</strong> is coming up in <strong>${reminderTime}</strong>!
        </p>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #065f46; margin: 0 0 10px 0;">📋 Booking Details</h3>
          <p style="margin: 5px 0;"><strong>Reference:</strong> ${bookingReference}</p>
          <p style="margin: 5px 0;"><strong>Activity:</strong> ${activityName}</p>
          <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
        </div>
        
        ${calendarHtml}
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin: 0 0 10px 0;">📍 What to Bring</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Comfortable clothing and shoes</li>
            <li>Sunscreen and hat for outdoor activities</li>
            <li>Water bottle</li>
            <li>Camera to capture memories</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/visitor/dashboard/bookings" 
             style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            View My Bookings
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          Need to make changes? Contact the farmer directly at <a href="mailto:${farmerEmail}" style="color: #059669;">${farmerEmail}</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, `🌾 Booking Reminder: ${activityName} at ${farmName} - ${reminderTime} away`, html);
}
