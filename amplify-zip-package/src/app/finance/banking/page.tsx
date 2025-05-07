// /workspace/DPP-Project/src/app/finance/banking/page.tsx
"use client";

import { useState } from 'react';
import { BankAccountList } from '@/components/finance/bank-reconciliation';

export default function BankingPage() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'reconciliations'>('accounts');
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Banking & Reconciliation</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'accounts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Bank Accounts
            </button>
            <button
              onClick={() => setActiveTab('reconciliations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reconciliations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Reconciliations
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'accounts' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bank Accounts</h2>
            <a
              href="/finance/banking/accounts/new"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Bank Account
            </a>
          </div>
          <BankAccountList />
        </div>
      )}
      
      {activeTab === 'reconciliations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Reconciliations</h2>
          </div>
          <p className="text-gray-500">
            Select a bank account to view or start a reconciliation.
          </p>
          <BankAccountList />
        </div>
      )}
    </div>
  );
}
