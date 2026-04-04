// src/app/api/farmer/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

async function getFarmerId(userId: number) {
  const result = await pool.query(
    'SELECT id FROM farmer_profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
}

// GET - Fetch all settings
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    // Get user profile
    const userResult = await pool.query(
      'SELECT id, name, email, phone FROM users WHERE id = $1',
      [user.id]
    );

    // Get farmer profile
    const farmerResult = await pool.query(
      `SELECT farm_name, farm_location, farm_size, year_established, 
              farm_description, farm_type, accommodation, max_guests, video_link
       FROM farmer_profiles WHERE id = $1`,
      [farmerId]
    );

    // Get facilities
    const facilitiesResult = await pool.query(
      'SELECT facility_name FROM farmer_facilities WHERE farmer_id = $1',
      [farmerId]
    );

    // Get settings
    let settingsResult = await pool.query(
      'SELECT * FROM farmer_settings WHERE farmer_id = $1',
      [farmerId]
    );
    
    if (settingsResult.rows.length === 0) {
      // Create default settings
      await pool.query(
        `INSERT INTO farmer_settings (farmer_id) VALUES ($1)`,
        [farmerId]
      );
      settingsResult = await pool.query(
        'SELECT * FROM farmer_settings WHERE farmer_id = $1',
        [farmerId]
      );
    }

    // Get payment settings
    let paymentResult = await pool.query(
      'SELECT * FROM farmer_payment_settings WHERE farmer_id = $1',
      [farmerId]
    );
    
    if (paymentResult.rows.length === 0) {
      await pool.query(
        `INSERT INTO farmer_payment_settings (farmer_id) VALUES ($1)`,
        [farmerId]
      );
      paymentResult = await pool.query(
        'SELECT * FROM farmer_payment_settings WHERE farmer_id = $1',
        [farmerId]
      );
    }

    // Get business hours
    const hoursResult = await pool.query(
      'SELECT * FROM farmer_business_hours WHERE farmer_id = $1 ORDER BY day_of_week',
      [farmerId]
    );

    // Get two-factor status
    const twoFactorResult = await pool.query(
      'SELECT enabled FROM farmer_two_factor WHERE farmer_id = $1',
      [farmerId]
    );

    return NextResponse.json({
      success: true,
      user: userResult.rows[0],
      farmer: farmerResult.rows[0],
      facilities: facilitiesResult.rows.map(f => f.facility_name),
      settings: settingsResult.rows[0],
      payment: paymentResult.rows[0],
      business_hours: hoursResult.rows,
      two_factor_enabled: twoFactorResult.rows[0]?.enabled || false
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmerId = await getFarmerId(user.id);
    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { type, data } = body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      if (type === 'profile') {
        // Update user profile
        await client.query(
          `UPDATE users SET name = $1, phone = $2 WHERE id = $3`,
          [data.name, data.phone, user.id]
        );
      }
      
      else if (type === 'password') {
        // Verify current password
        const userResult = await client.query(
          'SELECT password_hash FROM users WHERE id = $1',
          [user.id]
        );
        
        const isValid = await bcrypt.compare(data.current_password, userResult.rows[0].password_hash);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 400 }
          );
        }
        
        const hashedPassword = await bcrypt.hash(data.new_password, 10);
        await client.query(
          `UPDATE users SET password_hash = $1 WHERE id = $2`,
          [hashedPassword, user.id]
        );
      }
      
      else if (type === 'farm') {
        await client.query(
          `UPDATE farmer_profiles 
           SET farm_name = $1, farm_location = $2, farm_size = $3, 
               year_established = $4, farm_description = $5, farm_type = $6,
               accommodation = $7, max_guests = $8, video_link = $9
           WHERE id = $10`,
          [data.farm_name, data.farm_location, data.farm_size, data.year_established,
           data.farm_description, data.farm_type, data.accommodation, data.max_guests,
           data.video_link, farmerId]
        );
      }
      
      else if (type === 'notifications') {
        await client.query(
          `UPDATE farmer_settings 
           SET notification_email_bookings = $1,
               notification_email_messages = $2,
               notification_email_reviews = $3,
               notification_email_promotions = $4,
               notification_sms = $5,
               notification_booking_reminders = $6,
               marketing_emails = $7
           WHERE farmer_id = $8`,
          [data.email_bookings, data.email_messages, data.email_reviews,
           data.email_promotions, data.sms, data.booking_reminders,
           data.marketing_emails, farmerId]
        );
      }
      
      else if (type === 'payment') {
        await client.query(
          `UPDATE farmer_payment_settings 
           SET bank_name = $1, account_name = $2, account_number = $3,
               mpesa_number = $4, payment_methods = $5, tax_id = $6
           WHERE farmer_id = $7`,
          [data.bank_name, data.account_name, data.account_number,
           data.mpesa_number, data.payment_methods, data.tax_id, farmerId]
        );
      }
      
      else if (type === 'hours') {
        // Delete existing hours
        await client.query(
          'DELETE FROM farmer_business_hours WHERE farmer_id = $1',
          [farmerId]
        );
        
        // Insert new hours
        for (const hour of data.hours) {
          await client.query(
            `INSERT INTO farmer_business_hours (farmer_id, day_of_week, is_open, open_time, close_time)
             VALUES ($1, $2, $3, $4, $5)`,
            [farmerId, hour.day, hour.is_open, hour.open_time, hour.close_time]
          );
        }
      }

      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}