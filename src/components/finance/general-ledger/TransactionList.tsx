// src/components/finance/general-ledger/TransactionList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { TransactionType, TransactionStatus } from '@/types/finance';
import Link from 'next/link';
import { format } from 'date-fns';

interface TransactionListProps {
  title?: string;
  filterType?: TransactionType;
  filterStatus?: TransactionStatus;
  accountId?: string;
  maxItems?: number;
  showActions?: boolean;
}

export default function TransactionList({ 
  title = "General Ledger Transactions", 
  filterType,
  filterStatus,
  accountId,
  maxItems,
  showActions = true
}: TransactionListProps) {
  const { 
    transactions, 
    transactionsLoading, 
    transactionError, 
    fetchTransactions, 
    fetchTransactionsByAccount 
  } = useFinanceStore();
  
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | ''>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  // Load transactions on component mount
  useEffect(() => {
    if (accountId) {
      fetchTransactionsByAccount(accountId);
    } else {
      fetchTransactions();
    }
  }, [accountId, fetchTransactions, fetchTransactionsByAccount]);

  // Filter transactions based on search, type, status, and date range
  useEffect(() => {
    let filtered = [...transactions];
    
    if (filterType) {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    } else if (selectedType) {
      filtered = filtered.filter(transaction => transaction.type === selectedType);
    }
    
    if (filterStatus) {
      filtered = filtered.filter(transaction => transaction.status === filterStatus);
    } else if (selectedStatus) {
      filtered = filtered.filter(transaction => transaction.status === selectedStatus);
    }
    
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(transaction => new Date(transaction.date) >= startDate);
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(transaction => new Date(transaction.date) <= endDate);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.description?.toLowerCase().includes(term) ||
        transaction.reference?.toLowerCase().includes(term) ||
        transaction.id.toLowerCase().includes(term)
      );
    }
    
    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, selectedType, selectedStatus, dateRange, filterType, filterStatus]);

  // Get display transactions (with maxItems limit if specified)
  const displayTransactions = maxItems 
    ? filteredTransactions.slice(0, maxItems) 
    : filteredTransactions;

  // Handle form changes
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as TransactionType | '');
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value as TransactionStatus | '');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Render transaction type badge
  const renderTypeBadge = (type: TransactionType) => {
    let badgeClass = '';
    
    switch (type) {
      case TransactionType.JOURNAL_ENTRY:
        badgeClass = 'bg-blue-100 text-blue-800';
        break;
      case TransactionType.ACCOUNTS_PAYABLE:
        badgeClass = 'bg-purple-100 text-purple-800';
        break;
      case TransactionType.ACCOUNTS_RECEIVABLE:
        badgeClass = 'bg-green-100 text-green-800';
        break;
      case TransactionType.BANK_TRANSACTION:
        badgeClass = 'bg-cyan-100 text-cyan-800';
        break;
      case TransactionType.BUDGET_ADJUSTMENT:
        badgeClass = 'bg-amber-100 text-amber-800';
        break;
      case TransactionType.TUITION_CREDIT:
        badgeClass = 'bg-emerald-100 text-emerald-800';
        break;
    }
    
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
      {type.replace('_', ' ')}
    </span>;
  };

  // Render status badge
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
    }
    
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
      {status.replace('_', ' ')}
    </span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark-blue">{title}</h2>
        
        {showActions && (
          <Link href="/finance/general-ledger/new" className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-700 text-sm">
            New Journal Entry
          </Link>
        )}
      </div>
      
      {showActions && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            
            {!filterType && (
              <div>
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">All Types</option>
                  {Object.values(TransactionType).map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            )}
            
            {!filterStatus && (
              <div>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">All Statuses</option>
                  {Object.values(TransactionStatus).map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="start"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            
            <div>
              <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="end"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>
        </div>
      )}
      
      {transactionsLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary-blue border-t-transparent rounded-full"></div>
        </div>
      ) : transactionError ? (
        <div className="text-warning-red py-4 text-center">
          Error loading transactions: {transactionError}
        </div>
      ) : displayTransactions.length === 0 ? (
        <div className="text-gray-500 py-4 text-center">
          No transactions found.
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
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {showActions && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={`/finance/general-ledger/${transaction.id}`} className="text-primary-blue hover:underline">
                      {transaction.reference || transaction.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {renderTypeBadge(transaction.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {renderStatusBadge(transaction.status)}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/finance/general-ledger/${transaction.id}`} className="text-primary-blue hover:text-blue-700 mr-4">
                        View
                      </Link>
                      
                      {transaction.status === TransactionStatus.PENDING_APPROVAL && (
                        <Link href={`/finance/general-ledger/${transaction.id}/approve`} className="text-green-600 hover:text-green-800 mr-4">
                          Approve
                        </Link>
                      )}
                      
                      {transaction.status === TransactionStatus.APPROVED && (
                        <Link href={`/finance/general-ledger/${transaction.id}/post`} className="text-amber-600 hover:text-amber-800 mr-4">
                          Post
                        </Link>
                      )}
                      
                      {transaction.status === TransactionStatus.POSTED && (
                        <Link href={`/finance/general-ledger/${transaction.id}/void`} className="text-warning-red hover:text-red-800">
                          Void
                        </Link>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {maxItems && filteredTransactions.length > maxItems && (
        <div className="mt-4 text-center">
          <Link href="/finance/general-ledger" className="text-primary-blue hover:underline text-sm">
            View All Transactions
          </Link>
        </div>
      )}
    </div>
  );
}