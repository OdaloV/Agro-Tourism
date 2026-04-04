// src/app/api/auth/resend-verification/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendVisitorVerificationEmail } from '@/lib/services/notificationService';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Get user
    const userResult = await pool.query(
      `SELECT id, name, email_verified FROM users WHERE email = $1`,
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userResult.rows[0];
    
    // Check if already verified
    if (user.email_verified === true) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }
    
    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Update user with new code
    await pool.query(
      `UPDATE users 
       SET verification_code = $1, 
           verification_code_expires = $2
       WHERE email = $3`,
      [verificationCode, codeExpires, email]
    );
    
    // Send verification email using visitor function
    await sendVisitorVerificationEmail(email, user.name, verificationCode);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Verification code resent successfully' 
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification code' },
      { status: 500 }
    );
  }
}