import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser, requireAuth, requireCsrf } from '@/lib/auth-middleware';
import { createCalendarEvent } from '@/lib/google-calendar';

// Calculate pricing based on group size
function calculatePricing(pricePerPerson: number, participants: number): {
  discountPercent: number;
  discountAmount: number;
  totalAmount: number;
  category: string;
  requiresQuote: boolean;
} {
  let discountPercent = 0;
  let requiresQuote = false;
  let category = 'standard';

  if (participants >= 11 && participants <= 20) {
    discountPercent = 10;
    category = 'group';
  } else if (participants >= 21 && participants <= 50) {
    discountPercent = 15;
    category = 'group';
  } else if (participants >= 51) {
    requiresQuote = true;
    category = 'large_group';
  }

  const discountAmount = (pricePerPerson * participants) * (discountPercent / 100);
  const totalAmount = (pricePerPerson * participants) - discountAmount;

  return { discountPercent, discountAmount, totalAmount, category, requiresQuote };
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await getUser(request);
    const authErr = requireAuth(user);
    if (authErr) return authErr;
    
    // Explicit null check before using user
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (user.role !== 'visitor') {
      return NextResponse.json({ error: 'Only visitors can create bookings' }, { status: 403 });
    }

    // CSRF check - user is definitely not null here
    const csrfErr = await requireCsrf(request, user);
    if (csrfErr) return csrfErr;

    const body = await request.json();
    const {
      farmId, activityId, bookingDate, timeSlot, participants,
      specialRequests, groupName, contactPhone, contactEmail,
      discountPercent: customDiscount, addToCalendar, durationMinutes, activityName, farmName
    } = body;

    if (!farmId || !bookingDate || !participants || !activityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user email from database
    const userEmailResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [user.id]);
    const userEmail = userEmailResult.rows[0]?.email || '';
    const visitorName = userEmailResult.rows[0]?.name || 'Guest';

    // Get activity details
    const activityResult = await pool.query(
      `SELECT id, activity_name, price, currency, max_capacity, farmer_id
       FROM farmer_activities WHERE id = $1`,
      [activityId]
    );
    if (activityResult.rows.length === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const activity = activityResult.rows[0];
    const pricePerPerson = parseFloat(activity.price);

    // Check capacity
    if (activity.max_capacity && participants > activity.max_capacity) {
      return NextResponse.json({
        error: `Maximum ${activity.max_capacity} guests allowed for this activity`
      }, { status: 400 });
    }

    // Calculate pricing
    let pricing;
    if (customDiscount && customDiscount > 0) {
      const discountAmount = (pricePerPerson * participants) * (customDiscount / 100);
      pricing = {
        discountPercent: customDiscount,
        discountAmount,
        totalAmount: (pricePerPerson * participants) - discountAmount,
        category: 'custom_discount',
        requiresQuote: false
      };
    } else {
      pricing = calculatePricing(pricePerPerson, participants);
    }

    // Large group — create quote request instead
    if (pricing.requiresQuote) {
      const quoteResult = await pool.query(
        `INSERT INTO booking_quotes (
          visitor_id, farmer_id, activity_id, group_size,
          preferred_date, special_requests, group_name,
          status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id`,
        [user.id, activity.farmer_id, activityId, participants,
          bookingDate, specialRequests, groupName || null, 'pending']
      );

      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          activity.farmer_id,
          'quote_request',
          'New Large Group Quote Request',
          `${participants} guests want to book ${activity.activity_name}`,
          JSON.stringify({ quoteId: quoteResult.rows[0].id, participants, activityName: activity.activity_name })
        ]
      );

      return NextResponse.json({
        success: true,
        requiresQuote: true,
        quoteId: quoteResult.rows[0].id,
        message: 'Quote request sent to farmer. You will receive a custom quote within 24 hours.'
      });
    }

    // Calculate fees
    const platformFee = pricing.totalAmount * 0.10;
    const farmerEarning = pricing.totalAmount * 0.90;

    // Check date availability
    const blockedCheck = await pool.query(
      `SELECT EXISTS(
        SELECT 1 FROM farmer_availability
        WHERE farmer_id = $1 AND $2::date BETWEEN start_date AND end_date
      ) as is_blocked`,
      [farmId, bookingDate]
    );
    if (blockedCheck.rows[0].is_blocked) {
      return NextResponse.json({ error: 'Selected date is not available' }, { status: 400 });
    }

    // Create booking
    const bookingResult = await pool.query(
      `INSERT INTO bookings (
        visitor_id, farm_id, activity_id, activity_name,
        booking_date, time_slot, participants, total_amount,
        platform_fee, farmer_earning, special_requests, group_name,
        contact_phone, contact_email, status, payment_status,
        currency, discount_percent, original_amount, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
      RETURNING id, booking_reference`,
      [
        user.id, farmId, activityId, activity.activity_name,
        bookingDate, timeSlot || null, participants, pricing.totalAmount,
        platformFee, farmerEarning, specialRequests || null, groupName || null,
        contactPhone || userEmail, contactEmail || userEmail,
        'pending', 'pending', activity.currency,
        pricing.discountPercent, pricing.totalAmount + pricing.discountAmount
      ]
    );

    const booking = bookingResult.rows[0];

    // Google Calendar event
    let googleEventId = null;
    if (addToCalendar) {
      try {
        const farmResult = await pool.query(
          `SELECT fp.farm_name, fp.farm_location, u.email as farmer_email
           FROM farmer_profiles fp
           JOIN users u ON fp.user_id = u.id
           WHERE fp.id = $1`,
          [farmId]
        );
        const farmData = farmResult.rows[0];

        const calendarEvent = await createCalendarEvent(
          {
            booking_reference: booking.booking_reference,
            participants,
            special_requests: specialRequests || 'None',
            visitor_name: visitorName,
            visitor_phone: contactPhone || userEmail,
            visitor_email: contactEmail || userEmail,
            total_amount: pricing.totalAmount,
            booking_date: bookingDate,
          },
          {
            farm_name: farmData.farm_name,
            farm_location: farmData.farm_location,
            farmer_email: farmData.farmer_email,
          },
          {
            name: activityName || activity.activity_name,
            duration_minutes: durationMinutes || 60,
          }
        );
        googleEventId = calendarEvent.id;
        await pool.query('UPDATE bookings SET google_event_id = $1 WHERE id = $2', [googleEventId, booking.id]);
      } catch (calendarError) {
        console.error('Error creating Google Calendar event:', calendarError);
        // Don't fail booking if calendar fails
      }
    }

    // Notify farmer
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        activity.farmer_id,
        'new_booking',
        'New Booking Received',
        `${participants} guests booked ${activity.activity_name} on ${bookingDate}`,
        JSON.stringify({ bookingId: booking.id, participants, activityName: activity.activity_name })
      ]
    );

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        reference: booking.booking_reference,
        totalAmount: pricing.totalAmount,
        currency: activity.currency,
        discountPercent: pricing.discountPercent,
        discountAmount: pricing.discountAmount,
        originalAmount: pricing.totalAmount + pricing.discountAmount,
        participants,
        category: pricing.category,
        googleEventId,
      },
      paymentUrl: `/visitor/payment/${booking.id}`
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

// GET - Fetch user's bookings
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    const authErr = requireAuth(user);
    if (authErr) return authErr;
    
    // Explicit null check
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const bookingId = searchParams.get('bookingId');

    let query = `
      SELECT
        b.*,
        fp.farm_name,
        fp.profile_photo_url as farm_image,
        fp.city,
        fp.county,
        fp.latitude,
        fp.longitude,
        a.activity_name,
        a.duration_minutes,
        b.google_event_id
      FROM bookings b
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      JOIN farmer_activities a ON b.activity_id = a.id
      WHERE b.visitor_id = $1
    `;

    const params: any[] = [user.id];
    let paramIndex = 2;

    if (status && status !== 'all') {
      query += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (bookingId) {
      query += ` AND b.id = $${paramIndex}`;
      params.push(parseInt(bookingId));
      paramIndex++;
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await pool.query(query, params);
    return NextResponse.json({ bookings: result.rows });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}