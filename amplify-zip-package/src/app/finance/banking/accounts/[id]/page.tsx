// /workspace/DPP-Project/src/app/finance/banking/accounts/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { BankAccountDetail } from '@/components/finance/bank-reconciliation';
import { BankAccount } from '@/types/finance';

interface BankAccountDetailPageProps {
  params: {
    id: string;
  };
}

export default function BankAccountDetailPage({ params }: BankAccountDetailPageProps) {
  const router = useRouter();
  const { getBankAccount } = useFinanceStore();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const accountData = await getBankAccount(params.id);
        setAccount(accountData);
      } catch (err) {
        setError('Failed to load bank account');
        console.error('Error loading bank account:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAccount();
  }, [params.id, getBankAccount]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }
  
  if (error || !account) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="p-4 bg-red-50 text-red-700 rounded mb-4">
          {error || 'Bank account not found'}
        </div>
        <button
          onClick={() => router.push('/finance/banking/accounts')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Accounts
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {account.name}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/finance/banking/accounts/${params.id}/edit`)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
          >
            Edit Account
          </button>
          <button
            onClick={() => router.push(`/finance/banking/accounts/${params.id}/import`)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Import Transactions
          </button>
          <button
            onClick={() => router.push(`/finance/banking/accounts/${params.id}/reconcile`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reconcile Account
          </button>
        </div>
      </div>
      
      <BankAccountDetail bankAccountId={params.id} />
    </div>
  );
}
