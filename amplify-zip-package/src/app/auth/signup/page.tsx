// src/app/auth/signup/page.tsx
import { Metadata } from 'next';
import SignupForm from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Sign Up | DPP Accounting Platform',
  description: 'Create a new account on the DPP Accounting Platform',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <SignupForm />
      </div>
    </div>
  );
}