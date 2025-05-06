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
    // Apply to all paths EXCEPT:
    // 1. Static files and assets
    // 2. API routes
    // 3. Authentication routes
    // 4. Root path
    '/((?!_next/static|_next/image|favicon.ico|api|auth|amplify-test.html|_redirects).*)',
  ],
};