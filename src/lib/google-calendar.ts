import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

let calendarAuth: JWT | null = null;

export function getCalendarAuth() {
  if (calendarAuth) return calendarAuth;
  
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    calendarAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
  }
  
  return calendarAuth;
}

export function getCalendarClient() {
  const auth = getCalendarAuth();
  if (!auth) throw new Error('Google Calendar auth not configured');
  return google.calendar({ version: 'v3', auth });
}

export async function createCalendarEvent(booking: any, farm: any, activity: any) {
  const calendar = getCalendarClient();
  
  const startTime = new Date(booking.booking_date);
  const endTime = new Date(startTime.getTime() + (activity.duration_minutes || 60) * 60000);
  
  const event = {
    summary: `${activity.name} at ${farm.farm_name}`,
    description: `
      🌾 Booking Details:
      • Reference: ${booking.booking_reference}
      • Guests: ${booking.participants}
      • Special Requests: ${booking.special_requests || 'None'}
      
      👤 Contact:
      • Name: ${booking.visitor_name}
      • Phone: ${booking.visitor_phone}
      • Email: ${booking.visitor_email}
      
      💰 Payment: KES ${booking.total_amount}
    `.trim(),
    location: farm.farm_location,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Africa/Nairobi',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Africa/Nairobi',
    },
    attendees: [
      { email: farm.farmer_email },
      { email: booking.visitor_email },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'email', minutes: 60 },
      ],
    },
  };
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    sendUpdates: 'all',
  });
  
  return response.data;
}

export async function updateCalendarEvent(eventId: string, booking: any, farm: any, activity: any) {
  const calendar = getCalendarClient();
  
  const startTime = new Date(booking.booking_date);
  const endTime = new Date(startTime.getTime() + (activity.duration_minutes || 60) * 60000);
  
  const event = {
    summary: `${activity.name} at ${farm.farm_name} - ${booking.status.toUpperCase()}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Africa/Nairobi',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Africa/Nairobi',
    },
    status: booking.status === 'cancelled' ? 'cancelled' : 'confirmed',
  };
  
  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId: eventId,
    requestBody: event,
    sendUpdates: 'all',
  });
  
  return response.data;
}

export async function deleteCalendarEvent(eventId: string) {
  const calendar = getCalendarClient();
  
  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
    sendUpdates: 'all',
  });
  
  return true;
}

export async function getCalendarEvents(startDate: Date, endDate: Date, calendarId: string = 'primary') {
  const calendar = getCalendarClient();
  
  const response = await calendar.events.list({
    calendarId,
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  return response.data.items || [];
}

export async function isTimeSlotAvailable(startTime: Date, endTime: Date, calendarId: string = 'primary'): Promise<boolean> {
  const events = await getCalendarEvents(startTime, endTime, calendarId);
  
  const conflictingEvents = events.filter(event => 
    event.status !== 'cancelled' && 
    event.transparency !== 'transparent'
  );
  
  return conflictingEvents.length === 0;
}

export async function syncFarmerAvailability(farmerId: number, calendarId: string = 'primary') {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 90);
  
  const events = await getCalendarEvents(startDate, endDate, calendarId);
  
  const busySlots = events.filter(event => 
    event.status !== 'cancelled' && 
    event.transparency !== 'transparent'
  );
  
  return busySlots.map(slot => ({
    start: new Date(slot.start?.dateTime || slot.start?.date || ''),
    end: new Date(slot.end?.dateTime || slot.end?.date || ''),
    summary: slot.summary,
  }));
}