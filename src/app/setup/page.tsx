import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import SetupForm from './SetupForm';

export default async function SetupPage() {
  const result = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`);
  const adminExists = parseInt(result.rows[0].count, 10) > 0;

  if (adminExists) {
    redirect('/auth/login/admin');
  }

  return <SetupForm />;
}
