// src/components/finance/chart-of-accounts/AccountDetail.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { TransactionStatus } from '@/types/finance';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const { 
    selectedAccount, 
    transactions,
    accountsLoading, 
    transactionsLoading,
    accountError, 
    fetchAccountById,
    fetchTransactionsByAccount,
    currentFiscalYear,
    currentFiscalPeriod,
    fetchFiscalYears
  } = useFinanceStore();
  
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'ytd' | 'all'>('30d');

  // Load account and fiscal information
  useEffect(() => {
    if (id) {
      fetchAccountById(id);
      fetchTransactionsByAccount(id);
      fetchFiscalYears();
    }
  }, [id, fetchAccountById, fetchTransactionsByAccount, fetchFiscalYears]);

  // Handle time range change
  const handleTimeRangeChange = (range: typeof timeRange) => {
    setTimeRange(range);
  };

  const isLoading = accountsLoading || transactionsLoading;

  // Filter transactions based on time range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return transactionDate >= sevenDaysAgo;
      case '30d':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return transactionDate >= thirtyDaysAgo;
      case '90d':
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        return transactionDate >= ninetyDaysAgo;
      case 'ytd':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return transactionDate >= startOfYear;
      default:
        return true;
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate balance
  const calculateBalance = () => {
    if (!selectedAccount) return 0;
    
    const isDebitNormal = selectedAccount.normalBalance === 'DEBIT';
    
    return filteredTransactions.reduce((balance, transaction) => {
      // Only include posted transactions
      if (transaction.status !== TransactionStatus.POSTED) return balance;
      
      // Find the entry for this account
      const entry = transaction.entries.find(e => e.accountId === id);
      if (!entry) return balance;
      
      const netAmount = entry.debitAmount - entry.creditAmount;
      return isDebitNormal ? balance + netAmount : balance - netAmount;
    }, 0);
  };

  // Get account balance
  const balance = calculateBalance();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Render status badge for a transaction
  const renderStatusBadge = (status: TransactionStatus) => {
    let badgeClass = '';
    
    switch (status) {
      case TransactionStatus.DRAFT:
        badgeClass = 'bg-gray-100 text-gray-800';
        break;
      case TransactionStatus.PENDING_APPROVAL:
        badgeClass = 'bg-yellow-100 text-yellow-800';
        break;
      case TransactionStatus.APPROVED:
        badgeClass = 'bg-blue-100 text-blue-800';
        break;
      case TransactionStatus.POSTED:
        badgeClass = 'bg-green-100 text-green-800';
        break;
      case TransactionStatus.VOIDED:
        badgeClass = 'bg-red-100 text-red-800';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800';
        break;
    }
    
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>{status.replace('_', ' ')}</span>;
  };

  // Navigate back to list
  const handleBack = () => {
    router.push('/finance/chart-of-accounts');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (accountError) {
    return (
      <div className="text-warning-red py-4 text-center">
        Error loading account: {accountError}
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <div className="text-warning-red py-4 text-center">
        Account not found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={handleBack}
          className="flex items-center text-primary-blue hover:text-blue-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Accounts
        </button>
        
        <div className="flex space-x-2">
          <Link 
            href={`/finance/chart-of-accounts/${id}/edit`} 
            className="px-4 py-2 border border-primary-blue text-primary-blue rounded-md hover:bg-blue-50 text-sm"
          >
            Edit Account
          </Link>
          <Link 
            href={`/finance/general-ledger/new?accountId=${id}`} 
            className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-700 text-sm"
          >
            New Journal Entry
          </Link>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-blue flex items-center">
              {selectedAccount.accountNumber}: {selectedAccount.name}
              {!selectedAccount.isActive && (
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-warning-red bg-opacity-20 text-warning-red">
                  Inactive
                </span>
              )}
            </h1>
            <p className="text-gray-500 mt-1">{selectedAccount.description}</p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                Type: {selectedAccount.type}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                Subtype: {selectedAccount.subType.replace('_', ' ')}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Normal Balance: {selectedAccount.normalBalance}
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500 mb-1">Current Balance</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-primary-blue' : 'text-warning-red'}`}>
              {formatCurrency(balance)}
            </p>
            {currentFiscalYear && currentFiscalPeriod && (
              <p className="text-xs text-gray-400 mt-1">
                {currentFiscalYear.name} - {currentFiscalPeriod.name}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-dark-blue mb-4">Transaction History</h2>
        
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => handleTimeRangeChange('7d')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === '7d' 
                ? 'bg-primary-blue text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 Days
          </button>
          <button 
            onClick={() => handleTimeRangeChange('30d')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === '30d' 
                ? 'bg-primary-blue text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 Days
          </button>
          <button 
            onClick={() => handleTimeRangeChange('90d')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === '90d' 
                ? 'bg-primary-blue text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            90 Days
          </button>
          <button 
            onClick={() => handleTimeRangeChange('ytd')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === 'ytd' 
                ? 'bg-primary-blue text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Year to Date
          </button>
          <button 
            onClick={() => handleTimeRangeChange('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === 'all' 
                ? 'bg-primary-blue text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-gray-500 py-4 text-center">
            No transactions found for this account in the selected time range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const entry = transaction.entries.find(e => e.accountId === id);
                  if (!entry) return null;
                  
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={`/finance/general-ledger/${transaction.id}`} className="text-primary-blue hover:underline">
                          {transaction.reference || transaction.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.description || transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {renderStatusBadge(transaction.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="flex justify-center mt-4">
        <Link href={`/finance/general-ledger?accountId=${id}`} className="text-primary-blue hover:underline">
          View All Transactions for This Account
        </Link>
      </div>
    </div>
  );
}