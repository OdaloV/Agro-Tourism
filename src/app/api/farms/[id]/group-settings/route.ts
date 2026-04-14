import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const farmId = parseInt(id);

    const result = await pool.query(
      `SELECT 
        max_guests_per_booking,
        daily_capacity,
        discount_tier1_min, discount_tier1_percent,
        discount_tier2_min, discount_tier2_percent,
        discount_tier3_min, discount_tier3_percent,
        advance_notice_tier1_days,
        advance_notice_tier2_days,
        advance_notice_tier3_days,
        require_deposit_for_large_groups,
        require_waiver_for_groups,
        require_coordinator_for_groups
       FROM farmer_profiles
       WHERE id = $1`,
      [farmId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const settings = result.rows[0];
    
    // Build discount tiers array
    const discountTiers = [];
    if (settings.discount_tier1_min && settings.discount_tier1_percent) {
      discountTiers.push({
        min_guests: settings.discount_tier1_min,
        discount_percent: settings.discount_tier1_percent
      });
    }
    if (settings.discount_tier2_min && settings.discount_tier2_percent) {
      discountTiers.push({
        min_guests: settings.discount_tier2_min,
        discount_percent: settings.discount_tier2_percent
      });
    }
    if (settings.discount_tier3_min && settings.discount_tier3_percent) {
      discountTiers.push({
        min_guests: settings.discount_tier3_min,
        discount_percent: settings.discount_tier3_percent
      });
    }

    return NextResponse.json({
      max_guests_per_booking: settings.max_guests_per_booking || 50,
      daily_capacity: settings.daily_capacity || 200,
      discount_tiers: discountTiers,
      advance_notice_days: {
        tier1: settings.advance_notice_tier1_days || 3,
        tier2: settings.advance_notice_tier2_days || 7,
        tier3: settings.advance_notice_tier3_days || 14
      },
      requirements: {
        require_deposit: settings.require_deposit_for_large_groups || false,
        require_waiver: settings.require_waiver_for_groups || false,
        require_coordinator: settings.require_coordinator_for_groups || false
      }
    });
  } catch (error) {
    console.error('Error fetching group settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}