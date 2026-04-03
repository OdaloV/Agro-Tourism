import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import pool from '@/lib/db';
import { notifyNewFarmerRegistration, sendRegistrationConfirmation, sendVerificationEmail } from '@/lib/services/notificationService';
import { checkMaintenanceMode } from '@/lib/utils/checkMaintenance'; 

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Convert empty strings / nullish values to null for integer DB columns
const toIntOrNull = (val: any): number | null => {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
};

// Helper function to save photos
const savePhotos = async (client: any, farmerId: number, photos: string[]) => {
  if (!photos || photos.length === 0) return;
  
  for (let i = 0; i < photos.length; i++) {
    const photoBase64 = photos[i];
    const matches = photoBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error(`Invalid photo format for index ${i}`);
      continue;
    }
    
    const imageType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    await client.query(
      `INSERT INTO farmer_photos (farmer_id, photo_data, photo_type, sort_order, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [farmerId, buffer, imageType, i]
    );
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role, farmerData } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification code (6 digits)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Insert user with email_verified = false and verification code
      const userResult = await client.query(
        `INSERT INTO users (name, email, phone, password_hash, role, is_verified, email_verified, verification_code, verification_code_expires)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, email, role`,
        [name, email, phone, hashedPassword, role, role === 'visitor', false, verificationCode, codeExpires]
      );

      const userId = userResult.rows[0].id;

      // ✅ STEP 6: Send verification email (for farmers and visitors, not admins)
      if (role !== 'admin') {
        await sendVerificationEmail(email, name, verificationCode);
        console.log(`Verification email sent to ${email} with code: ${verificationCode}`);
      }

      // If farmer, insert farmer profile
      if (role === 'farmer' && farmerData) {
        
        // Get verification setting from database
        const settingsResult = await client.query(
          "SELECT value FROM platform_settings WHERE key = 'verification_required'"
        );
        const verificationRequired = settingsResult.rows[0]?.value === 'true';
       
        const profileResult = await client.query(
          `INSERT INTO farmer_profiles (
            user_id, farm_name, farm_location, farm_size, year_established,
            farm_description, farm_type, accommodation, max_guests,
            verification_status, submitted_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id`,
          [
            userId,
            farmerData.farmName,
            farmerData.location,
            toIntOrNull(farmerData.farmSize),
            toIntOrNull(farmerData.yearEst),
            farmerData.farmDescription,
            farmerData.farmType,
            farmerData.accommodation,
            toIntOrNull(farmerData.maxGuests),
            verificationRequired ? 'pending' : 'approved',
            new Date()
          ]
        );

        const farmerId = profileResult.rows[0].id;
        
        if (verificationRequired) {
          await notifyNewFarmerRegistration(farmerData.farmName, farmerData.farmName);
        }
        
        // Send registration confirmation email
        await sendRegistrationConfirmation(email, name, farmerData.farmName);
        
        // Insert activities
        if (farmerData.allActivities && farmerData.allActivities.length > 0) {
          for (const activity of farmerData.allActivities) {
            const activityName = activity.split('(')[0]?.trim() || activity;
            const category = activity.includes('(') ? activity.split('(')[1]?.replace(')', '') : null;
            
            await client.query(
              `INSERT INTO farmer_activities (farmer_id, activity_name, category, is_custom)
               VALUES ($1, $2, $3, $4)`,
              [farmerId, activityName, category, category ? true : false]
            );
          }
        }

        // Insert facilities
        if (farmerData.facilities && farmerData.facilities.length > 0) {
          for (const facility of farmerData.facilities) {
            await client.query(
              `INSERT INTO farmer_facilities (farmer_id, facility_name)
               VALUES ($1, $2)`,
              [farmerId, facility]
            );
          }
        }

        // Save photos
        if (farmerData.photos && farmerData.photos.length > 0) {
          await savePhotos(client, farmerId, farmerData.photos);
        }
      }

      await client.query('COMMIT');

      // Create JWT token for auto-login after registration
      const token = await new SignJWT({
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        role: userResult.rows[0].role
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

      const user = userResult.rows[0];

      // Create response with cookies
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: false,
          verificationStatus: 'pending',
          emailVerified: false  // ← Add this to let frontend know
        },
        requiresVerification: role === 'farmer',
        requiresEmailVerification: role !== 'admin'  // ← Add this
      });

      // Set cookies for authentication
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
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}