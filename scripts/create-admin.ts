import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import pool from '../src/lib/db';

config({ path: '.env.local' });

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'harvesthostadmin@gmail.com';
  const password = process.env.ADMIN_PASSWORD || '####admin2026';
  const name = process.env.ADMIN_NAME || 'HarvestHost Admin';
  
  console.log(`📧 Creating admin: ${email}`);
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, is_verified, created_at)
       VALUES ($1, $2, $3, 'admin', true, NOW())
       ON CONFLICT (email) DO UPDATE SET 
         password_hash = EXCLUDED.password_hash,
         role = 'admin',
         is_verified = true,
         name = EXCLUDED.name
       RETURNING id, email, role`,
      [email, hashedPassword, name]
    );
    
    console.log('✅ Admin created:', result.rows[0]);
  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
