// src/app/auth/reset-password/page.tsx
import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password | DPP Accounting Platform',
  description: 'Create a new password for your DPP Accounting Platform account',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}