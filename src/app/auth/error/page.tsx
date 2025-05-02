// src/app/auth/error/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    
    if (errorParam) {
      const errorMessages: { [key: string]: string } = {
        default: 'An authentication error occurred.',
        configuration: 'There is a problem with the server configuration.',
        accessdenied: 'Access denied. You do not have permission to access this resource.',
        verification: 'Email verification is required before signing in.',
        signin: 'Sign in failed. Please try again with the correct credentials.',
        oauthsignin: 'Error signing in with OAuth provider.',
        oauthcallback: 'Error processing OAuth callback.',
        oauthcreateaccount: 'Error creating account with OAuth provider.',
        callback: 'Error processing authentication callback.',
        accountexists: 'An account already exists with a different provider.',
        emailcreate: 'Error creating email account.',
        sessionrequired: 'Authentication session is required.',
        unauthorized: 'You are not authorized to access this resource.',
      };

      setError(errorMessages[errorParam] || errorMessages.default);
    } else {
      setError('An unknown authentication error occurred.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <svg 
            className="mx-auto h-16 w-16 text-warning-red" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          
          <h1 className="mt-4 text-2xl font-bold text-dark-blue">
            Authentication Error
          </h1>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-gray-700">{error}</p>
        </div>
        
        <div className="space-y-4">
          <Link href="/auth/signin" className="block w-full text-center bg-primary-blue hover:bg-accent-blue text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue">
            Return to Sign In
          </Link>
          
          <Link href="/" className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-dark-blue py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
            Go to Home Page
          </Link>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            If you continue to experience issues, please contact an administrator.
          </p>
        </div>
      </div>
    </div>
  );
}