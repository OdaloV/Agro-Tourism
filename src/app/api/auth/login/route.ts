// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import pool from '@/lib/db';
import { sendVisitorVerificationEmail } from '@/lib/services/notificationService';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);


async function sendTwoFactorCode(email: string, name: string, code: string) {
  
  try {
    const { sendEmail } = await import('@/lib/email');
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔐 Two-Factor Authentication</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Hello ${name},</p>
          <p>Your login verification code is:</p>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 32px; letter-spacing: 5px; font-weight: bold;">
            ${code}
          </div>
          <p>This code expires in <strong>5 minutes</strong>.</p>
          <p>If you didn't try to log in, please ignore this email.</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">HarvestHost - Secure Farm Booking Platform</p>
        </div>
      </div>
    `;
    
    // Actually send the email in development too
    await sendEmail(email, 'Your HarvestHost Login Verification Code', html);
    console.log(`✅ 2FA email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send 2FA email:', error);
    return { success: false, error };
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, role, twoFactorCode } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT u.*, 
              fp.verification_status,
              fp.farm_name,
              fp.id as farmer_profile_id,
              fp.submitted_at
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       WHERE u.email = $1 AND u.role = $2`,
      [email.toLowerCase(), role]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled and we're not in verification stage
    if (user.two_factor_enabled && !twoFactorCode) {
      // Generate and store OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      await pool.query(
        `UPDATE users SET otp_code = $1, otp_expires = $2 WHERE id = $3`,
        [otp, otpExpires, user.id]
      );
      
      // Send OTP via email
      await sendTwoFactorCode(user.email, user.name, otp);
      
      // ✅ Removed [DEV MODE] message - now always generic
      return NextResponse.json({
        requiresTwoFactor: true,
        userId: user.id,
        message: 'Verification code sent to your email'
      });
    }

    // Verify 2FA code if provided
    if (user.two_factor_enabled && twoFactorCode) {
      const otpCheck = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND otp_code = $2 AND otp_expires > NOW()`,
        [user.id, twoFactorCode]
      );
      
      if (otpCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid or expired verification code' },
          { status: 401 }
        );
      }
      
      // Clear used OTP
      await pool.query(
        `UPDATE users SET otp_code = NULL, otp_expires = NULL WHERE id = $1`,
        [user.id]
      );
    }

    // Check email verification for visitors and farmers
    if (role === 'visitor' || role === 'farmer') {
      if (!user.email_verified) {
        // Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpires = new Date(Date.now() + 15 * 60 * 1000);
        
        await pool.query(
          `UPDATE users 
           SET verification_code = $1, 
               verification_code_expires = $2 
           WHERE id = $3`,
          [verificationCode, codeExpires, user.id]
        );
        
        await sendVisitorVerificationEmail(user.email, user.name, verificationCode);
        
        return NextResponse.json(
          { 
            error: 'Please verify your email first. A verification code has been sent to your email.',
            requiresVerification: true,
            email: user.email
          },
          { status: 403 }
        );
      }
      
      // For farmers: Check if they have submitted documents
      if (role === 'farmer' && !user.verification_status) {
        return NextResponse.json(
          { 
            error: 'Please complete your farm verification by submitting documents.',
            requiresDocumentSubmission: true,
            redirectTo: '/farmer/verification'
          },
          { status: 403 }
        );
      }
    }

    // Create JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Prepare user response object
    const userResponse = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isVerified: user.is_verified || false,
      emailVerified: user.email_verified || false,
      verificationStatus: user.verification_status || null,
      farmName: user.farm_name || null,
      farmerProfileId: user.farmer_profile_id || null,
      hasSubmittedDocuments: !!user.verification_status,
      twoFactorEnabled: user.two_factor_enabled || false
    };

    const response = NextResponse.json({
      success: true,
      user: userResponse
    });

    // Set cookies
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

    // Also set user data in a separate cookie for frontend access (optional)
    response.cookies.set('user_data', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}