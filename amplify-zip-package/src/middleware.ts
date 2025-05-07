// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from './middleware/auth-middleware';

export function middleware(request: NextRequest) {
  // Apply authentication middleware
  return authMiddleware(request);
}

// Configure paths that require middleware
export const config = {
  matcher: [
    // Apply to all paths except static files, api routes that handle their own auth,
    // and specific public routes
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};