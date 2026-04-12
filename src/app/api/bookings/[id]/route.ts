// src/app/api/bookings/[id]/route.ts
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    // Verify booking belongs to this visitor
    const verify = await pool.query(
      'SELECT id, status FROM bookings WHERE id = $1 AND visitor_id = $2',
      [bookingId, user.id]
    );

    if (verify.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = verify.rows[0];
    
    // Only allow deletion of pending or cancelled bookings
    if (booking.status === 'confirmed') {
      return NextResponse.json({ 
        error: 'Cannot delete confirmed booking. Please contact support.' 
      }, { status: 400 });
    }

    // Delete the booking
    await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]);

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id);

    const result = await pool.query(
      `SELECT b.*, a.activity_name, f.farm_name 
       FROM bookings b
       JOIN farmer_activities a ON b.activity_id = a.id
       JOIN farms f ON b.farm_id = f.id
       WHERE b.id = $1 AND b.visitor_id = $2`,
      [bookingId, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking: result.rows[0] });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}