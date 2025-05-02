// /workspace/DPP-Project/src/app/finance/banking/accounts/page.tsx
"use client";

import { BankAccountList } from '@/components/finance/bank-reconciliation';

export default function BankAccountsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Bank Accounts</h1>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Bank Accounts</h2>
        <a
          href="/finance/banking/accounts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Bank Account
        </a>
      </div>
      
      <BankAccountList />
    </div>
  );
}
