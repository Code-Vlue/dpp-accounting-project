'use client';

// src/lib/auth/session-provider.tsx
import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';

/**
 * Next Auth Session Provider wrapper component
 */
export default function AuthSessionProvider({ children }: PropsWithChildren) {
  return <SessionProvider>{children}</SessionProvider>;
}