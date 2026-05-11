// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { SignJWT } from 'jose';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import csrf from 'csrf';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const CSRF_SECRET = process.env.CSRF_SECRET || '';
const csrfProtection = new csrf();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const userRes = await pool.query(
      'SELECT id, role, password_hash, email, name FROM users WHERE email = $1',
      [email]
    );
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = userRes.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const token = await new SignJWT({ id: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Invalidate all previous sessions for this user (one session per user only)
    await pool.query(
      'DELETE FROM user_sessions WHERE user_id = $1',
      [user.id]
    );

    // Create new session entry
    const sessionId = `session_${user.id}_${Date.now()}`;
    await pool.query(
      'INSERT INTO user_sessions (user_id, session_token, created_at, expires_at) VALUES ($1, $2, NOW(), NOW() + INTERVAL \'7 days\')',
      [user.id, sessionId]
    );

    const csrfToken = CSRF_SECRET ? csrfProtection.create(CSRF_SECRET) : '';

    const response = NextResponse.json({ 
      success: true, 
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}