// src/app/auth/forgot-password/page.tsx
import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password | DPP Accounting Platform',
  description: 'Reset your DPP Accounting Platform password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}