// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import pool from '@/lib/db';

// Protected routes that require authentication
const protectedRoutes = [
  '/farmer/dashboard',
  '/farmer/verification',
  '/farmer/profile',
  '/farmer/activities',
  '/farmer/calendar',
  '/farmer/settings',
  '/admin/dashboard',
  '/admin/verifications',
];

// Auth routes
const authRoutes = [
  '/auth/login',
  '/auth/register',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if maintenance mode is enabled
  try {
    const result = await pool.query(
      "SELECT value FROM platform_settings WHERE key = 'maintenance_mode'"
    );
    const maintenanceMode = result.rows[0]?.value === 'true';
    
    // Allow admin routes during maintenance
    const isAdminRoute = pathname.startsWith('/admin') || 
                         pathname.startsWith('/api/admin') ||
                         pathname === '/auth/login/admin';
    
    // Allow login pages during maintenance
    const isLoginRoute = pathname === '/auth/login/admin' ||
                         pathname === '/auth/login/farmer' ||
                         pathname === '/auth/login/visitor';
    
    // Allow settings API during maintenance (so admins can turn it off)
    const isSettingsApi = pathname.startsWith('/api/settings');
    
    if (maintenanceMode && !isAdminRoute && !isLoginRoute && !isSettingsApi) {
      // Return maintenance page
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
        { status: 503, headers: { 'Content-Type': 'text/html' } }
      );
    }
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
  }
  
  // Get auth from cookie
  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  
  const isAuthenticated = !!authToken;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if it's a specific login/register page
  const isAdminLogin = pathname === '/auth/login/admin';
  const isVisitorLogin = pathname === '/auth/login/visitor';
  const isFarmerLogin = pathname === '/auth/login/farmer';
  const isFarmerRegister = pathname === '/auth/register/farmer';
  const isVisitorRegister = pathname === '/auth/register/visitor';
  const isAuthPage = pathname === '/auth';
  
  // Check if it's any auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // Handle auth pages
  if (isAuthRoute && isAuthenticated) {
    // Always allow access to specific login pages regardless of role
    if (isAdminLogin) {
      return NextResponse.next();
    }
    if (isVisitorLogin) {
      return NextResponse.next();
    }
    if (isFarmerLogin) {
      return NextResponse.next();
    }
    // Allow registration pages
    if (isFarmerRegister) {
      return NextResponse.next();
    }
    if (isVisitorRegister) {
      return NextResponse.next();
    }
    // Allow main auth page
    if (isAuthPage) {
      return NextResponse.next();
    }
    
    // For any other auth routes, redirect to their dashboard
    if (userRole === 'farmer') {
      return NextResponse.redirect(new URL('/farmer/dashboard', request.url));
    } else if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (userRole === 'visitor') {
      return NextResponse.redirect(new URL('/marketing', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/farmer/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/api/:path*',
  ],
};