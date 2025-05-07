'use client';

// src/components/auth/auth-provider.tsx
import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';
import { AuthProvider as CustomAuthProvider } from '@/lib/auth/auth-context';

/**
 * Combined Auth Provider component that wraps NextAuth SessionProvider
 * and our custom AuthProvider for role-based permissions
 */
export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <CustomAuthProvider>
        {children}
      </CustomAuthProvider>
    </SessionProvider>
  );
}
