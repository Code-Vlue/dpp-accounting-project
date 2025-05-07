// src/app/auth/mfa/page.tsx
import { Metadata } from 'next';
import MFASetupForm from '@/components/auth/MFASetupForm';

export const metadata: Metadata = {
  title: 'Set Up MFA | DPP Accounting Platform',
  description: 'Set up multi-factor authentication for your DPP Accounting Platform account',
};

export default function MFASetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-blue mb-2">
            Multi-Factor Authentication
          </h1>
          <p className="text-gray-600">
            Add an extra layer of security to your account
          </p>
        </div>
        
        <MFASetupForm />
      </div>
    </div>
  );
}