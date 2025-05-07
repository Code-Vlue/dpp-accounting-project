// src/app/layout.tsx
import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
// Unused import prefixed with underscore
import { AuthProvider as _AuthProvider } from '@/components/auth/auth-provider';

export const metadata: Metadata = {
  title: 'DPP Accounting Platform',
  description: 'Comprehensive financial management system for the Denver Preschool Program',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* 
          Note: We use AuthProvider in both root layout and auth layout
          because layouts are server components by default, but AuthProvider
          is a client component. The AuthProvider in the auth layout is for
          auth-specific pages.
        */}
        {children}
      </body>
    </html>
  );
}