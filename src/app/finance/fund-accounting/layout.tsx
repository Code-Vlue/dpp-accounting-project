// src/app/finance/fund-accounting/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const FundAccountingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto">
            <nav className="flex" aria-label="Tabs">
              <Link
                href="/finance/fund-accounting"
                className={`px-3 py-2 text-sm font-medium ${pathname === '/finance/fund-accounting' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'}`}
              >
                Dashboard
              </Link>
              <Link
                href="/finance/fund-accounting/transfers"
                className={`px-3 py-2 text-sm font-medium ${pathname === '/finance/fund-accounting/transfers' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'}`}
              >
                Transfers
              </Link>
              <Link
                href="/finance/fund-accounting/allocations"
                className={`px-3 py-2 text-sm font-medium ${pathname === '/finance/fund-accounting/allocations' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'}`}
              >
                Allocations
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};

export default FundAccountingLayout;