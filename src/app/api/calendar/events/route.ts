import { NextResponse } from 'next/server';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getCalendarEvents } from '@/lib/google-calendar';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { bookingId, farmId, activityId } = await request.json();
    
    const bookingResult = await pool.query(`
      SELECT b.*, u.name as visitor_name, u.email as visitor_email, u.phone as visitor_phone,
             fp.farm_name, fp.farm_location, fp.farmer_email,
             a.activity_name, a.duration_minutes
      FROM bookings b
      JOIN users u ON b.visitor_id = u.id
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      JOIN farmer_activities a ON b.activity_id = a.id
      WHERE b.id = $1
    `, [bookingId]);
    
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
    
    const event = await createCalendarEvent(booking, farm, activity);
    
    await pool.query(
      'UPDATE bookings SET google_event_id = $1 WHERE id = $2',
      [event.id, bookingId]
    );
    
    return NextResponse.json({
      success: true,
      eventId: event.id,
      eventUrl: event.htmlLink,
    });
    
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { bookingId, eventId, status } = await request.json();
    
    const bookingResult = await pool.query(`
      SELECT b.*, fp.farm_name, a.activity_name, a.duration_minutes
      FROM bookings b
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      JOIN farmer_activities a ON b.activity_id = a.id
      WHERE b.id = $1
    `, [bookingId]);
    
    if (bookingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    const booking = bookingResult.rows[0];
    const farm = { farm_name: booking.farm_name };
    const activity = {
      name: booking.activity_name,
      duration_minutes: booking.duration_minutes,
    };
    
    const event = await updateCalendarEvent(eventId, booking, farm, activity);
    
    return NextResponse.json({
      success: true,
      eventUrl: event.htmlLink,
    });
    
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
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
    
    await deleteCalendarEvent(eventId);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
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