import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { SignJWT } from 'jose';
import { sendEmail } from '@/lib/email';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const result = await pool.query(
      `SELECT id, name, email FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // For security, don't reveal that user doesn't exist
      return NextResponse.json({
        success: true,
        message: 'If an account exists, you will receive a reset link'
      });
    }

    const user = result.rows[0];

    // Generate reset token (valid for 1 hour)
    const resetToken = await new SignJWT({
      id: user.id,
      email: user.email,
      purpose: 'password_reset'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(JWT_SECRET);

    // Store reset token in database
    await pool.query(
      `UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour' WHERE id = $2`,
      [resetToken, user.id]
    );

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔐 Password Reset Request</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link:</p>
          <p style="background: #f3f4f6; padding: 10px; word-break: break-all; font-size: 12px;">${resetUrl}</p>
          <p>This link will expire in <strong>1 hour</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">HarvestHost - Secure Farm Booking Platform</p>
        </div>
      </div>
    `;

    await sendEmail(email, 'Reset Your HarvestHost Password', html);

    return NextResponse.json({
      success: true,
      message: 'Reset link sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to send reset email' },
      { status: 500 }
    );
  }
}