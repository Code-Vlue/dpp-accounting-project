// src/app/finance/accounts-payable/layout.tsx
'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AccountsPayableLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  // Unused function prefixed with underscore
  const _isActive = (path: string) => {
    return pathname?.startsWith(path) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50';
  };
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="sm:-my-px sm:flex space-x-8">
                <Link 
                  href="/finance/accounts-payable"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/finance/accounts-payable' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/finance/accounts-payable/vendors"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname?.startsWith('/finance/accounts-payable/vendors') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Vendors
                </Link>
                <Link 
                  href="/finance/accounts-payable/bills"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname?.startsWith('/finance/accounts-payable/bills') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bills
                </Link>
                <Link 
                  href="/finance/accounts-payable/recurring-bills"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname?.startsWith('/finance/accounts-payable/recurring-bills') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Recurring Bills
                </Link>
                <Link 
                  href="/finance/accounts-payable/reports"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname?.startsWith('/finance/accounts-payable/reports') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}