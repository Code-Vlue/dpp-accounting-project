// src/app/auth/verify/page.tsx
import { Metadata } from 'next';
import VerifyForm from '@/components/auth/verify-form';

export const metadata: Metadata = {
  title: 'Verify Email | DPP Accounting Platform',
  description: 'Verify your email for the DPP Accounting Platform',
};

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <VerifyForm />
      </div>
    </div>
  );
}