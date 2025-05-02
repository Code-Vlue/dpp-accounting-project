// src/app/finance/accounts-receivable/layout.tsx
'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AccountsReceivableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Accounts Receivable</h1>
        <p className="text-gray-600">Manage customers, invoices, and payments</p>
      </div>

      <div className="flex border-b pb-2 overflow-x-auto">
        <Link
          href="/finance/accounts-receivable"
          className={`px-4 py-2 rounded-t-md font-medium ${
            pathname === '/finance/accounts-receivable'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/finance/accounts-receivable/customers"
          className={`px-4 py-2 rounded-t-md font-medium ${
            isLinkActive('/finance/accounts-receivable/customers')
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Customers
        </Link>
        <Link
          href="/finance/accounts-receivable/invoices"
          className={`px-4 py-2 rounded-t-md font-medium ${
            isLinkActive('/finance/accounts-receivable/invoices')
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Invoices
        </Link>
        <Link
          href="/finance/accounts-receivable/aging"
          className={`px-4 py-2 rounded-t-md font-medium ${
            pathname === '/finance/accounts-receivable/aging'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Aging Report
        </Link>
        <Link
          href="/finance/accounts-receivable/recurring"
          className={`px-4 py-2 rounded-t-md font-medium ${
            pathname === '/finance/accounts-receivable/recurring'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Recurring Invoices
        </Link>
      </div>

      <div className="bg-white rounded-md shadow p-6">
        {children}
      </div>
    </div>
  );
}