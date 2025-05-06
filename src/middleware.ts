// src/middleware.ts - DISABLED FOR NOW

// Export an empty middleware function that does nothing
// This effectively disables all middleware to fix the redirect loop issue
export function middleware() {
  // Intentionally returning undefined to allow all requests through
  return undefined;
}

// Empty matcher configuration means no routes will be processed
export const config = {
  matcher: [],
};