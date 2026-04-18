import { NextResponse } from 'next/server';
import { isTimeSlotAvailable, getCalendarEvents } from '@/lib/google-calendar';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    
    if (!farmId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Farm ID, start time, and end time required' },
        { status: 400 }
      );
    }
    
    const farmerResult = await pool.query(
      'SELECT google_calendar_id FROM farmer_profiles WHERE id = $1',
      [farmId]
    );
    
    const calendarId = farmerResult.rows[0]?.google_calendar_id || 'primary';
    
    const isAvailable = await isTimeSlotAvailable(
      new Date(startTime),
      new Date(endTime),
      calendarId
    );
    
    return NextResponse.json({
      available: isAvailable,
      startTime,
      endTime,
    });
    
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { farmId, date, durationMinutes = 60 } = await request.json();
    
    if (!farmId || !date) {
      return NextResponse.json(
        { error: 'Farm ID and date required' },
        { status: 400 }
      );
    }
    
    const farmerResult = await pool.query(
      'SELECT google_calendar_id FROM farmer_profiles WHERE id = $1',
      [farmId]
    );
    
    const calendarId = farmerResult.rows[0]?.google_calendar_id || 'primary';
    
    const startHour = 9;
    const endHour = 17;
    const slots = [];
    
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = new Date(baseDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
      
      if (slotEnd.getHours() >= endHour && slotEnd.getMinutes() > 0) continue;
      
      const isAvailable = await isTimeSlotAvailable(slotStart, slotEnd, calendarId);
      
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        available: isAvailable,
      });
    }
    
    return NextResponse.json({
      date,
      slots,
      durationMinutes,
    });
    
  } catch (error) {
    console.error('Error getting availability slots:', error);
    return NextResponse.json(
      { error: 'Failed to get availability slots' },
      { status: 500 }
    );
  }
}