// src/components/auth/MFASetupForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { setupMFA, verifyMFA } from '@/lib/auth/cognito';

export default function MFASetupForm() {
  const [secretCode, setSecretCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate MFA setup
  useEffect(() => {
    const generateMFASetup = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const secret = await setupMFA();
        setSecretCode(secret);
        
        // Generate QR code URL for easy scanning
        const user = 'user@example.com'; // This should be the actual user email
        const issuer = 'DPP-Accounting-Platform';
        const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(user)}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer)}`;
        setQrCodeUrl(qrUrl);
      } catch (err: any) {
        setError(err.message || 'Failed to set up MFA. Please try again.');
        console.error('MFA setup error:', err);
      } finally {
        setLoading(false);
      }
    };

    generateMFASetup();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Please enter the verification code.');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      
      await verifyMFA(verificationCode);
      
      setSuccess('MFA has been successfully set up for your account.');
    } catch (err: any) {
      setError(err.message || 'Failed to verify MFA. Please try again.');
      console.error('MFA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-primary-blue text-center">
        Set Up Multi-Factor Authentication
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
      
      {step === 'setup' ? (
        <div className="space-y-6">
          <div className="text-center">
            <p className="mb-4 text-gray-700">
              Scan this QR code with an authenticator app like Google Authenticator or Authy.
            </p>
            
            {qrCodeUrl ? (
              <div className="flex justify-center mb-4">
                <img
                  src={qrCodeUrl}
                  alt="MFA QR Code"
                  className="border border-gray-200 rounded"
                  width={200}
                  height={200}
                />
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="w-[200px] h-[200px] border border-gray-200 rounded flex items-center justify-center bg-gray-50">
                  <span className="text-gray-400">Loading QR code...</span>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Or enter this code manually:</p>
              <div className="font-mono text-lg tracking-wide bg-gray-50 p-2 rounded border border-gray-200">
                {secretCode || 'Loading...'}
              </div>
            </div>
          </div>
          
          <div>
            <button
              onClick={() => setStep('verify')}
              disabled={!secretCode || loading}
              className="w-full bg-primary-green hover:bg-hover-green text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Next Step: Verify Code'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6">
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
              placeholder="6-digit code from your app"
              required
            />
            <p className="mt-1 text-xs text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setStep('setup')}
              className="w-1/2 bg-gray-200 hover:bg-gray-300 text-dark-blue py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Back
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-primary-green hover:bg-hover-green text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Activate MFA'}
            </button>
          </div>
        </form>
      )}
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-dark-blue mb-2">Recommended Authenticator Apps:</h3>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Google Authenticator (iOS, Android)</li>
          <li>Authy (iOS, Android, Desktop)</li>
          <li>Microsoft Authenticator (iOS, Android)</li>
          <li>1Password (iOS, Android, Desktop)</li>
        </ul>
      </div>
    </div>
  );
}