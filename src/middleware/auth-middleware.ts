// src/middleware/auth-middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/lib/auth/types';

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/signout',
  '/auth/error',
  '/auth/forgot-password',
  '/auth/login',
  '/auth/reset-password',
  '/auth/signup',
  '/auth/verify',
  '/auth/mfa',
  '/auth/profile',
  '/auth',
  '/amplify-test.html',
  '/api/auth',
];

// Define role-based path restrictions
const roleBasedPaths: Record<string, UserRole[]> = {
  '/admin': [UserRole.ADMINISTRATOR],
  '/dashboard': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.PROVIDER, UserRole.READONLY],
  '/chart-of-accounts': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.READONLY],
  '/general-ledger': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.READONLY],
  '/accounts-payable': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.READONLY],
  '/accounts-receivable': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.READONLY],
  '/budgeting': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.READONLY],
  '/fund-accounting': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.READONLY],
  '/tuition-credits': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.PROVIDER, UserRole.READONLY],
  '/providers': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.PROVIDER, UserRole.READONLY],
  '/financial-reports': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.READONLY],
  '/bank-reconciliation': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT, UserRole.READONLY],
  '/data-import-export': [UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT],
  '/user-management': [UserRole.ADMINISTRATOR],
};

/**
 * Check if a path is public or requires authentication
 */
function isPublicPath(path: string): boolean {
  // Check exact path matches
  if (publicPaths.includes(path)) return true;
  
  // Check path prefixes
  if (path.startsWith('/_next') || 
      path.startsWith('/favicon.ico') || 
      path.startsWith('/api/auth/') ||
      path.startsWith('/auth/')) return true;
      
  return false;
}

/**
 * Check if a user has access to a specific path based on their role
 */
function hasRoleBasedAccess(path: string, userRole: string): boolean {
  if (userRole === UserRole.ADMINISTRATOR) return true;
  
  const matchingPath = Object.keys(roleBasedPaths)
    .filter(pattern => path.startsWith(pattern))
    .sort((a, b) => b.length - a.length)[0];
  
  if (!matchingPath) return false;
  
  return roleBasedPaths[matchingPath].includes(userRole as UserRole);
}

/**
 * Authentication middleware
 */
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(signInUrl);
  }
  
  const userRole = token.role as string || UserRole.READONLY;
  
  if (!hasRoleBasedAccess(pathname, userRole)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}
