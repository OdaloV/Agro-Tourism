import { NextResponse } from 'next/server';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getCalendarEvents } from '@/lib/google-calendar';
import pool from '@/lib/db';

// Timeout wrapper for async operations
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
}

export async function POST(request: Request) {
  try {
    const { bookingId, farmId, activityId } = await request.json();
    
    const bookingResult = await withTimeout(
      pool.query(`
        SELECT b.*, 
               u.name as visitor_name, 
               u.email as visitor_email, 
               u.phone as visitor_phone,
               fp.farm_name, 
               fp.farm_location,
               u_farmer.email as farmer_email,
               a.activity_name, 
               a.duration_minutes
        FROM bookings b
        JOIN users u ON b.visitor_id = u.id
        JOIN farmer_profiles fp ON b.farm_id = fp.id
        JOIN users u_farmer ON fp.user_id = u_farmer.id
        JOIN farmer_activities a ON b.activity_id = a.id
        WHERE b.id = $1
      `, [bookingId]),
      15000 // 15 second timeout for database query
    );
    
    if (bookingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    const booking = bookingResult.rows[0];
    const farm = {
      farm_name: booking.farm_name,
      farm_location: booking.farm_location,
      farmer_email: booking.farmer_email,
    };
    const activity = {
      name: booking.activity_name,
      duration_minutes: booking.duration_minutes,
    };
    
    const event = await withTimeout(
      createCalendarEvent(booking, farm, activity),
      25000 // 25 second timeout for Google Calendar API
    );
    
    await withTimeout(
      pool.query(
        'UPDATE bookings SET google_event_id = $1 WHERE id = $2',
        [event.id, bookingId]
      ),
      10000 // 10 second timeout for database update
    );
    
    return NextResponse.json({
      success: true,
      eventId: event.id,
      eventUrl: event.htmlLink,
    });
    
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    const message = error?.message?.includes('timed out')
      ? 'Request timed out. Please try again.'
      : 'Failed to create calendar event';
    return NextResponse.json(
      { error: message },
      { status: error?.message?.includes('timed out') ? 504 : 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { bookingId, eventId, status } = await request.json();
    
    const bookingResult = await withTimeout(
      pool.query(`
        SELECT b.*, fp.farm_name, a.activity_name, a.duration_minutes
        FROM bookings b
        JOIN farmer_profiles fp ON b.farm_id = fp.id
        JOIN farmer_activities a ON b.activity_id = a.id
        WHERE b.id = $1
      `, [bookingId]),
      15000
    );
    
    if (bookingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    const booking = bookingResult.rows[0];
    const farm = { farm_name: booking.farm_name };
    const activity = {
      name: booking.activity_name,
      duration_minutes: booking.duration_minutes,
    };
    
    const event = await withTimeout(
      updateCalendarEvent(eventId, booking, farm, activity),
      25000
    );
    
    return NextResponse.json({
      success: true,
      eventUrl: event.htmlLink,
    });
    
  } catch (error: any) {
    console.error('Error updating calendar event:', error);
    const message = error?.message?.includes('timed out')
      ? 'Request timed out. Please try again.'
      : 'Failed to update calendar event';
    return NextResponse.json(
      { error: message },
      { status: error?.message?.includes('timed out') ? 504 : 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }
    
    await withTimeout(
      deleteCalendarEvent(eventId),
      25000
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    const message = error?.message?.includes('timed out')
      ? 'Request timed out. Please try again.'
      : 'Failed to delete calendar event';
    return NextResponse.json(
      { error: message },
      { status: error?.message?.includes('timed out') ? 504 : 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date required' }, { status: 400 });
    }
    
    const events = await getCalendarEvents(new Date(startDate), new Date(endDate));
    
    return NextResponse.json({ events });
    
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
