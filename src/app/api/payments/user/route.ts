// src/app/api/payments/user/route.ts
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
    
    const result = await pool.query(`
      SELECT 
        p.id,
        p.booking_id,
        p.amount,
        p.platform_fee,
        p.farmer_earnings,
        p.payment_method,
        p.transaction_id,
        p.status as payment_status,
        p.payment_date,
        b.farm_id,
        fp.farm_name,
        b.booking_date,
        b.activity_name,
        b.participants,
        b.status as booking_status,
        b.booking_reference
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN farmer_profiles fp ON b.farm_id = fp.id
      WHERE b.visitor_id = $1
      ORDER BY p.payment_date DESC
    `, [user.id]);
    
    const payments = result.rows.map(row => ({
      id: row.id,
      bookingId: row.booking_id,
      farmName: row.farm_name,
      farmId: row.farm_id,
      amount: parseFloat(row.amount),
      date: row.payment_date || new Date().toISOString(),
      status: row.payment_status === 'completed' ? 'completed' : 
              row.payment_status === 'pending' ? 'pending' : 'refunded',
      paymentMethod: row.payment_method || 'Unknown',
      transactionId: row.transaction_id || 'N/A',
      invoiceUrl: `/api/invoices/${row.booking_id}`,
      items: [
        {
          name: row.activity_name,
          quantity: row.participants,
          price: parseFloat(row.amount) / row.participants
        }
      ]
    }));
    
    return NextResponse.json({ payments });
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}