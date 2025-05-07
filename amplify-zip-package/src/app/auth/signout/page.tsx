// src/app/auth/signout/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut({ redirect: false });
        
        // Redirect to home page after successful sign out
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (err) {
        setError('An error occurred during sign out. Please try again.');
        setIsSigningOut(false);
        console.error('Sign out error:', err);
      }
    };

    performSignOut();
  }, [router]);

  const handleManualSignOut = async () => {
    setIsSigningOut(true);
    setError(null);
    
    try {
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (err) {
      setError('An error occurred during sign out. Please try again.');
      setIsSigningOut(false);
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        {isSigningOut ? (
          <>
            <svg 
              className="animate-spin mx-auto h-12 w-12 text-primary-blue" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            
            <h1 className="mt-6 text-2xl font-bold text-dark-blue">
              Signing Out...
            </h1>
            
            <p className="mt-2 text-gray-600">
              Please wait while we securely sign you out.
            </p>
          </>
        ) : (
          <>
            {error ? (
              <>
                <svg 
                  className="mx-auto h-12 w-12 text-warning-red" 
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
                
                <h1 className="mt-6 text-2xl font-bold text-dark-blue">
                  Sign Out Error
                </h1>
                
                <p className="mt-2 text-gray-600">
                  {error}
                </p>
                
                <button
                  onClick={handleManualSignOut}
                  className="mt-6 w-full bg-primary-green hover:bg-hover-green text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green"
                >
                  Try Again
                </button>
              </>
            ) : (
              <>
                <svg 
                  className="mx-auto h-12 w-12 text-success-green" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                
                <h1 className="mt-6 text-2xl font-bold text-dark-blue">
                  You Have Been Signed Out
                </h1>
                
                <p className="mt-2 text-gray-600">
                  Thank you for using the DPP Accounting Platform.
                </p>
                
                <a
                  href="/auth/signin"
                  className="mt-6 block w-full bg-primary-blue hover:bg-accent-blue text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
                >
                  Sign In Again
                </a>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}