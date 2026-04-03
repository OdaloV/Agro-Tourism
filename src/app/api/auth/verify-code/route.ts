// src/app/api/auth/verify-code/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }
    
    // Check if code is valid and not expired
    const result = await pool.query(
      `SELECT id FROM users 
       WHERE email = $1 
       AND verification_code = $2 
       AND verification_code_expires > NOW()`,
      [email, code]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }
    
    // Update user as verified
    await pool.query(
      `UPDATE users 
       SET email_verified = true, 
           email_verified_at = NOW(),
           verification_code = NULL,
           verification_code_expires = NULL
       WHERE email = $1`,
      [email]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
    
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}