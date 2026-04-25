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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query escrow_transactions + bookings + farmer_profiles
    const result = await pool.query(`
      SELECT 
        et.id,
        et.booking_id,
        et.total_amount,
        et.platform_fee,
        et.farmer_amount,
        et.payment_method,
        et.intasend_txn_ref as transaction_id,
        et.status as escrow_status,
        et.created_at,
        et.released_at,
        et.refunded_at,
        b.booking_date,
        b.activity_name,
        b.participants,
        b.status as booking_status,
        b.booking_reference,
        fp.farm_name,
        fp.id as farm_id
      FROM escrow_transactions et
      JOIN bookings b ON et.booking_id = b.id
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      WHERE b.visitor_id = $1
      ORDER BY et.created_at DESC
    `, [user.id]);

    // Map to frontend expected format
    const payments = result.rows.map(row => ({
      id: row.id,
      bookingId: row.booking_id,
      farmName: row.farm_name,
      farmId: row.farm_id,
      amount: parseFloat(row.total_amount),
      date: row.created_at,
      status: mapPaymentStatus(row.escrow_status, row.booking_status),
      paymentMethod: row.payment_method || 'Unknown',
      transactionId: row.transaction_id || 'N/A',
      invoiceUrl: `/api/invoices/${row.booking_id}`,
      items: [
        {
          name: row.activity_name,
          quantity: row.participants,
          price: parseFloat(row.total_amount) / row.participants
        }
      ]
    }));

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}

// Helper to convert internal status to friendly status string
function mapPaymentStatus(escrowStatus: string, bookingStatus: string): string {
  if (escrowStatus === 'refunded') return 'refunded';
  if (escrowStatus === 'released') return 'completed';
  if (escrowStatus === 'held' && bookingStatus === 'confirmed') return 'completed';
  if (escrowStatus === 'held') return 'pending';
  if (escrowStatus === 'pending') return 'pending';
  return 'pending';
}
