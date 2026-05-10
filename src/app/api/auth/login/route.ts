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
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const userRes = await pool.query(
    'SELECT id, role, password_hash FROM users WHERE email = $1',
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

  const token = await new SignJWT({ id: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const csrfToken = CSRF_SECRET ? csrfProtection.create(CSRF_SECRET) : '';

  const response = NextResponse.json({ success: true, csrfToken });
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}