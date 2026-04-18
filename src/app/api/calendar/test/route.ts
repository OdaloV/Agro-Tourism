import { NextResponse } from 'next/server';
import { getCalendarClient } from '@/lib/google-calendar';

export async function GET() {
  try {
    const calendar = getCalendarClient();
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return NextResponse.json({
      success: true,
      events: response.data.items?.map(event => ({
        summary: event.summary,
        start: event.start?.dateTime || event.start?.date,
        status: event.status,
      })) || [],
    });
    
  } catch (error: any) {
    console.error('Calendar test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}