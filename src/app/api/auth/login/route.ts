import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import pool from '@/lib/db';
import { sendVerificationEmail } from '@/lib/services/notificationService';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

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
      [email, role]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // ✅ Check if email is verified (for farmers and visitors)
    if (role === 'farmer' || role === 'visitor') {
      if (!user.email_verified) {
        // Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        // Store verification code in database
        await pool.query(
          `UPDATE users 
           SET verification_code = $1, 
               verification_code_expires = $2 
           WHERE id = $3`,
          [verificationCode, codeExpires, user.id]
        );
        
        // Send verification email
        await sendVerificationEmail(user.email, user.name, verificationCode);
        
        return NextResponse.json(
          { 
            error: 'Please verify your email first. A verification code has been sent to your email.',
            requiresVerification: true,
            email: user.email
          },
          { status: 403 }
        );
      }
      
      // ✅ For farmers: Check if they have submitted documents (verification_status should not be null)
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
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    delete user.password_hash;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.is_verified,
        emailVerified: user.email_verified,
        verificationStatus: user.verification_status || 'pending',
        farmName: user.farm_name,
        farmerProfileId: user.farmer_profile_id,
        hasSubmittedDocuments: !!user.verification_status
      }
    });

    // Set cookie for middleware
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}