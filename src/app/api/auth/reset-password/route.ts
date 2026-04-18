import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verify the token
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET);
      payload = verifiedPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is for password reset
    if (payload.purpose !== 'password_reset') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 400 }
      );
    }

    // Verify token in database
    const result = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expires > NOW()`,
      [payload.id, token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const userId = result.rows[0].id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, 
           reset_token = NULL, 
           reset_token_expires = NULL 
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}