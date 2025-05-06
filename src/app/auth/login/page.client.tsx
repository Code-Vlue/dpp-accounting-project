// src/app/auth/login/page.client.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';

/**
 * Client-side wrapper for login page.
 * This allows us to handle client-side logic without SSR interference.
 */
export function LoginClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Simple loading effect to ensure client-side hydration
  useEffect(() => {
    // Set a short timeout to ensure the page has hydrated
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    // Cleanup the timer
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
          <p className="text-sm text-gray-500">Please wait while we prepare your login</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginClient;