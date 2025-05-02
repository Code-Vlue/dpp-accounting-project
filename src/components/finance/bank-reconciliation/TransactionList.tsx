// src/components/finance/bank-reconciliation/TransactionList.tsx
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { BankTransaction, BankAccount, TransactionMatchStatus } from '@/types/finance';
import { financeService } from '@/lib/finance/finance-service';

interface TransactionListProps {
  bankAccountId: string;
  isReconciliation?: boolean;
  reconciliationId?: string;
  onSelectTransaction?: (transaction: BankTransaction) => void;
}

export default function TransactionList({ 
  bankAccountId,
  isReconciliation = false,
  reconciliationId,
  onSelectTransaction 
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    startDate?: string;
    endDate?: string;
    type?: 'CREDIT' | 'DEBIT';
    matchStatus?: TransactionMatchStatus;
    search?: string;
  }>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch bank account details
        const account = await financeService.getBankAccountById(bankAccountId);
        setBankAccount(account);
        
        // Fetch transactions based on filters
        let allTransactions: BankTransaction[];
        
        if (isReconciliation && reconciliationId) {
          allTransactions = await financeService.getReconciliationTransactions(reconciliationId);
        } else {
          allTransactions = await financeService.getBankTransactionsByAccount(bankAccountId);
        }
        
        // Apply filters
        let filteredTransactions = [...allTransactions];
        
        if (filter.startDate) {
          const startDate = new Date(filter.startDate);
          filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startDate);
        }
        
        if (filter.endDate) {
          const endDate = new Date(filter.endDate);
          filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= endDate);
        }
        
        if (filter.type) {
          filteredTransactions = filteredTransactions.filter(t => t.type === filter.type);
        }
        
        if (filter.matchStatus) {
          filteredTransactions = filteredTransactions.filter(t => t.matchStatus === filter.matchStatus);
        }
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredTransactions = filteredTransactions.filter(t => 
            t.description.toLowerCase().includes(searchLower) ||
            (t.reference && t.reference.toLowerCase().includes(searchLower)) ||
            (t.checkNumber && t.checkNumber.toLowerCase().includes(searchLower))
          );
        }
        
        // Sort the transactions
        filteredTransactions.sort((a, b) => {
          const aValue = a[sortConfig.key as keyof BankTransaction];
          const bValue = b[sortConfig.key as keyof BankTransaction];
          
          if (sortConfig.key === 'date') {
            return sortConfig.direction === 'asc' 
              ? new Date(a.date).getTime() - new Date(b.date).getTime() 
              : new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          
          if (sortConfig.key === 'amount') {
            return sortConfig.direction === 'asc' 
              ? a.amount - b.amount 
              : b.amount - a.amount;
          }
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'asc' 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          }
          
          return 0;
        });
        
        setTransactions(filteredTransactions);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [bankAccountId, isReconciliation, reconciliationId, filter, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleTransactionSelect = (transaction: BankTransaction) => {
    if (onSelectTransaction) {
      onSelectTransaction(transaction);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilter({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: TransactionMatchStatus) => {
    switch (status) {
      case TransactionMatchStatus.MATCHED:
      case TransactionMatchStatus.MANUALLY_MATCHED:
        return 'bg-green-100 text-green-800';
      case TransactionMatchStatus.UNMATCHED:
        return 'bg-red-100 text-red-800';
      case TransactionMatchStatus.NEEDS_REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionMatchStatus.EXCLUDED:
        return 'bg-gray-100 text-gray-800';
      case TransactionMatchStatus.ADDED_MANUALLY:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {isReconciliation ? 'Reconciliation Transactions' : 'Bank Transactions'}
        </h2>
        <div className="text-sm text-gray-500">
          {bankAccount?.name} - {transactions.length} transactions found
        </div>
        
        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filter.startDate || ''}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-xs font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filter.endDate || ''}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-xs font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={filter.type || ''}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="CREDIT">Credits</option>
              <option value="DEBIT">Debits</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="matchStatus" className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="matchStatus"
              name="matchStatus"
              value={filter.matchStatus || ''}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All</option>
              <option value={TransactionMatchStatus.MATCHED}>Matched</option>
              <option value={TransactionMatchStatus.MANUALLY_MATCHED}>Manually Matched</option>
              <option value={TransactionMatchStatus.UNMATCHED}>Unmatched</option>
              <option value={TransactionMatchStatus.NEEDS_REVIEW}>Needs Review</option>
              <option value={TransactionMatchStatus.EXCLUDED}>Excluded</option>
              <option value={TransactionMatchStatus.ADDED_MANUALLY}>Added Manually</option>
            </select>
          </div>
        </div>
        
        <div className="mt-3 flex items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search description, reference or check number..."
              name="search"
              value={filter.search || ''}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <button
            onClick={clearFilters}
            className="ml-3 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200"
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No transactions found matching the selected criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'date' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center">
                    Description
                    {sortConfig.key === 'description' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('reference')}
                >
                  <div className="flex items-center">
                    Reference
                    {sortConfig.key === 'reference' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    Amount
                    {sortConfig.key === 'amount' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {!isReconciliation && (
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className={`hover:bg-gray-50 cursor-pointer ${
                    onSelectTransaction ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleTransactionSelect(transaction)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.reference || (transaction.checkNumber ? `Check #${transaction.checkNumber}` : '-')}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(transaction.matchStatus)}`}>
                      {transaction.matchStatus.replace('_', ' ')}
                    </span>
                  </td>
                  {!isReconciliation && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTransactionSelect(transaction);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}