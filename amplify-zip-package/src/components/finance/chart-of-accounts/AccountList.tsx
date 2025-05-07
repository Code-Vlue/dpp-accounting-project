// src/components/finance/chart-of-accounts/AccountList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { AccountType, ChartOfAccount } from '@/types/finance';
import Link from 'next/link';

interface AccountListProps {
  title?: string;
  filterType?: AccountType;
  maxItems?: number;
  showActions?: boolean;
}

export default function AccountList({ 
  title = "Chart of Accounts", 
  filterType,
  maxItems,
  showActions = true
}: AccountListProps) {
  const { 
    accounts, 
    accountsLoading, 
    accountError, 
    fetchAccounts, 
    fetchAccountsByType
  } = useFinanceStore();
  
  const [filteredAccounts, setFilteredAccounts] = useState<ChartOfAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<AccountType | ''>('');

  // Load accounts on component mount
  useEffect(() => {
    if (filterType) {
      fetchAccountsByType(filterType);
    } else {
      fetchAccounts();
    }
  }, [filterType, fetchAccounts, fetchAccountsByType]);

  // Filter accounts based on search term and type
  useEffect(() => {
    let filtered = [...accounts];
    
    if (filterType) {
      filtered = filtered.filter(account => account.type === filterType);
    } else if (selectedType) {
      filtered = filtered.filter(account => account.type === selectedType);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(account => 
        account.name.toLowerCase().includes(term) ||
        account.accountNumber.toLowerCase().includes(term) ||
        account.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredAccounts(filtered);
  }, [accounts, searchTerm, selectedType, filterType]);

  // Get display accounts (with maxItems limit if specified)
  const displayAccounts = maxItems 
    ? filteredAccounts.slice(0, maxItems) 
    : filteredAccounts;

  // Handle account type change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AccountType | '';
    setSelectedType(value);
  };

  // Render account status badge
  const renderStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-green bg-opacity-20 text-success-green">Active</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-red bg-opacity-20 text-warning-red">Inactive</span>;
  };

  // Render account type badge
  const renderTypeBadge = (type: AccountType) => {
    let badgeClass = '';
    
    switch (type) {
      case AccountType.ASSET:
        badgeClass = 'bg-blue-100 text-blue-800';
        break;
      case AccountType.LIABILITY:
        badgeClass = 'bg-purple-100 text-purple-800';
        break;
      case AccountType.EQUITY:
        badgeClass = 'bg-green-100 text-green-800';
        break;
      case AccountType.REVENUE:
        badgeClass = 'bg-emerald-100 text-emerald-800';
        break;
      case AccountType.EXPENSE:
        badgeClass = 'bg-red-100 text-red-800';
        break;
    }
    
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>{type}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark-blue">{title}</h2>
        
        {showActions && !filterType && (
          <Link href="/finance/chart-of-accounts/new" className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-700 text-sm">
            Add New Account
          </Link>
        )}
      </div>
      
      {showActions && (
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search accounts..."
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
                {Object.values(AccountType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      
      {accountsLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary-blue border-t-transparent rounded-full"></div>
        </div>
      ) : accountError ? (
        <div className="text-warning-red py-4 text-center">
          Error loading accounts: {accountError}
        </div>
      ) : displayAccounts.length === 0 ? (
        <div className="text-gray-500 py-4 text-center">
          No accounts found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
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
              {displayAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {account.accountNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link href={`/finance/chart-of-accounts/${account.id}`} className="text-primary-blue hover:underline">
                      {account.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">{account.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {renderTypeBadge(account.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {renderStatusBadge(account.isActive)}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/finance/chart-of-accounts/${account.id}`} className="text-primary-blue hover:text-blue-700 mr-4">
                        View
                      </Link>
                      <Link href={`/finance/chart-of-accounts/${account.id}/edit`} className="text-primary-blue hover:text-blue-700">
                        Edit
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {maxItems && filteredAccounts.length > maxItems && (
        <div className="mt-4 text-center">
          <Link href="/finance/chart-of-accounts" className="text-primary-blue hover:underline text-sm">
            View All Accounts
          </Link>
        </div>
      )}
    </div>
  );
}