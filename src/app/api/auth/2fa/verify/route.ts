import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import pool from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    console.log('=== 2FA VERIFY DEBUG ===');
    console.log('Received:', { userId, code });

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Missing user ID or verification code' },
        { status: 400 }
      );
    }

    // Direct query to get OTP
    const result = await pool.query(
      `SELECT id, email, role, name, otp_code, otp_expires, two_factor_enabled 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    
    console.log('Database values:', {
      storedOtp: user.otp_code,
      receivedCode: code,
      expires: user.otp_expires,
      now: new Date().toISOString()
    });

    // Check if OTP exists
    if (!user.otp_code) {
      console.log('No OTP in database');
      return NextResponse.json(
        { error: 'No verification code found. Please login again.' },
        { status: 400 }
      );
    }

    // Compare codes
    if (user.otp_code !== code) {
      console.log(`Code mismatch: ${user.otp_code} vs ${code}`);
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(user.otp_expires)) {
      console.log('Code expired');
      return NextResponse.json(
        { error: 'Verification code has expired. Please login again.' },
        { status: 400 }
      );
    }

    console.log('✅ 2FA verification successful!');

    // Clear used OTP
    await pool.query(
      `UPDATE users SET otp_code = NULL, otp_expires = NULL WHERE id = $1`,
      [userId]
    );

    // Generate final auth token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || ''
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const userResponse = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.two_factor_enabled || false
    };

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
    
    response.cookies.set('user_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}