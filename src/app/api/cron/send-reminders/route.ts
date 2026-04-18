import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendBookingReminderEmail } from '@/lib/email';
import { getCalendarClient, createCalendarEvent } from '@/lib/google-calendar';

export async function GET(request: Request) {
  // Verify cron job secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Unauthorized cron job attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('Running reminder cron job...');
    
    // Check for bookings in 24 hours (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Check for bookings in 1 hour
    const oneHourLater = new Date();
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    
    // Get bookings for tomorrow (24h reminder)
    const bookings24h = await pool.query(`
      SELECT 
        b.id,
        b.booking_date,
        b.booking_reference,
        b.activity_name,
        b.participants,
        b.google_event_id,
        u.id as visitor_id,
        u.name as visitor_name,
        u.email as visitor_email,
        u.phone as visitor_phone,
        fp.farm_name,
        fp.farm_location,
        fp.city,
        fp.county,
        fp.farmer_email
      FROM bookings b
      JOIN users u ON b.visitor_id = u.id
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      WHERE b.booking_date::date = $1 
        AND b.status = 'confirmed'
        AND (b.reminder_24h_sent IS NULL OR b.reminder_24h_sent = false)
    `, [tomorrowStr]);
    
    // Get bookings for next hour (1h reminder)
    const bookings1h = await pool.query(`
      SELECT 
        b.id,
        b.booking_date,
        b.booking_reference,
        b.activity_name,
        b.participants,
        b.google_event_id,
        u.id as visitor_id,
        u.name as visitor_name,
        u.email as visitor_email,
        u.phone as visitor_phone,
        fp.farm_name,
        fp.farm_location,
        fp.city,
        fp.county,
        fp.farmer_email
      FROM bookings b
      JOIN users u ON b.visitor_id = u.id
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      WHERE b.booking_date BETWEEN NOW() AND $1
        AND b.status = 'confirmed'
        AND (b.reminder_1h_sent IS NULL OR b.reminder_1h_sent = false)
    `, [oneHourLater.toISOString()]);
    
    console.log(`Found ${bookings24h.rows.length} bookings for 24h reminder`);
    console.log(`Found ${bookings1h.rows.length} bookings for 1h reminder`);
    
    let remindersSent24h = 0;
    let remindersSent1h = 0;
    let calendarEventsCreated = 0;
    let errors = 0;
    
    // Process 24-hour reminders
    for (const booking of bookings24h.rows) {
      try {
        // Generate Google Calendar link if not already exists
        let calendarLink = null;
        if (!booking.google_event_id) {
          try {
            const farmData = {
              farm_name: booking.farm_name,
              farm_location: booking.farm_location,
              farmer_email: booking.farmer_email,
            };
            const activityData = {
              name: booking.activity_name,
              duration_minutes: 60,
            };
            const eventData = {
              booking_reference: booking.booking_reference,
              participants: booking.participants,
              special_requests: 'None',
              visitor_name: booking.visitor_name,
              visitor_phone: booking.visitor_phone,
              visitor_email: booking.visitor_email,
              total_amount: 0,
              booking_date: booking.booking_date,
            };
            
            const event = await createCalendarEvent(eventData, farmData, activityData);
            calendarLink = event.htmlLink;
            
            // Save Google event ID
            await pool.query(
              'UPDATE bookings SET google_event_id = $1 WHERE id = $2',
              [event.id, booking.id]
            );
            calendarEventsCreated++;
          } catch (calendarError) {
            console.error(`Failed to create calendar event for booking ${booking.id}:`, calendarError);
          }
        } else {
          calendarLink = `https://calendar.google.com/calendar/r?eventid=${booking.google_event_id}`;
        }
        
        // Send email reminder with calendar link
        await sendBookingReminderEmail({
          to: booking.visitor_email,
          farmerEmail: booking.farmer_email,
          bookingReference: booking.booking_reference,
          farmName: booking.farm_name,
          activityName: booking.activity_name,
          bookingDate: booking.booking_date,
          reminderTime: '24 hours',
          calendarLink: calendarLink || undefined,
        });
        
        // Mark 24h reminder as sent
        await pool.query(`
          UPDATE bookings SET reminder_24h_sent = true WHERE id = $1
        `, [booking.id]);
        
        remindersSent24h++;
        console.log(`✅ 24h reminder sent for booking ${booking.id} to ${booking.visitor_email}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Failed to send 24h reminder for booking ${booking.id}:`, error);
      }
    }
    
    // Process 1-hour reminders
    for (const booking of bookings1h.rows) {
      try {
        // Generate Google Calendar link if not already exists
        let calendarLink = null;
        if (!booking.google_event_id) {
          try {
            const farmData = {
              farm_name: booking.farm_name,
              farm_location: booking.farm_location,
              farmer_email: booking.farmer_email,
            };
            const activityData = {
              name: booking.activity_name,
              duration_minutes: 60,
            };
            const eventData = {
              booking_reference: booking.booking_reference,
              participants: booking.participants,
              special_requests: 'None',
              visitor_name: booking.visitor_name,
              visitor_phone: booking.visitor_phone,
              visitor_email: booking.visitor_email,
              total_amount: 0,
              booking_date: booking.booking_date,
            };
            
            const event = await createCalendarEvent(eventData, farmData, activityData);
            calendarLink = event.htmlLink;
            
            await pool.query(
              'UPDATE bookings SET google_event_id = $1 WHERE id = $2',
              [event.id, booking.id]
            );
            calendarEventsCreated++;
          } catch (calendarError) {
            console.error(`Failed to create calendar event for booking ${booking.id}:`, calendarError);
          }
        } else {
          calendarLink = `https://calendar.google.com/calendar/r?eventid=${booking.google_event_id}`;
        }
        
        // Send email reminder with calendar link
        await sendBookingReminderEmail({
          to: booking.visitor_email,
          farmerEmail: booking.farmer_email,
          bookingReference: booking.booking_reference,
          farmName: booking.farm_name,
          activityName: booking.activity_name,
          bookingDate: booking.booking_date,
          reminderTime: '1 hour',
          calendarLink: calendarLink || undefined,
        });
        
        // Mark 1h reminder as sent
        await pool.query(`
          UPDATE bookings SET reminder_1h_sent = true WHERE id = $1
        `, [booking.id]);
        
        remindersSent1h++;
        console.log(`✅ 1h reminder sent for booking ${booking.id} to ${booking.visitor_email}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Failed to send 1h reminder for booking ${booking.id}:`, error);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      reminders24h: remindersSent24h,
      reminders1h: remindersSent1h,
      calendarEventsCreated,
      errors,
      totalBookings24h: bookings24h.rows.length,
      totalBookings1h: bookings1h.rows.length,
    });
    
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}