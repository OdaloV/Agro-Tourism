import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT key, value FROM platform_settings"
    );
    
    const settings: Record<string, string> = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    return NextResponse.json({
      platform_name: settings.platform_name || 'HarvestHost',
      platform_email: settings.platform_email || 'harvesthostadmin@gmail.com',
      commission_rate: parseFloat(settings.commission_rate) || 10,
      min_booking_amount: parseFloat(settings.min_booking_amount) || 300,
      max_guests_per_booking: parseInt(settings.max_guests_per_booking) || 100,
      maintenance_mode: settings.maintenance_mode === 'true',
      verification_required: settings.verification_required === 'true',
      auto_approve: settings.auto_approve === 'true',
      notification_email: settings.notification_email === 'true',
      dark_mode: settings.dark_mode === 'true',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { 
        platform_name: 'HarvestHost',
        platform_email: 'harvesthostadmin@gmail.com',
        commission_rate: 10,
        min_booking_amount: 300,
        max_guests_per_booking: 100,
        maintenance_mode: false,
        verification_required: true,
        auto_approve: false,
        notification_email: true,
        dark_mode: false,
      },
      { status: 200 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      platform_name,
      platform_email,
      commission_rate,
      min_booking_amount,
      max_guests_per_booking,
      maintenance_mode,
      dark_mode,
      verification_required,
      auto_approve,
      notification_email
    } = body;
    
    if (commission_rate !== undefined && (commission_rate < 0 || commission_rate > 100)) {
      return NextResponse.json(
        { error: 'Commission rate must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      if (platform_name !== undefined) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ('platform_name', $1, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [platform_name]
        );
      }
      
      if (platform_email !== undefined) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ('platform_email', $1, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [platform_email]
        );
      }
      
      if (commission_rate !== undefined) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ('commission_rate', $1::text, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [commission_rate.toString()]
        );
      }
      
      if (min_booking_amount !== undefined) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ('min_booking_amount', $1::text, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [min_booking_amount.toString()]
        );
      }
      
      if (max_guests_per_booking !== undefined) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ('max_guests_per_booking', $1::text, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [max_guests_per_booking.toString()]
        );
      }
      
      if (maintenance_mode !== undefined) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ('maintenance_mode', $1::text, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [maintenance_mode.toString()]
        );
      }
      
      if (dark_mode !== undefined) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ('dark_mode', $1::text, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [dark_mode.toString()]
        );
      }
      
      if (verification_required !== undefined) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ('verification_required', $1::text, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [verification_required.toString()]
        );
      }
      
      if (auto_approve !== undefined) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ('auto_approve', $1::text, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [auto_approve.toString()]
        );
      }
      
      if (notification_email !== undefined) {
        await client.query(
          `INSERT INTO platform_settings (key, value, updated_at) 
           VALUES ('notification_email', $1::text, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [notification_email.toString()]
        );
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