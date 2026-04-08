// src/app/api/cron/send-reminders/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function GET(request: Request) {
  // Verify cron job secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Unauthorized cron job attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('Running reminder cron job...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // FIXED: reminder_sent is BOOLEAN, not timestamp
    const bookings = await pool.query(`
      SELECT 
        b.id,
        b.booking_date,
        b.activity_name,
        b.participants,
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
        AND (b.reminder_sent IS NULL OR b.reminder_sent = false)
    `, [tomorrowStr]);
    
    console.log(`Found ${bookings.rows.length} bookings for tomorrow`);
    
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
              <p>Dear ${booking.visitor_name},</p>
              <p>This is a reminder that you have a farm experience booked for <strong>tomorrow</strong>!</p>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>🌾 Farm:</strong> ${booking.farm_name}</p>
                <p><strong>📅 Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
                <p><strong>🎯 Activity:</strong> ${booking.activity_name}</p>
                <p><strong>👥 Guests:</strong> ${booking.participants}</p>
              </div>
              
              <p>Please arrive 15 minutes early.</p>
            </div>
          </div>
        `;
        
        await sendEmail(booking.visitor_email, `Reminder: Your farm visit at ${booking.farm_name} is tomorrow!`, emailHtml);
        
        // Mark reminder as sent
        await pool.query(`
          UPDATE bookings SET reminder_sent = true WHERE id = $1
        `, [booking.id]);
        
        remindersSent++;
        console.log(`✅ Reminder sent for booking ${booking.id} to ${booking.visitor_email}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Failed to send reminder for booking ${booking.id}:`, error);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      remindersSent,
      errors,
      totalBookings: bookings.rows.length
    });
    
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}