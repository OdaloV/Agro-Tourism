// src/app/api/cron/send-reminders/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Helper function to send email (you'll need to implement this)
async function sendEmail(to: string, subject: string, html: string) {
  // Use your email service (Resend, SendGrid, Nodemailer, etc.)
  // Example with Resend:
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: 'noreply@harvesthost.com', to, subject, html });
  
  console.log(`Sending email to ${to}: ${subject}`);
  // For now, just log it
}

// Helper function to send SMS
async function sendSMS(to: string, message: string) {
  // Use your SMS service (Twilio, Africa's Talking, etc.)
  console.log(`Sending SMS to ${to}: ${message}`);
}

export async function GET(request: Request) {
  // Verify cron job secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Unauthorized cron job attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('Running reminder cron job...');
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`Checking for bookings on: ${tomorrowStr}`);
    
    // Find bookings that are tomorrow and haven't had a reminder sent
    const bookings = await pool.query(`
      SELECT 
        b.id,
        b.booking_date,
        b.activity_name,
        b.participants,
        b.total_amount,
        u.id as visitor_id,
        u.name as visitor_name,
        u.email as visitor_email,
        u.phone as visitor_phone,
        fp.farm_name,
        fp.farm_location,
        fp.city,
        fp.county
      FROM bookings b
      JOIN users u ON b.visitor_id = u.id
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      WHERE b.booking_date = $1 
        AND b.status = 'confirmed'
        AND (b.reminder_sent IS NULL OR b.reminder_sent < NOW() - INTERVAL '1 day')
    `, [tomorrowStr]);
    
    console.log(`Found ${bookings.rows.length} bookings needing reminders`);
    
    let remindersSent = 0;
    let errors = 0;
    
    for (const booking of bookings.rows) {
      try {
        // Send email reminder
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #065f46, #047857); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0;">Farm Visit Reminder</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #374151;">Dear ${booking.visitor_name},</p>
              <p style="font-size: 16px; color: #374151;">This is a reminder that you have a farm experience booked for <strong>tomorrow</strong>!</p>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>🌾 Farm:</strong> ${booking.farm_name}</p>
                <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>🎯 Activity:</strong> ${booking.activity_name}</p>
                <p style="margin: 5px 0;"><strong>👥 Guests:</strong> ${booking.participants}</p>
                <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${booking.farm_location || booking.city || booking.county}</p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">Please arrive 15 minutes early. Bring comfortable shoes and weather-appropriate clothing.</p>
              
              <div style="margin-top: 20px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/visitor/dashboard/bookings" style="background: #eab308; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  View My Bookings
                </a>
              </div>
              
              <hr style="margin: 20px 0; border-color: #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                Need to cancel or reschedule? Please contact the farmer directly through your dashboard.
              </p>
            </div>
          </div>
        `;
        
        await sendEmail(booking.visitor_email, `Reminder: Your farm visit at ${booking.farm_name} is tomorrow!`, emailHtml);
        
        // Send SMS reminder if phone number exists
        if (booking.visitor_phone) {
          const smsMessage = `HarvestHost Reminder: Your farm visit at ${booking.farm_name} is tomorrow at ${new Date(booking.booking_date).toLocaleDateString()}. Please arrive 15 minutes early. View details: ${process.env.NEXT_PUBLIC_APP_URL}/visitor/dashboard/bookings`;
          await sendSMS(booking.visitor_phone, smsMessage);
        }
        
        // Mark reminder as sent
        await pool.query(`
          UPDATE bookings SET reminder_sent = NOW() WHERE id = $1
        `, [booking.id]);
        
        remindersSent++;
        console.log(`Reminder sent for booking ${booking.id} to ${booking.visitor_email}`);
        
      } catch (error) {
        errors++;
        console.error(`Failed to send reminder for booking ${booking.id}:`, error);
      }
    }
    
    console.log(`Cron job completed: ${remindersSent} reminders sent, ${errors} errors`);
    
    return NextResponse.json({ 
      success: true, 
      remindersSent,
      errors,
      totalBookings: bookings.rows.length,
      date: tomorrowStr
    });
    
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}