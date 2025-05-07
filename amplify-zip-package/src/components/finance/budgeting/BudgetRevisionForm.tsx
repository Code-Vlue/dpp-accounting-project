// src/components/finance/budgeting/BudgetRevisionForm.tsx
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { BudgetItem } from '@/types/finance';

interface BudgetRevisionFormProps {
  budgetId: string;
  onCancel?: () => void;
}

export default function BudgetRevisionForm({ budgetId, onCancel }: BudgetRevisionFormProps) {
  const router = useRouter();
  const {
    selectedBudget,
    budgetItems,
    chartOfAccounts,
    budgetRevisionDraft,
    setBudgetRevisionDraftField,
    addBudgetRevisionChange,
    updateBudgetRevisionChange,
    removeBudgetRevisionChange,
    resetBudgetRevisionDraft,
    createBudgetRevision,
    fetchBudgetById,
    fetchBudgetItems,
    fetchChartOfAccounts
  } = useFinanceStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch necessary data on component mount
  useEffect(() => {
    fetchBudgetById(budgetId);
    fetchBudgetItems(budgetId);
    fetchChartOfAccounts();

    // Initialize the revision draft
    setBudgetRevisionDraftField('budgetId', budgetId);

    // Clean up when unmounting
    return () => {
      resetBudgetRevisionDraft();
    };
  }, [
    budgetId,
    fetchBudgetById,
    fetchBudgetItems,
    fetchChartOfAccounts,
    setBudgetRevisionDraftField,
    resetBudgetRevisionDraft
  ]);

  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBudgetRevisionDraftField(name, value);

    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle change line field changes
  const handleChangeLineFieldChange = (
    index: number,
    field: string,
    value: string | number | 'ADD' | 'MODIFY' | 'REMOVE'
  ) => {
    updateBudgetRevisionChange(index, { [field]: value });

    // Clear validation error when field is changed
    const errorKey = `changes[${index}].${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
    }
  };

  // Add a new change line
  const handleAddChangeLine = () => {
    // Create a placeholder change with default values
    const newChange = {
      changeType: 'ADD' as 'ADD',
      description: '',
      newAmount: 0
    };
    addBudgetRevisionChange(newChange);
  };

  // Remove a change line
  const handleRemoveChangeLine = (index: number) => {
    removeBudgetRevisionChange(index);
  };

  // Find the budget item by ID
  const findBudgetItem = (itemId: string): BudgetItem | undefined => {
    return budgetItems.find(item => item.id === itemId);
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get account name from chart of accounts
  const getAccountName = (accountId: string) => {
    const account = chartOfAccounts.find(account => account.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!budgetRevisionDraft.description) {
      newErrors.description = 'Description is required';
    }

    if (!budgetRevisionDraft.reason) {
      newErrors.reason = 'Reason is required';
    }

    // Validate change lines
    budgetRevisionDraft.changes.forEach((change, index) => {
      if (change.changeType === 'ADD' && !change.accountId) {
        newErrors[`changes[${index}].accountId`] = 'Account is required for new budget items';
      }

      if (change.changeType === 'MODIFY' && !change.budgetItemId) {
        newErrors[`changes[${index}].budgetItemId`] = 'Budget item is required for modifications';
      }

      if (change.changeType === 'REMOVE' && !change.budgetItemId) {
        newErrors[`changes[${index}].budgetItemId`] = 'Budget item is required for removals';
      }

      if (!change.description) {
        newErrors[`changes[${index}].description`] = 'Description is required';
      }

      if (change.changeType !== 'REMOVE' && change.newAmount <= 0) {
        newErrors[`changes[${index}].newAmount`] = 'Amount must be greater than zero';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createBudgetRevision(budgetRevisionDraft);
      router.push(`/finance/budgeting/annual/${budgetId}`);
    } catch (error) {
      console.error('Error creating budget revision:', error);
      setErrors(prev => ({ ...prev, form: 'Failed to create budget revision. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!selectedBudget) {
    return <div className="text-center py-4">Loading budget details...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Error icon */}
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{errors.form}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Budget Revision</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a revision for {selectedBudget.name}
            </p>
            <div className="mt-4">
              <h4 className="text-md font-medium leading-6 text-gray-700">Budget Details</h4>
              <p className="mt-1 text-sm text-gray-500">Current Budget: {formatCurrency(selectedBudget.totalAmount)}</p>
              <p className="mt-1 text-sm text-gray-500">Status: {selectedBudget.status}</p>
              <p className="mt-1 text-sm text-gray-500">Fiscal Year: {selectedBudget.fiscalYearId}</p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Revision Name
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  value={budgetRevisionDraft.description || ''}
                  onChange={handleTextChange}
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.description ? 'border-red-300' : ''}`}
                />
                {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div className="col-span-6">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason for Revision
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  value={budgetRevisionDraft.reason || ''}
                  onChange={handleTextChange}
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.reason ? 'border-red-300' : ''}`}
                />
                {errors.reason && <p className="mt-2 text-sm text-red-600">{errors.reason}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Budget Changes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add, modify, or remove budget items
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="space-y-4">
              {budgetRevisionDraft.changes.map((change, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Change #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveChangeLine(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor={`change-type-${index}`} className="block text-sm font-medium text-gray-700">
                        Change Type
                      </label>
                      <select
                        id={`change-type-${index}`}
                        value={change.changeType}
                        onChange={(e) => handleChangeLineFieldChange(index, 'changeType', e.target.value as 'ADD' | 'MODIFY' | 'REMOVE')}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="ADD">Add New Item</option>
                        <option value="MODIFY">Modify Existing Item</option>
                        <option value="REMOVE">Remove Existing Item</option>
                      </select>
                    </div>

                    {(change.changeType === 'MODIFY' || change.changeType === 'REMOVE') && (
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor={`budget-item-${index}`} className="block text-sm font-medium text-gray-700">
                          Budget Item
                        </label>
                        <select
                          id={`budget-item-${index}`}
                          value={change.budgetItemId || ''}
                          onChange={(e) => {
                            const itemId = e.target.value;
                            const item = findBudgetItem(itemId);
                            handleChangeLineFieldChange(index, 'budgetItemId', itemId);
                            if (item) {
                              handleChangeLineFieldChange(index, 'description', item.description);
                              handleChangeLineFieldChange(index, 'previousAmount', item.amount);
                              if (change.changeType === 'MODIFY') {
                                handleChangeLineFieldChange(index, 'newAmount', item.amount);
                              }
                            }
                          }}
                          className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors[`changes[${index}].budgetItemId`] ? 'border-red-300' : ''}`}
                        >
                          <option value="">Select Budget Item</option>
                          {budgetItems.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.description} - {formatCurrency(item.amount)} - {getAccountName(item.accountId)}
                            </option>
                          ))}
                        </select>
                        {errors[`changes[${index}].budgetItemId`] && (
                          <p className="mt-2 text-sm text-red-600">{errors[`changes[${index}].budgetItemId`]}</p>
                        )}
                      </div>
                    )}

                    {change.changeType === 'ADD' && (
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor={`account-${index}`} className="block text-sm font-medium text-gray-700">
                          Account
                        </label>
                        <select
                          id={`account-${index}`}
                          value={change.accountId || ''}
                          onChange={(e) => handleChangeLineFieldChange(index, 'accountId', e.target.value)}
                          className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors[`changes[${index}].accountId`] ? 'border-red-300' : ''}`}
                        >
                          <option value="">Select Account</option>
                          {chartOfAccounts.map(account => (
                            <option key={account.id} value={account.id}>
                              {account.accountNumber} - {account.name}
                            </option>
                          ))}
                        </select>
                        {errors[`changes[${index}].accountId`] && (
                          <p className="mt-2 text-sm text-red-600">{errors[`changes[${index}].accountId`]}</p>
                        )}
                      </div>
                    )}

                    <div className="col-span-6">
                      <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <input
                        type="text"
                        id={`description-${index}`}
                        value={change.description || ''}
                        onChange={(e) => handleChangeLineFieldChange(index, 'description', e.target.value)}
                        className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors[`changes[${index}].description`] ? 'border-red-300' : ''}`}
                      />
                      {errors[`changes[${index}].description`] && (
                        <p className="mt-2 text-sm text-red-600">{errors[`changes[${index}].description`]}</p>
                      )}
                    </div>

                    {(change.changeType === 'MODIFY' || change.changeType === 'REMOVE') && (
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor={`previous-amount-${index}`} className="block text-sm font-medium text-gray-700">
                          Previous Amount
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id={`previous-amount-${index}`}
                            value={change.previousAmount || 0}
                            disabled
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-gray-100"
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                    )}

                    {change.changeType !== 'REMOVE' && (
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor={`new-amount-${index}`} className="block text-sm font-medium text-gray-700">
                          {change.changeType === 'ADD' ? 'Amount' : 'New Amount'}
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id={`new-amount-${index}`}
                            value={change.newAmount || ''}
                            onChange={(e) => handleChangeLineFieldChange(index, 'newAmount', parseFloat(e.target.value) || 0)}
                            className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${errors[`changes[${index}].newAmount`] ? 'border-red-300' : ''}`}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        {errors[`changes[${index}].newAmount`] && (
                          <p className="mt-2 text-sm text-red-600">{errors[`changes[${index}].newAmount`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleAddChangeLine}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Another Change
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Revision'}
        </button>
      </div>
    </form>
  );
}