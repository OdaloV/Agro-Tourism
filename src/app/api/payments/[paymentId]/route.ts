// src/app/api/payments/[paymentId]/route.ts
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
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const paymentIdNum = parseInt(paymentId);
    
    if (isNaN(paymentIdNum)) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
    }
    
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'visitor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify payment belongs to this user
    const checkResult = await pool.query(`
      SELECT p.id FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.id = $1 AND b.visitor_id = $2
    `, [paymentIdNum, user.id]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    // Delete the payment
    await pool.query(`DELETE FROM payments WHERE id = $1`, [paymentIdNum]);
    
    return NextResponse.json({ success: true, message: 'Payment deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}