import { redirect } from 'next/navigation';
import AdminLoginContent from './AdminLoginContent';

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { secret?: string };
}) {
  const validSecret = process.env.ADMIN_SECRET;

  if (!searchParams.secret || searchParams.secret !== validSecret) {
    redirect('/404');
  }

  return <AdminLoginContent />;
}
