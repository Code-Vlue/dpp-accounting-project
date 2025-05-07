'use client';

// src/app/auth/layout.tsx
import React from 'react';
import { AuthProvider } from '@/components/auth/auth-provider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </AuthProvider>
  );
}
