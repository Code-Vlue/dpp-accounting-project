// src/app/auth/signin/page.tsx
import { Metadata } from 'next';
import SignInForm from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In | DPP Accounting Platform',
  description: 'Sign in to your DPP Accounting Platform account',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-blue mb-2">
            DPP Accounting Platform
          </h1>
          <p className="text-gray-600">
            Comprehensive financial management for the Denver Preschool Program
          </p>
        </div>
        
        <SignInForm />
      </div>
    </div>
  );
}