// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  try {
    const result = await pool.query(
      "SELECT value FROM platform_settings WHERE key = 'maintenance_mode'"
    );
    const maintenanceMode = result.rows[0]?.value === 'true';
    
    const isAdminRoute = pathname.startsWith('/admin') ||
                         pathname.startsWith('/api/admin') ||
                         pathname === '/auth/login/admin';
    const isLoginRoute = pathname === '/auth/login/admin' ||
                         pathname === '/auth/login/farmer' ||
                         pathname === '/auth/login/visitor';
    const isSettingsApi = pathname.startsWith('/api/settings');
    
    if (maintenanceMode && !isAdminRoute && !isLoginRoute && !isSettingsApi) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Under Maintenance</title>
          <style>
            body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #065f46, #047857); color: white; text-align: center; }
            .container { padding: 2rem; }
            h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
            p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 0.5rem; }
            .icon { font-size: 5rem; margin-bottom: 1rem; }
            .subtext { font-size: 0.9rem; opacity: 0.6; margin-top: 2rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🔧</div>
            <h1>Under Maintenance</h1>
            <p>We're currently updating our platform.</p>
            <p>Please check back soon!</p>
            <div class="subtext">Thank you for your patience.</div>
          </div>
        </body>
        </html>`,
        {
          status: 503,
          headers: {
            'Content-Type': 'text/html',
            'Content-Security-Policy': "default-src 'self'; script-src 'none'; style-src 'unsafe-inline';",
          },
        }
      );
    }
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
  }

  const authToken = request.cookies.get('auth_token')?.value;
  let userRole: string | null = null;
  let isAuthenticated = false;
  let invalidAuthToken = false;

  if (authToken) {
    try {
      if (authToken.split('.').length !== 3) {
        invalidAuthToken = true;
      } else {
        const { payload } = await jwtVerify(authToken, JWT_SECRET);
        const userId = payload.id as number;
        
        // Check if session is still valid in database (one session per user)
        const sessionCheck = await pool.query(
          'SELECT id FROM user_sessions WHERE user_id = $1 AND expires_at > NOW()',
          [userId]
        );
        
        if (sessionCheck.rows.length === 0) {
          // Session invalid or expired
          invalidAuthToken = true;
        } else {
          userRole = payload.role as string;
          isAuthenticated = true;
        }
      }
    } catch (error) {
      console.warn('JWT verification failed:', error);
      invalidAuthToken = true;
    }
  }

  const farmerPath = pathname.startsWith('/farmer') || pathname.startsWith('/api/farmer');
  const adminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const visitorPath = pathname.startsWith('/bookings') || pathname.startsWith('/api/bookings') || pathname.startsWith('/visitor') || pathname.startsWith('/api/visitor');

  const isProtectedRoute = farmerPath || adminPath || visitorPath;

  const isAdminLogin = pathname === '/auth/login/admin';
  const isVisitorLogin = pathname === '/auth/login/visitor';
  const isFarmerLogin = pathname === '/auth/login/farmer';
  const isFarmerRegister = pathname === '/auth/register/farmer';
  const isVisitorRegister = pathname === '/auth/register/visitor';
  const isAuthPage = pathname === '/auth';

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (isAuthenticated) {
    if (farmerPath && userRole !== 'farmer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (adminPath && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (visitorPath && userRole !== 'visitor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  if ((pathname.startsWith('/auth') || isAuthPage) && isAuthenticated) {
    if (isAdminLogin || isVisitorLogin || isFarmerLogin || isFarmerRegister || isVisitorRegister || isAuthPage) {
      return NextResponse.next();
    }

    if (userRole === 'farmer') {
      return NextResponse.redirect(new URL('/farmer/dashboard', request.url));
    }
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (userRole === 'visitor') {
      return NextResponse.redirect(new URL('/marketing', request.url));
    }
  }

  const response = NextResponse.next();
  if (invalidAuthToken) {
    response.cookies.delete('auth_token');
  }
  return response;
}

export const config = {
  matcher: [
    '/farmer/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/api/:path*',
  ],
};