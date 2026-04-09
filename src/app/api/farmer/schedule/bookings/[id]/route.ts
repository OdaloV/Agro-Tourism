// src/app/api/farmer/schedule/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

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

// PUT - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id (Next.js 15 requirement)
    const { id } = await params;
    
    // FIXED: Better ID validation and parsing
    const bookingId = parseInt(id);
    
    if (!id || isNaN(bookingId) || bookingId <= 0) {
      console.error('Invalid booking ID received:', { id, bookingId });
      return NextResponse.json({ 
        error: 'Invalid booking ID',
        debug: { received: id, parsed: bookingId }
      }, { status: 400 });
    }
    
    console.log('PUT request for booking ID:', bookingId);
    
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Verify booking belongs to this farmer
    const verify = await pool.query(
      'SELECT id FROM bookings WHERE id = $1 AND farm_id = $2',
      [bookingId, farmerId]
    );

    if (verify.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Update booking status
    await pool.query(
      `UPDATE bookings 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND farm_id = $3`,
      [status, bookingId, farmerId]
    );

    return NextResponse.json({
      success: true,
      message: `Booking ${status} successfully`
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// GET - Get single booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id (Next.js 15 requirement)
    const { id } = await params;
    
    // FIXED: Better ID validation and parsing
    const bookingId = parseInt(id);
    
    if (!id || isNaN(bookingId) || bookingId <= 0) {
      console.error('Invalid booking ID received:', { id, bookingId });
      return NextResponse.json({ 
        error: 'Invalid booking ID',
        debug: { received: id, parsed: bookingId }
      }, { status: 400 });
    }
    
    console.log('GET request for booking ID:', bookingId);
    
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    // FIXED: Explicitly select payment_status and add logging
    const result = await pool.query(
      `SELECT 
         b.id,
         b.activity_id,
         b.visitor_id,
         b.farm_id,
         b.booking_date,
         b.participants,
         b.status,
         b.payment_status,  -- EXPLICITLY SELECT payment_status
         b.total_amount,
         b.special_requests,
         b.created_at,
         b.updated_at,
         a.activity_name,
         u.name as visitor_name,
         u.email as visitor_email,
         u.phone as visitor_phone
       FROM bookings b
       LEFT JOIN farmer_activities a ON b.activity_id = a.id
       JOIN users u ON b.visitor_id = u.id
       WHERE b.id = $1 AND b.farm_id = $2`,
      [bookingId, farmerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = result.rows[0];
    
    // DEBUGGING: Log the payment_status value
    console.log(`🔍 Booking ${bookingId} data:`, {
      id: booking.id,
      status: booking.status,
      payment_status: booking.payment_status,
      payment_status_type: typeof booking.payment_status,
      payment_status_is_null: booking.payment_status === null,
      visitor: booking.visitor_name
    });

    return NextResponse.json({
      success: true,
      booking: booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id (Next.js 15 requirement)
    const { id } = await params;
    
    // FIXED: Better ID validation and parsing
    const bookingId = parseInt(id);
    
    if (!id || isNaN(bookingId) || bookingId <= 0) {
      console.error('Invalid booking ID received:', { id, bookingId });
      return NextResponse.json({ 
        error: 'Invalid booking ID',
        debug: { received: id, parsed: bookingId }
      }, { status: 400 });
    }
    
    console.log('DELETE request for booking ID:', bookingId);
    
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    // Verify and delete booking in one query (safer)
    const deletedBooking = await pool.query(
      `DELETE FROM bookings 
       WHERE id = $1 AND farm_id = $2 
       RETURNING id`,
      [bookingId, farmerId]
    );

    if (deletedBooking.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Delete associated payment record if exists
    await pool.query(
      `DELETE FROM payments WHERE booking_id = $1`,
      [bookingId]
    );

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}