// src/app/finance/layout.tsx
'use client';

import React from 'react';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  // Set active tab based on URL
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/chart-of-accounts')) {
      setActiveTab('chart-of-accounts');
    } else if (pathname.includes('/general-ledger')) {
      setActiveTab('general-ledger');
    } else if (pathname.includes('/accounts-payable')) {
      setActiveTab('accounts-payable');
    } else if (pathname.includes('/accounts-receivable')) {
      setActiveTab('accounts-receivable');
    } else if (pathname.includes('/budgeting')) {
      setActiveTab('budgeting');
    } else if (pathname.includes('/fund-accounting')) {
      setActiveTab('fund-accounting');
    } else if (pathname.includes('/tuition-credits')) {
      setActiveTab('tuition-credits');
    } else if (pathname.includes('/reports')) {
      setActiveTab('reports');
    } else {
      setActiveTab('');
    }
  }, []);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-blue border-t-transparent rounded-full mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-dark-blue">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-dark-blue">Finance</h1>
              <span className="ml-4 text-gray-500">
                {user?.firstName || user?.name || 'User'}
              </span>
            </div>

            <div className="flex space-x-4 mt-4 sm:mt-0">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-primary-blue font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/auth/signout"
                className="text-gray-600 hover:text-warning-red font-medium"
              >
                Sign Out
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <nav className="flex overflow-x-auto py-2 px-4 sm:px-6 lg:px-8">
              <Link
                href="/finance/chart-of-accounts"
                className={`mr-8 py-2 px-1 font-medium text-sm ${
                  activeTab === 'chart-of-accounts'
                    ? 'text-primary-blue border-b-2 border-primary-blue'
                    : 'text-gray-500 hover:text-primary-blue'
                }`}
                onClick={() => handleTabChange('chart-of-accounts')}
              >
                Chart of Accounts
              </Link>
              <Link
                href="/finance/general-ledger"
                className={`mr-8 py-2 px-1 font-medium text-sm ${
                  activeTab === 'general-ledger'
                    ? 'text-primary-blue border-b-2 border-primary-blue'
                    : 'text-gray-500 hover:text-primary-blue'
                }`}
                onClick={() => handleTabChange('general-ledger')}
              >
                General Ledger
              </Link>
              <Link
                href="/finance/accounts-payable"
                className={`mr-8 py-2 px-1 font-medium text-sm ${
                  activeTab === 'accounts-payable'
                    ? 'text-primary-blue border-b-2 border-primary-blue'
                    : 'text-gray-500 hover:text-primary-blue'
                }`}
                onClick={() => handleTabChange('accounts-payable')}
              >
                Accounts Payable
              </Link>
              <Link
                href="/finance/accounts-receivable"
                className={`mr-8 py-2 px-1 font-medium text-sm ${
                  activeTab === 'accounts-receivable'
                    ? 'text-primary-blue border-b-2 border-primary-blue'
                    : 'text-gray-500 hover:text-primary-blue'
                }`}
                onClick={() => handleTabChange('accounts-receivable')}
              >
                Accounts Receivable
              </Link>
              <Link
                href="/finance/budgeting"
                className={`mr-8 py-2 px-1 font-medium text-sm ${
                  activeTab === 'budgeting'
                    ? 'text-primary-blue border-b-2 border-primary-blue'
                    : 'text-gray-500 hover:text-primary-blue'
                }`}
                onClick={() => handleTabChange('budgeting')}
              >
                Budgeting
              </Link>
              <Link
                href="/finance/fund-accounting"
                className={`mr-8 py-2 px-1 font-medium text-sm ${
                  activeTab === 'fund-accounting'
                    ? 'text-primary-blue border-b-2 border-primary-blue'
                    : 'text-gray-500 hover:text-primary-blue'
                }`}
                onClick={() => handleTabChange('fund-accounting')}
              >
                Fund Accounting
              </Link>
              <Link
                href="/finance/tuition-credits"
                className={`mr-8 py-2 px-1 font-medium text-sm ${
                  activeTab === 'tuition-credits'
                    ? 'text-primary-blue border-b-2 border-primary-blue'
                    : 'text-gray-500 hover:text-primary-blue'
                }`}
                onClick={() => handleTabChange('tuition-credits')}
              >
                Tuition Credits
              </Link>
              <Link
                href="/finance/reports"
                className={`mr-8 py-2 px-1 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'text-primary-blue border-b-2 border-primary-blue'
                    : 'text-gray-500 hover:text-primary-blue'
                }`}
                onClick={() => handleTabChange('reports')}
              >
                Reports
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}