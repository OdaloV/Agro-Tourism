// src/app/api/settings/route.ts
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
      commission_rate: settings.commission_rate || '10',
      min_booking_amount: settings.min_booking_amount || '300',
      max_guests_per_booking: settings.max_guests_per_booking || '100',
      verification_required: settings.verification_required === 'true',
      auto_approve: settings.auto_approve === 'true',
      maintenance_mode: settings.maintenance_mode === 'true',
      platform_name: settings.platform_name || 'HarvestHost',
      platform_email: settings.platform_email || 'admin@harvesthost.com',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}