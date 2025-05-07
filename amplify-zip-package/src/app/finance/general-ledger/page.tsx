// src/app/finance/general-ledger/page.tsx
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import TransactionList from '@/components/finance/general-ledger/TransactionList';

export default function GeneralLedgerPage() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get('accountId');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">General Ledger</h1>
      {accountId ? (
        <TransactionList accountId={accountId} title={`Transactions for Account ${accountId}`} />
      ) : (
        <TransactionList />
      )}
    </div>
  );
}