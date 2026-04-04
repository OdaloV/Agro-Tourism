// src/app/api/farmer/group-bookings/[id]/quote/route.ts
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

// POST - Send a custom quote for large group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const bookingId = parseInt(params.id);
    const body = await request.json();
    const { amount, message, validUntil } = body;

    if (!amount || !validUntil) {
      return NextResponse.json({ error: 'Amount and valid until date are required' }, { status: 400 });
    }

    // Verify booking belongs to this farmer
    const verify = await pool.query(
      'SELECT id FROM bookings WHERE id = $1 AND farm_id = $2',
      [bookingId, farmerId]
    );

    if (verify.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    await pool.query(
      `UPDATE bookings 
       SET custom_quote_amount = $1,
           custom_quote_message = $2,
           quote_valid_until = $3,
           quote_status = 'pending',
           requires_quote = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [amount, message, validUntil, bookingId]
    );

    return NextResponse.json({ success: true, message: 'Quote sent successfully' });

  } catch (error) {
    console.error('Error sending quote:', error);
    return NextResponse.json(
      { error: 'Failed to send quote' },
      { status: 500 }
    );
  }
}