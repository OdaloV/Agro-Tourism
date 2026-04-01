// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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