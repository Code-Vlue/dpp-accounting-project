// src/components/finance/bank-reconciliation/BankAccountList.tsx
'use client';

import { useState, useEffect } from 'react';
import { BankAccount, BankAccountType, BankAccountStatus } from '@/types/finance';
import { financeService } from '@/lib/finance/finance-service';
import Link from 'next/link';

interface BankAccountListProps {
  onSelect?: (account: BankAccount) => void;
  showControls?: boolean;
}

export default function BankAccountList({ onSelect, showControls = true }: BankAccountListProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    type?: BankAccountType;
    status?: BankAccountStatus;
  }>({});

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setLoading(true);
        let accountsData: BankAccount[] = [];

        if (filter.type) {
          accountsData = await financeService.getBankAccountsByType(filter.type);
        } else if (filter.status) {
          accountsData = await financeService.getBankAccountsByStatus(filter.status);
        } else {
          accountsData = await financeService.getAllBankAccounts();
        }

        setAccounts(accountsData);
        setError(null);
      } catch (err) {
        setError('Failed to load bank accounts. Please try again.');
        console.error('Error fetching bank accounts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, [filter]);

  const getStatusBadgeColor = (status: BankAccountStatus) => {
    switch (status) {
      case BankAccountStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case BankAccountStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case BankAccountStatus.CLOSED:
        return 'bg-red-100 text-red-800';
      case BankAccountStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: BankAccountType) => {
    switch (type) {
      case BankAccountType.CHECKING:
        return '💳';
      case BankAccountType.SAVINGS:
        return '💰';
      case BankAccountType.MONEY_MARKET:
        return '📈';
      case BankAccountType.CREDIT_CARD:
        return '💳';
      case BankAccountType.OTHER:
        return '🏦';
      default:
        return '🏦';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleFilterByType = (type?: BankAccountType) => {
    setFilter({ ...filter, type });
  };

  const handleFilterByStatus = (status?: BankAccountStatus) => {
    setFilter({ ...filter, status });
  };

  const handleSelect = (account: BankAccount) => {
    if (onSelect) {
      onSelect(account);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading bank accounts...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
        {showControls && (
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex gap-1">
              <button
                onClick={() => handleFilterByType(undefined)}
                className={`px-2 py-1 text-xs rounded-md ${!filter.type ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              >
                All Types
              </button>
              <button
                onClick={() => handleFilterByType(BankAccountType.CHECKING)}
                className={`px-2 py-1 text-xs rounded-md ${filter.type === BankAccountType.CHECKING ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              >
                Checking
              </button>
              <button
                onClick={() => handleFilterByType(BankAccountType.SAVINGS)}
                className={`px-2 py-1 text-xs rounded-md ${filter.type === BankAccountType.SAVINGS ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              >
                Savings
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleFilterByStatus(undefined)}
                className={`px-2 py-1 text-xs rounded-md ${!filter.status ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              >
                All Status
              </button>
              <button
                onClick={() => handleFilterByStatus(BankAccountStatus.ACTIVE)}
                className={`px-2 py-1 text-xs rounded-md ${filter.status === BankAccountStatus.ACTIVE ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              >
                Active
              </button>
              <button
                onClick={() => handleFilterByStatus(BankAccountStatus.INACTIVE)}
                className={`px-2 py-1 text-xs rounded-md ${filter.status === BankAccountStatus.INACTIVE ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              >
                Inactive
              </button>
            </div>
          </div>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No bank accounts found. 
          {showControls && (
            <Link href="/finance/banking/accounts/new" className="text-blue-600 hover:underline ml-1">
              Add a new bank account
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {accounts.map((account) => (
            <li 
              key={account.id} 
              className={`p-4 hover:bg-gray-50 ${account.isDefault ? 'bg-blue-50' : ''} transition-colors`}
              onClick={() => handleSelect(account)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTypeIcon(account.type)}</div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-base font-medium text-gray-900">{account.name}</h3>
                      {account.isDefault && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {account.bankName} ••••{account.accountNumber.slice(-4)}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeColor(account.status)}`}>
                        {account.status}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        Last reconciled: {account.lastReconciliationDate ? new Date(account.lastReconciliationDate).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(account.currentBalance)}
                  </div>
                  <div className="text-xs text-gray-500">
                    As of {new Date(account.asOfDate).toLocaleDateString()}
                  </div>
                  {showControls && (
                    <div className="mt-2 flex space-x-2">
                      <Link 
                        href={`/finance/banking/accounts/${account.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/finance/banking/accounts/${account.id}/reconcile`}
                        className="text-xs text-green-600 hover:text-green-800"
                      >
                        Reconcile
                      </Link>
                      <Link 
                        href={`/finance/banking/accounts/${account.id}/import`}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        Import
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}