// src/components/finance/general-ledger/JournalEntryForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { useAuth } from '@/lib/auth/auth-context';
import { AccountType } from '@/types/finance';

export default function JournalEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const accountId = searchParams.get('accountId');
  
  const { 
    accounts,
    accountsLoading, 
    fetchAccounts,
    journalEntryDraft,
    updateJournalEntryDraft,
    addJournalEntryLine,
    removeJournalEntryLine,
    updateJournalEntryLine,
    resetJournalEntryDraft,
    submitJournalEntry,
    transactionError,
    transactionsLoading,
    currentFiscalYear,
    currentFiscalPeriod,
    fetchFiscalYears
  } = useFinanceStore();
  
  const [validationErrors, setValidationErrors] = useState<{
    date?: string;
    description?: string;
    reference?: string;
    entries?: string;
    balance?: string;
  }>({});

  // Load accounts and fiscal info on component mount
  useEffect(() => {
    fetchAccounts();
    fetchFiscalYears();
    
    // Reset the form
    resetJournalEntryDraft();
    
    // If accountId is provided, pre-select it in the first line
    if (accountId) {
      updateJournalEntryLine(0, { accountId });
    }
    
    return () => {
      // Clean up on unmount
      resetJournalEntryDraft();
    };
  }, [fetchAccounts, fetchFiscalYears, resetJournalEntryDraft, accountId, updateJournalEntryLine]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateJournalEntryDraft('date', new Date(e.target.value));
    
    // Clear validation error if it exists
    if (validationErrors.date) {
      setValidationErrors(prev => ({ ...prev, date: undefined }));
    }
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateJournalEntryDraft('description', e.target.value);
    
    // Clear validation error if it exists
    if (validationErrors.description) {
      setValidationErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  // Handle reference change
  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateJournalEntryDraft('reference', e.target.value);
    
    // Clear validation error if it exists
    if (validationErrors.reference) {
      setValidationErrors(prev => ({ ...prev, reference: undefined }));
    }
  };

  // Handle entry account change
  const handleEntryAccountChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    updateJournalEntryLine(index, { accountId: e.target.value });
    
    // Clear validation error if it exists
    if (validationErrors.entries) {
      setValidationErrors(prev => ({ ...prev, entries: undefined }));
    }
  };

  // Handle entry description change
  const handleEntryDescriptionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    updateJournalEntryLine(index, { description: e.target.value });
  };

  // Handle entry debit change
  const handleEntryDebitChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : 0;
    
    // If debit has a value, clear credit
    updateJournalEntryLine(index, { 
      debitAmount: value,
      creditAmount: value > 0 ? 0 : journalEntryDraft.entries[index].creditAmount 
    });
    
    // Clear validation error if it exists
    if (validationErrors.balance) {
      setValidationErrors(prev => ({ ...prev, balance: undefined }));
    }
  };

  // Handle entry credit change
  const handleEntryCreditChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : 0;
    
    // If credit has a value, clear debit
    updateJournalEntryLine(index, { 
      creditAmount: value,
      debitAmount: value > 0 ? 0 : journalEntryDraft.entries[index].debitAmount 
    });
    
    // Clear validation error if it exists
    if (validationErrors.balance) {
      setValidationErrors(prev => ({ ...prev, balance: undefined }));
    }
  };

  // Get the formatted date for the date input
  const getFormattedDate = () => {
    const date = journalEntryDraft.date;
    return date.toISOString().split('T')[0];
  };

  // Calculate totals
  const totalDebits = journalEntryDraft.entries.reduce(
    (sum, entry) => sum + entry.debitAmount, 
    0
  );
  
  const totalCredits = journalEntryDraft.entries.reduce(
    (sum, entry) => sum + entry.creditAmount, 
    0
  );

  // Check if the transaction is balanced
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  // Validate the form
  const validateForm = () => {
    const errors: typeof validationErrors = {};
    
    // Check required fields
    if (!journalEntryDraft.date) {
      errors.date = 'Date is required';
    }
    
    if (!journalEntryDraft.description.trim()) {
      errors.description = 'Description is required';
    }
    
    // Check if at least one entry is filled out
    const hasValidEntries = journalEntryDraft.entries.some(
      entry => entry.accountId && (entry.debitAmount > 0 || entry.creditAmount > 0)
    );
    
    if (!hasValidEntries) {
      errors.entries = 'At least one entry with an account and amount is required';
    }
    
    // Check if transaction is balanced
    if (!isBalanced) {
      errors.balance = 'Debits must equal credits';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!user) {
      setValidationErrors({ 
        ...validationErrors, 
        entries: 'You must be logged in to create a journal entry' 
      });
      return;
    }
    
    // Submit the journal entry
    await submitJournalEntry(user.id);
    
    // Redirect to the general ledger
    router.push('/finance/general-ledger');
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/finance/general-ledger');
  };

  // Get grouped accounts for select dropdown
  const getGroupedAccounts = () => {
    const groups: Record<AccountType, { label: string, options: { value: string, label: string }[] }> = {
      [AccountType.ASSET]: { 
        label: 'Assets', 
        options: [] 
      },
      [AccountType.LIABILITY]: { 
        label: 'Liabilities', 
        options: [] 
      },
      [AccountType.EQUITY]: { 
        label: 'Equity', 
        options: [] 
      },
      [AccountType.REVENUE]: { 
        label: 'Revenue', 
        options: [] 
      },
      [AccountType.EXPENSE]: { 
        label: 'Expenses', 
        options: [] 
      }
    };
    
    accounts.forEach(account => {
      if (account.isActive) {
        groups[account.type].options.push({
          value: account.id,
          label: `${account.accountNumber} - ${account.name}`
        });
      }
    });
    
    return Object.values(groups).filter(group => group.options.length > 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-dark-blue">
          Create New Journal Entry
        </h1>
        <p className="text-gray-500 mt-1">
          Enter the details for the new journal entry
        </p>
        
        {currentFiscalYear && currentFiscalPeriod && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Current Period:</span> {currentFiscalYear.name} - {currentFiscalPeriod.name}
          </div>
        )}
      </div>
      
      {transactionError && (
        <div className="bg-warning-red bg-opacity-10 text-warning-red p-4 rounded-md mb-6">
          {transactionError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={getFormattedDate()}
              onChange={handleDateChange}
              className={`w-full px-3 py-2 border ${
                validationErrors.date ? 'border-warning-red' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue`}
            />
            {validationErrors.date && (
              <p className="mt-1 text-sm text-warning-red">{validationErrors.date}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
              Reference
            </label>
            <input
              type="text"
              id="reference"
              value={journalEntryDraft.reference}
              onChange={handleReferenceChange}
              placeholder="e.g., JE-2024-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              id="description"
              value={journalEntryDraft.description}
              onChange={handleDescriptionChange}
              className={`w-full px-3 py-2 border ${
                validationErrors.description ? 'border-warning-red' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue`}
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-warning-red">{validationErrors.description}</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-dark-blue">Entry Lines</h2>
            <button
              type="button"
              onClick={addJournalEntryLine}
              className="text-primary-blue hover:text-blue-700 text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Line
            </button>
          </div>
          
          {validationErrors.entries && (
            <p className="mt-1 mb-2 text-sm text-warning-red">{validationErrors.entries}</p>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account *
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
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {journalEntryDraft.entries.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={entry.accountId}
                        onChange={(e) => handleEntryAccountChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                      >
                        <option value="">Select an account</option>
                        {getGroupedAccounts().map(group => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={entry.description}
                        onChange={(e) => handleEntryDescriptionChange(index, e)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={entry.debitAmount || ''}
                        onChange={(e) => handleEntryDebitChange(index, e)}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm text-right"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={entry.creditAmount || ''}
                        onChange={(e) => handleEntryCreditChange(index, e)}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm text-right"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {journalEntryDraft.entries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeJournalEntryLine(index)}
                          className="text-warning-red hover:text-red-700"
                          aria-label="Remove line"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      )}
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
                  <td></td>
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
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {validationErrors.balance && (
            <p className="mt-2 text-sm text-warning-red">{validationErrors.balance}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={transactionsLoading}
          >
            {transactionsLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Create Journal Entry
          </button>
        </div>
      </form>
    </div>
  );
}