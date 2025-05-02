// src/components/auth/ForgotPasswordForm.tsx
'use client';

import React, { useState } from 'react';
import { forgotPassword, confirmPassword } from '@/lib/auth/cognito';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      
      await forgotPassword(email);
      
      setSuccess('Verification code has been sent to your email.');
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset. Please try again.');
      console.error('Password reset request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || !newPassword || !confirmNewPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      
      await confirmPassword(email, verificationCode, newPassword);
      
      setSuccess('Password has been reset successfully. You can now sign in with your new password.');
      
      // Clear form after successful reset
      setVerificationCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
      console.error('Password reset verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-primary-blue text-center">
        Reset Your Password
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-warning-red rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-success-green rounded">
          {success}
        </div>
      )}
      
      {step === 'request' ? (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-blue mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-green hover:bg-hover-green text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndReset} className="space-y-4">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-dark-blue mb-1">
              Verification Code
            </label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="Enter code from your email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-dark-blue mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-dark-blue mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-1/2 bg-gray-200 hover:bg-gray-300 text-dark-blue py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Back
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-primary-green hover:bg-hover-green text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <a href="/auth/signin" className="text-accent-blue hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}