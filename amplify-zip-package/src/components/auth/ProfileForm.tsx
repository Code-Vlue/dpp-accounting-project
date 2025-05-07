// src/components/auth/ProfileForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { changePassword, getUserAttributes } from '@/lib/auth/cognito';
import { CognitoUserAttributes, UserSession } from '@/lib/auth/types';

export default function ProfileForm() {
  const { data: session } = useSession();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  useEffect(() => {
    // Pre-populate form with user data from session
    if (session?.user) {
      // Cast the session to our custom UserSession type
      const userSession = session as unknown as UserSession;
      
      // Now we can safely access the custom properties
      setFirstName(userSession.user.firstName ?? '');
      setLastName(userSession.user.lastName ?? '');
      setOrganization(userSession.user.organization ?? '');
    }

    // Fetch additional user attributes from Cognito
    const fetchUserAttributes = async () => {
      try {
        const attributes = await getUserAttributes();
        updateFormFromAttributes(attributes);
      } catch (err) {
        console.error('Failed to fetch user attributes:', err);
      }
    };

    fetchUserAttributes();
  }, [session]);

  const updateFormFromAttributes = (attributes: CognitoUserAttributes) => {
    if (attributes.given_name) {
      setFirstName(attributes.given_name);
    }
    
    if (attributes.family_name) {
      setLastName(attributes.family_name);
    }
    
    if (attributes['custom:organization']) {
      setOrganization(attributes['custom:organization']);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    // Profile update logic would go here
    // Currently, profile updates are not implemented in this version
    
    setMessage({
      type: 'success',
      text: 'Profile information updated. Note: Profile updates are currently managed by administrators.',
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage({
        type: 'error',
        text: 'Please fill in all password fields',
      });
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match',
      });
      return;
    }
    
    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      
      setMessage({
        type: 'success',
        text: 'Password changed successfully',
      });
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to change password. Please try again.',
      });
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-3 text-sm font-medium ${
            activeTab === 'profile'
              ? 'border-b-2 border-primary-blue text-primary-blue'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium ${
            activeTab === 'password'
              ? 'border-b-2 border-primary-blue text-primary-blue'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
      </div>
      
      <div className="p-6">
        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-success-green'
                : 'bg-red-50 border border-red-200 text-warning-red'
            }`}
          >
            {message.text}
          </div>
        )}
        
        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-dark-blue mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  readOnly
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-dark-blue mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  readOnly
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-blue mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={session?.user?.email || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue bg-gray-50"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
            </div>
            
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-dark-blue mb-1">
                Organization
              </label>
              <input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                readOnly
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-dark-blue mb-1">
                Role
              </label>
              <input
                id="role"
                type="text"
                value={(session as unknown as UserSession)?.user?.role ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue bg-gray-50"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">Role can only be changed by administrators.</p>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="bg-primary-blue hover:bg-accent-blue text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
              >
                Save Profile Information
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Note: Profile changes require administrator approval.
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-dark-blue mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
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
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.
              </p>
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
                required
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-green hover:bg-hover-green text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:opacity-50"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}