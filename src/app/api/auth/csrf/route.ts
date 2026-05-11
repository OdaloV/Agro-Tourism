import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth-middleware';
import { generateCsrfToken } from '@/lib/csrf';

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const csrfToken = await generateCsrfToken(user.id);
  return NextResponse.json({ csrfToken });
}