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
  
  // ========== ADD MAINTENANCE MODE CHECK HERE ==========
  // Check if maintenance mode is enabled
  try {
    const result = await pool.query(
      "SELECT value FROM platform_settings WHERE key = 'maintenance_mode'"
    );
    const maintenanceMode = result.rows[0]?.value === 'true';
    
    // Allow admin to access even during maintenance
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
    const isLoginRoute = pathname === '/auth/login/admin';
    
    if (maintenanceMode && !isAdminRoute && !isLoginRoute) {
      // Return maintenance page
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Under Maintenance</title>
          <style>
            body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #065f46, #047857); color: white; text-align: center; }
            .container { padding: 2rem; }
            h1 { font-size: 3rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; opacity: 0.9; }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🚜</div>
            <h1>Under Maintenance</h1>
            <p>We're currently updating our platform. Please check back soon!</p>
            <p style="font-size: 0.9rem; margin-top: 2rem;">Thank you for your patience.</p>
          </div>
        </body>
        </html>`,
        { status: 503, headers: { 'Content-Type': 'text/html' } }
      );
    }
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // Continue normally if database query fails
  }
  // ====================================================
  
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
    // ALWAYS allow access to specific login pages regardless of role
    // This allows users to switch between roles
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
  ],
};