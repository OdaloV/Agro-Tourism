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
    return { id: payload.id as number };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await request.json();
    await pool.query(
      `UPDATE users SET two_factor_enabled = $1 WHERE id = $2`,
      [enabled, user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle 2FA error:', error);
    return NextResponse.json({ error: 'Failed to toggle 2FA' }, { status: 500 });
  }
}
