import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, name, phone } = await request.json();

    if (!email || !password || !name || !phone) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existing = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`);
    if (parseInt(existing.rows[0].count, 10) > 0) {
      return NextResponse.json({ error: 'Admin already configured' }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, role, is_verified, created_at)
       VALUES ($1, $2, $3, $4, 'admin', true, NOW())
       RETURNING id, email, role`,
      [email, hashedPassword, name, phone]
    );

    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Setup failed:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
