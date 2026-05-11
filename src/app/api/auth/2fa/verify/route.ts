import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Missing user ID or verification code' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT id, email, role, name, otp_code, otp_expires FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];

    if (!user.otp_code || user.otp_code !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
    }

    // Clear used OTP
    await pool.query(`UPDATE users SET otp_code = NULL, otp_expires = NULL WHERE id = $1`, [userId]);

    // --- Create session and JWT ---
    const sessionId = randomUUID();
    // Delete any old sessions for this user
    await pool.query(`DELETE FROM user_sessions WHERE user_id = $1`, [userId]);
    // Insert new session
    await pool.query(
      `INSERT INTO user_sessions (user_id, session_token, created_at, expires_at)
       VALUES ($1, $2, NOW(), NOW() + INTERVAL '7 days')`,
      [user.id, sessionId]
    );

    const token = await new SignJWT({
      id: user.id,
      role: user.role,
      sessionId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const userResponse = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role,
      twoFactorEnabled: true
    };

    // Create response and set cookie
    const response = NextResponse.json({
      success: true,
      user: userResponse
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
