// src/components/finance/bank-reconciliation/BankAccountDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BankAccount, BankTransaction, BankReconciliation, ReconciliationStatus } from '@/types/finance';
import { financeService } from '@/lib/finance/finance-service';

interface BankAccountDetailProps {
  accountId?: string;
  bankAccountId?: string;
}

export default function BankAccountDetail({ accountId, bankAccountId }: BankAccountDetailProps) {
  // Use bankAccountId if provided, otherwise use accountId
  const id = bankAccountId || accountId;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setAccountSummary] = useState<{
    bankAccount: BankAccount | null;
    lastReconciliation: BankReconciliation | null;
    currentReconciliation: BankReconciliation | null;
    recentTransactions: BankTransaction[];
    transactionCounts: {
      matched: number;
      unmatched: number;
      total: number;
    };
    unreconciledPeriod: {
      startDate: Date | null;
      endDate: Date | null;
      dayCount: number;
    };
  } | null>(null);

  useEffect(() => {
    async function loadAccountSummary() {
      try {
        setLoading(true);
        const summaryData = await financeService.getBankAccountSummary(id);
        setAccountSummary(summaryData);
        setError(null);
      } catch (err) {
        console.error('Error loading bank account summary:', err);
        setError('Failed to load bank account details');
      } finally {
        setLoading(false);
      }
    }

    loadAccountSummary();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: Date | null | undefined | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status?: ReconciliationStatus) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case ReconciliationStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ReconciliationStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case ReconciliationStatus.NOT_STARTED:
        return 'bg-yellow-100 text-yellow-800';
      case ReconciliationStatus.ABANDONED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartReconciliation = () => {
    router.push(`/finance/banking/accounts/${id}/reconcile`);
  };

  const handleImportTransactions = () => {
    router.push(`/finance/banking/accounts/${id}/import`);
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading bank account details...</div>;
  }

  if (error || !summary || !summary.bankAccount) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-500 mb-4">{error || 'Bank account not found'}</div>
        <Link href="/finance/banking/accounts" className="text-blue-600 hover:underline">
          Back to Bank Accounts
        </Link>
      </div>
    );
  }

  const { bankAccount, lastReconciliation, currentReconciliation, recentTransactions, transactionCounts, unreconciledPeriod } = summary;

  return (
    <div className="space-y-6">
      {/* Header with key information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{bankAccount.name}</h1>
            <p className="text-gray-600">
              {bankAccount.bankName} • {bankAccount.type} • ••••{bankAccount.accountNumber.slice(-4)}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                bankAccount.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                bankAccount.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                bankAccount.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {bankAccount.status.toLowerCase()}
              </span>
              {bankAccount.isDefault && (
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Default Account
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold">
              {formatCurrency(bankAccount.currentBalance)}
            </div>
            <div className="text-sm text-gray-500">
              As of {new Date(bankAccount.asOfDate).toLocaleDateString()}
            </div>
            
            <div className="mt-3 flex space-x-3 justify-end">
              <button
                onClick={handleStartReconciliation}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded"
              >
                {currentReconciliation ? 'Continue Reconciliation' : 'Reconcile Account'}
              </button>
              <button
                onClick={handleImportTransactions}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
              >
                Import Transactions
              </button>
              <Link
                href={`/finance/banking/accounts/${id}/edit`}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Transaction Summary */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Transactions</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">{transactionCounts.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{transactionCounts.matched}</div>
              <div className="text-xs text-gray-500">Matched</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{transactionCounts.unmatched}</div>
              <div className="text-xs text-gray-500">Unmatched</div>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href={`/finance/banking/accounts/${id}/transactions`}
              className="text-sm text-blue-600 hover:underline"
            >
              View All Transactions →
            </Link>
          </div>
        </div>

        {/* Reconciliation Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Reconciliation Status</h2>
          {currentReconciliation ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Current Reconciliation:</div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeColor(currentReconciliation.status)}`}>
                  {currentReconciliation.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <div>Period: {formatDate(currentReconciliation.startDate)} - {formatDate(currentReconciliation.endDate)}</div>
                <div>Last Activity: {formatDate(currentReconciliation.lastActivity)}</div>
              </div>
              <button
                onClick={handleStartReconciliation}
                className="w-full mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded"
              >
                Continue Reconciliation
              </button>
            </div>
          ) : (
            <div>
              <div className="text-sm text-gray-600 mb-2">
                <div>Last Reconciliation: {lastReconciliation ? formatDate(lastReconciliation.endDate) : 'Never'}</div>
                <div>Days since last reconciliation: {unreconciledPeriod.dayCount || 'N/A'}</div>
                <div>Unreconciled period: {unreconciledPeriod.startDate ? `${formatDate(unreconciledPeriod.startDate)} - ${formatDate(unreconciledPeriod.endDate)}` : 'N/A'}</div>
              </div>
              <button
                onClick={handleStartReconciliation}
                className="w-full mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded"
              >
                Start New Reconciliation
              </button>
            </div>
          )}
        </div>

        {/* Last Reconciliation */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Last Completed Reconciliation</h2>
          {lastReconciliation ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">{lastReconciliation.name}</div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeColor(lastReconciliation.status)}`}>
                  {lastReconciliation.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Period: {formatDate(lastReconciliation.startDate)} - {formatDate(lastReconciliation.endDate)}</div>
                <div>Completed on: {formatDate(lastReconciliation.completedAt)}</div>
                <div>Ending Balance: {formatCurrency(lastReconciliation.endingBalance)}</div>
              </div>
              <Link
                href={`/finance/banking/reconciliations/${lastReconciliation.id}`}
                className="block text-center w-full mt-2 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
              >
                View Reconciliation
              </Link>
            </div>
          ) : (
            <div className="text-sm text-gray-600 py-4 text-center">
              No completed reconciliations found.
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link
            href={`/finance/banking/accounts/${id}/transactions`}
            className="text-sm text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No recent transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.reference || (transaction.checkNumber ? `Check #${transaction.checkNumber}` : '')}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.matchStatus === 'MATCHED' || transaction.matchStatus === 'MANUALLY_MATCHED' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.matchStatus === 'UNMATCHED'
                          ? 'bg-red-100 text-red-800'
                          : transaction.matchStatus === 'NEEDS_REVIEW'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.matchStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">General Information</h3>
              <div className="mt-2 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
                    <dd className="text-sm text-gray-900">{bankAccount.bankName}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                    <dd className="text-sm text-gray-900">{bankAccount.accountNumber}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Routing Number</dt>
                    <dd className="text-sm text-gray-900">{bankAccount.routingNumber || 'N/A'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                    <dd className="text-sm text-gray-900">{bankAccount.type.replace('_', ' ')}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Opening Balance</dt>
                    <dd className="text-sm text-gray-900">{formatCurrency(bankAccount.openingBalance)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
              <div className="mt-2 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                    <dd className="text-sm text-gray-900">{bankAccount.contactName || 'N/A'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                    <dd className="text-sm text-gray-900">{bankAccount.contactPhone || 'N/A'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                    <dd className="text-sm text-gray-900">{bankAccount.contactEmail || 'N/A'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Last Import Date</dt>
                    <dd className="text-sm text-gray-900">
                      {bankAccount.lastImportDate ? formatDate(bankAccount.lastImportDate) : 'Never'}
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="text-sm text-gray-900">{bankAccount.notes || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}