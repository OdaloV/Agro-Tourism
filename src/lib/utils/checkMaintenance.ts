// src/lib/utils/checkMaintenance.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function checkMaintenanceMode() {
  try {
    const result = await pool.query(
      "SELECT value FROM platform_settings WHERE key = 'maintenance_mode'"
    );
    if (result.rows[0]?.value === 'true') {
      return NextResponse.json(
        { error: 'Platform is under maintenance. Please try again later.' },
        { status: 503 }
      );
    }
    return null;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return null;
  }
}