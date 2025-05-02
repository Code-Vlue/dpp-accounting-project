// src/components/finance/general-ledger/TransactionDetail.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  TransactionStatus, 
  TransactionType, 
  AccountType
} from '@/types/finance';
import Link from 'next/link';
import { format } from 'date-fns';

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const { 
    selectedTransaction, 
    accounts,
    transactionsLoading, 
    accountsLoading,
    transactionError, 
    fetchTransactionById,
    fetchAccounts,
    approveTransaction,
    postTransaction
  } = useFinanceStore();
  
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  // Load transaction data
  useEffect(() => {
    if (id) {
      fetchTransactionById(id);
      fetchAccounts();
    }
  }, [id, fetchTransactionById, fetchAccounts]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get account name by ID
  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account 
      ? `${account.accountNumber} - ${account.name}`
      : 'Unknown Account';
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
    
    return <span className={`px-2 py-1 text-sm font-medium rounded-md ${badgeClass}`}>
      {status.replace('_', ' ')}
    </span>;
  };

  // Handle approval
  const handleApprove = async () => {
    if (!user) return;
    
    try {
      await approveTransaction(id, user.id);
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  // Handle posting
  const handlePost = async () => {
    try {
      await postTransaction(id);
    } catch (error) {
      console.error('Error posting transaction:', error);
    }
  };

  // Toggle void confirmation
  const toggleVoidConfirm = () => {
    setShowVoidConfirm(!showVoidConfirm);
  };

  // Handle void
  const handleVoid = async () => {
    if (!user || !voidReason.trim()) return;
    
    try {
      // In a real implementation, we would call a voidTransaction method
      console.log('Voiding transaction with reason:', voidReason);
      // Reset the form
      setVoidReason('');
      setShowVoidConfirm(false);
    } catch (error) {
      console.error('Error voiding transaction:', error);
    }
  };

  // Navigate back
  const handleBack = () => {
    router.push('/finance/general-ledger');
  };

  const isLoading = transactionsLoading || accountsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (transactionError) {
    return (
      <div className="text-warning-red py-4 text-center">
        Error loading transaction: {transactionError}
      </div>
    );
  }

  if (!selectedTransaction) {
    return (
      <div className="text-warning-red py-4 text-center">
        Transaction not found.
      </div>
    );
  }

  // Calculate totals
  const totalDebits = selectedTransaction.entries.reduce(
    (sum, entry) => sum + entry.debitAmount, 
    0
  );
  
  const totalCredits = selectedTransaction.entries.reduce(
    (sum, entry) => sum + entry.creditAmount, 
    0
  );

  // Check if transaction is balanced
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

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
          Back to Transactions
        </button>
        
        <div className="flex space-x-2">
          {selectedTransaction.status === TransactionStatus.PENDING_APPROVAL && (
            <button 
              onClick={handleApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Approve
            </button>
          )}
          
          {selectedTransaction.status === TransactionStatus.APPROVED && (
            <button 
              onClick={handlePost}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm"
            >
              Post to General Ledger
            </button>
          )}
          
          {selectedTransaction.status === TransactionStatus.POSTED && (
            <button 
              onClick={toggleVoidConfirm}
              className="px-4 py-2 bg-warning-red text-white rounded-md hover:bg-red-700 text-sm"
            >
              Void Transaction
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-blue flex items-center">
              {selectedTransaction.reference || `Transaction #${selectedTransaction.id}`}
              <span className="ml-4">
                {renderStatusBadge(selectedTransaction.status)}
              </span>
            </h1>
            <p className="text-gray-500 mt-1">{selectedTransaction.description}</p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                Type: {selectedTransaction.type.replace('_', ' ')}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                Date: {format(new Date(selectedTransaction.date), 'MMMM d, yyyy')}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Amount: {formatCurrency(selectedTransaction.amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-dark-blue mb-4">Transaction Entries</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedTransaction.entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link href={`/finance/chart-of-accounts/${entry.accountId}`} className="text-primary-blue hover:underline">
                      {getAccountName(entry.accountId)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.description || selectedTransaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : ''}
                  </td>
                </tr>
              ))}
              
              {/* Totals row */}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                  Totals
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(totalDebits)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(totalCredits)}
                </td>
              </tr>
              
              {/* Balance check row */}
              {!isBalanced && (
                <tr className="bg-warning-red bg-opacity-10">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-warning-red font-medium" colSpan={2}>
                    Out of Balance
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-warning-red font-medium text-right" colSpan={2}>
                    {formatCurrency(Math.abs(totalDebits - totalCredits))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-dark-blue mb-2">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Created By:</div>
              <div>{selectedTransaction.createdById}</div>
              
              <div className="text-gray-500">Created At:</div>
              <div>{format(new Date(selectedTransaction.createdAt), 'MMM d, yyyy h:mm a')}</div>
              
              {selectedTransaction.approvedById && (
                <>
                  <div className="text-gray-500">Approved By:</div>
                  <div>{selectedTransaction.approvedById}</div>
                  
                  <div className="text-gray-500">Approved At:</div>
                  <div>{selectedTransaction.approvedAt ? format(new Date(selectedTransaction.approvedAt), 'MMM d, yyyy h:mm a') : 'N/A'}</div>
                </>
              )}
              
              {selectedTransaction.postedAt && (
                <>
                  <div className="text-gray-500">Posted At:</div>
                  <div>{format(new Date(selectedTransaction.postedAt), 'MMM d, yyyy h:mm a')}</div>
                </>
              )}
              
              {selectedTransaction.voidedById && (
                <>
                  <div className="text-gray-500">Voided By:</div>
                  <div>{selectedTransaction.voidedById}</div>
                  
                  <div className="text-gray-500">Voided At:</div>
                  <div>{selectedTransaction.voidedAt ? format(new Date(selectedTransaction.voidedAt), 'MMM d, yyyy h:mm a') : 'N/A'}</div>
                  
                  <div className="text-gray-500">Void Reason:</div>
                  <div>{selectedTransaction.voidReason}</div>
                </>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-dark-blue mb-2">Fiscal Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Fiscal Year:</div>
              <div>{selectedTransaction.fiscalYearId}</div>
              
              <div className="text-gray-500">Fiscal Period:</div>
              <div>{selectedTransaction.fiscalPeriodId}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Void confirmation dialog */}
      {showVoidConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-blue mb-4">
              Void Transaction
            </h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to void this transaction? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label htmlFor="voidReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Voiding *
              </label>
              <textarea
                id="voidReason"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                rows={3}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={toggleVoidConfirm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVoid}
                className="px-4 py-2 bg-warning-red text-white rounded-md hover:bg-red-700"
                disabled={!voidReason.trim()}
              >
                Void Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}