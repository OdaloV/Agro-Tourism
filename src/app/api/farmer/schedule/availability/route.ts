import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { getCalendarClient, createCalendarEvent } from '@/lib/google-calendar';

interface GoogleBusySlot {
  start_date: string;
  end_date: string;
  reason: string;
  is_google: boolean;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

async function getFarmerId(userId: number) {
  const result = await pool.query(
    'SELECT id FROM farmer_profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
}

async function getFarmerCalendarId(farmerId: number) {
  const result = await pool.query(
    'SELECT google_calendar_connected, google_calendar_id FROM farmer_profiles WHERE id = $1',
    [farmerId]
  );
  return result.rows[0];
}

// POST - Block dates
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { start_date, end_date, reason, sync_to_google } = body;

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO farmer_availability (farmer_id, start_date, end_date, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [farmerId, start_date, end_date, reason || null]
    );

    // Sync to Google Calendar if requested
    let googleEventId = null;
    if (sync_to_google) {
      const calendarInfo = await getFarmerCalendarId(farmerId);
      
      if (calendarInfo?.google_calendar_connected && calendarInfo?.google_calendar_id) {
        try {
          const calendar = getCalendarClient();
          
          const event = {
            summary: `Blocked: ${reason || 'Unavailable'}`,
            description: `This time is blocked on HarvestHost. No bookings will be accepted.\nReason: ${reason || 'Not specified'}`,
            start: {
              dateTime: new Date(start_date).toISOString(),
              timeZone: 'Africa/Nairobi',
            },
            end: {
              dateTime: new Date(end_date).toISOString(),
              timeZone: 'Africa/Nairobi',
            },
            transparency: 'busy',
            visibility: 'private',
          };
          
          const calendarResponse = await calendar.events.insert({
            calendarId: calendarInfo.google_calendar_id,
            requestBody: event,
          });
          
          googleEventId = calendarResponse.data.id;
          
          // Save Google event ID to database
          await pool.query(
            `UPDATE farmer_availability SET google_event_id = $1 WHERE id = $2`,
            [googleEventId, result.rows[0].id]
          );
        } catch (calendarError) {
          console.error('Error syncing to Google Calendar:', calendarError);
          // Don't fail the request if Google Calendar sync fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Dates blocked successfully',
      blocked_date: result.rows[0],
      google_synced: !!googleEventId,
    });

  } catch (error) {
    console.error('Error blocking dates:', error);
    return NextResponse.json(
      { error: 'Failed to block dates' },
      { status: 500 }
    );
  }
}

// GET - Get blocked dates (including from Google Calendar)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get local blocked dates
    let query = `
      SELECT id, start_date, end_date, reason, created_at, google_event_id
      FROM farmer_availability
      WHERE farmer_id = $1
    `;
    const params = [farmerId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND end_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      query += ` AND start_date <= $${paramIndex}`;
      params.push(endDate);
    }

    query += ` ORDER BY start_date ASC`;

    const result = await pool.query(query, params);
    
    // Get Google Calendar busy slots if connected
    const calendarInfo = await getFarmerCalendarId(farmerId);
    let googleBusySlots: GoogleBusySlot[] = [];
    
    if (calendarInfo?.google_calendar_connected && calendarInfo?.google_calendar_id && startDate && endDate) {
      try {
        const calendar = getCalendarClient();
        const busyResponse = await calendar.freebusy.query({
          requestBody: {
            timeMin: new Date(startDate).toISOString(),
            timeMax: new Date(endDate).toISOString(),
            items: [{ id: calendarInfo.google_calendar_id }],
          },
        });
        
        const busyIntervals = busyResponse.data.calendars?.[calendarInfo.google_calendar_id]?.busy || [];
        googleBusySlots = busyIntervals.map((slot: any) => ({
          start_date: slot.start,
          end_date: slot.end,
          reason: 'Google Calendar Event',
          is_google: true,
        }));
      } catch (calendarError) {
        console.error('Error fetching Google Calendar busy slots:', calendarError);
      }
    }

    return NextResponse.json({
      success: true,
      blocked_dates: result.rows,
      google_busy_slots: googleBusySlots,
      google_calendar_connected: calendarInfo?.google_calendar_connected || false,
    });

  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked dates' },
      { status: 500 }
    );
  }
}

// DELETE - Remove blocked dates
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const availabilityId = searchParams.get('id');
    const removeFromGoogle = searchParams.get('removeFromGoogle') === 'true';

    if (!availabilityId) {
      return NextResponse.json(
        { error: 'Availability ID is required' },
        { status: 400 }
      );
    }

    // Get the blocked date info
    const blockedDate = await pool.query(
      'SELECT id, google_event_id FROM farmer_availability WHERE id = $1 AND farmer_id = $2',
      [availabilityId, farmerId]
    );

    if (blockedDate.rows.length === 0) {
      return NextResponse.json(
        { error: 'Blocked date not found' },
        { status: 404 }
      );
    }

    // Remove from Google Calendar if requested and event exists
    if (removeFromGoogle && blockedDate.rows[0].google_event_id) {
      const calendarInfo = await getFarmerCalendarId(farmerId);
      if (calendarInfo?.google_calendar_connected) {
        try {
          const calendar = getCalendarClient();
          await calendar.events.delete({
            calendarId: calendarInfo.google_calendar_id,
            eventId: blockedDate.rows[0].google_event_id,
          });
        } catch (calendarError) {
          console.error('Error removing from Google Calendar:', calendarError);
        }
      }
    }

    // Delete from database
    await pool.query('DELETE FROM farmer_availability WHERE id = $1', [availabilityId]);

    return NextResponse.json({
      success: true,
      message: 'Blocked dates removed successfully',
      removed_from_google: removeFromGoogle && !!blockedDate.rows[0].google_event_id,
    });

  } catch (error) {
    console.error('Error removing blocked dates:', error);
    return NextResponse.json(
      { error: 'Failed to remove blocked dates' },
      { status: 500 }
    );
  }
}