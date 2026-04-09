// src/app/api/farmer/earnings/[id]/route.ts
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const earningId = parseInt(params.id);
    
    // Get farmer profile ID
    const farmerResult = await pool.query(
      `SELECT id FROM farmer_profiles WHERE user_id = $1`,
      [user.id]
    );
    
    if (farmerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }
    
    const farmerId = farmerResult.rows[0].id;
    
    // Verify this earning belongs to the farmer
    const verifyResult = await pool.query(`
      SELECT p.id 
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.id = $1 AND b.farm_id = $2
    `, [earningId, farmerId]);
    
    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Earning record not found' }, { status: 404 });
    }
    
    // Delete the payment record
    await pool.query(`DELETE FROM payments WHERE id = $1`, [earningId]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Earning record deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting earning:', error);
    return NextResponse.json(
      { error: 'Failed to delete earning record' },
      { status: 500 }
    );
  }
}