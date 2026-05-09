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

// GET /api/farmer/bank-details - Fetch farmer's bank details
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT bank_account_number, bank_code, account_holder_name 
       FROM farmer_profiles 
       WHERE user_id = $1`,
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ bank_account_number: null, bank_code: null, account_holder_name: null });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching bank details:', error);
    return NextResponse.json({ error: 'Failed to fetch bank details' }, { status: 500 });
  }
}

// POST /api/farmer/bank-details - Create or update bank details
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bank_account_number, bank_code, account_holder_name } = await request.json();

    if (!bank_account_number || !bank_code || !account_holder_name) {
      return NextResponse.json({ error: 'Missing required fields: bank_account_number, bank_code, account_holder_name' }, { status: 400 });
    }

    // Check if farmer profile already has bank details
    const existing = await pool.query(
      `SELECT id FROM farmer_profiles WHERE user_id = $1 AND bank_account_number IS NOT NULL`,
      [user.id]
    );

    if (existing.rows.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE farmer_profiles 
         SET bank_account_number = $1, bank_code = $2, account_holder_name = $3
         WHERE user_id = $4`,
        [bank_account_number, bank_code, account_holder_name, user.id]
      );
    } else {
      // Insert new (assuming farmer_profiles row already exists, we need to update, not insert)
      // Better to use UPDATE; if no row, we could insert but row should exist. Use UPDATE always.
      await pool.query(
        `UPDATE farmer_profiles 
         SET bank_account_number = $1, bank_code = $2, account_holder_name = $3
         WHERE user_id = $4`,
        [bank_account_number, bank_code, account_holder_name, user.id]
      );
    }

    return NextResponse.json({ success: true, message: 'Bank details saved successfully' });
  } catch (error) {
    console.error('Error saving bank details:', error);
    return NextResponse.json({ error: 'Failed to save bank details' }, { status: 500 });
  }
}
