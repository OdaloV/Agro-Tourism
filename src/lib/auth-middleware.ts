// src/lib/auth-middleware.ts
// Reusable auth helpers for all API routes

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { validateCsrfToken } from '@/lib/csrf';  // Use custom CSRF

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

export type AuthUser = { id: number; role: string };

/** Extract user from JWT cookie. Returns null if missing or invalid. */
export async function getUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number, role: payload.role as string };
  } catch {
    return null;
  }
}

/** Returns 401 response if user is not logged in, otherwise null. */
export function requireAuth(user: AuthUser | null): NextResponse | null {
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return null;
}

/** Returns 401/403 response if user is not the required role, otherwise null. */
export function requireRole(user: AuthUser | null, role: string): NextResponse | null {
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}

/** Returns 401 if CRON_SECRET header doesn't match env var. */
export function requireCronSecret(request: NextRequest): NextResponse | null {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/** Returns 403 response if CSRF token is invalid, otherwise null. */
export async function requireCsrf(request: NextRequest, user: AuthUser): Promise<NextResponse | null> {
  const csrfToken = request.headers.get('x-csrf-token');
  if (!csrfToken) return NextResponse.json({ error: 'CSRF token missing' }, { status: 403 });

  const isValid = await validateCsrfToken(csrfToken, user.id);
  if (!isValid) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });

  return null;
}