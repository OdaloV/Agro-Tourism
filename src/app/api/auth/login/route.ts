import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { SignJWT } from 'jose';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { sendEmail } from '@/lib/email';   // import the email helper

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

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
      `SELECT id, role, password_hash, email, name, two_factor_enabled
       FROM users WHERE email = $1`,
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

    // If 2FA is enabled, generate OTP and return requiresTwoFactor
    if (user.two_factor_enabled) {
      const otpCode = randomInt(100000, 999999).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await pool.query(
        `UPDATE users SET otp_code = $1, otp_expires = $2 WHERE id = $3`,
        [otpCode, expires, user.id]
      );

      // Send OTP via email
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>Two-Factor Authentication</h2>
          <p>Hello ${user.name || user.email},</p>
          <p>Your verification code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 4px;">${otpCode}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `;
      await sendEmail(user.email, 'Your 2FA Verification Code', emailHtml);

      return NextResponse.json({
        requiresTwoFactor: true,
        userId: user.id,
        message: 'OTP sent to your email'
      });
    }

    // No 2FA: issue full JWT and create session
    const sessionId = `session_${user.id}_${Date.now()}`;
    await pool.query(`DELETE FROM user_sessions WHERE user_id = $1`, [user.id]);
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

    const response = NextResponse.json({
      success: true,
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