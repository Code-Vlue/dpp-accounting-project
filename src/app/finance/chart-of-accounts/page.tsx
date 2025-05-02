// src/app/finance/chart-of-accounts/page.tsx
'use client';

import React from 'react';
import AccountList from '@/components/finance/chart-of-accounts/AccountList';

export default function ChartOfAccountsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Chart of Accounts</h1>
      <AccountList />
    </div>
  );
}