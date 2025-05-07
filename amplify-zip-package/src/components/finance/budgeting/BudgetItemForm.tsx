// src/components/finance/budgeting/BudgetItemForm.tsx
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { BudgetPeriodType } from '@/types/finance';

interface BudgetItemFormProps {
  budgetId: string;
  itemId?: string; // If provided, we're editing an existing item
}

export default function BudgetItemForm({ budgetId, itemId }: BudgetItemFormProps) {
  const router = useRouter();
  const { 
    selectedBudget,
    selectedBudgetItem,
    budgetItemDraft,
    chartOfAccounts,
    fetchBudgetById,
    fetchChartOfAccounts,
    fetchBudgetItemById,
    setBudgetItemDraftField,
    createBudgetItem,
    updateBudgetItem
  } = useFinanceStore();
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periodValues, setPeriodValues] = useState<number[]>([]);
  const [isEvenDistribution, setIsEvenDistribution] = useState(true);
  
  // Fetch necessary data on component mount
  useEffect(() => {
    fetchBudgetById(budgetId);
    fetchChartOfAccounts();
    
    // If we're editing an existing item, fetch it
    if (itemId) {
      fetchBudgetItemById(itemId);
    }
  }, [budgetId, itemId, fetchBudgetById, fetchChartOfAccounts, fetchBudgetItemById]);
  
  // Set initial form values from the selected budget item
  useEffect(() => {
    if (itemId && selectedBudgetItem) {
      // Set form values from selected budget item
      Object.entries(selectedBudgetItem).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'budgetId' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'periodValues') {
          setBudgetItemDraftField(key, value);
        }
      });
      
      // Set period values
      if (selectedBudgetItem.periodValues) {
        setPeriodValues(selectedBudgetItem.periodValues);
        
        // Check if it's an even distribution
        const amount = selectedBudgetItem.amount;
        const periodCount = getPeriodCount();
        const evenValue = amount / periodCount;
        const isEven = selectedBudgetItem.periodValues.every(val => Math.abs(val - evenValue) < 0.01);
        setIsEvenDistribution(isEven);
      }
    } else {
      // Reset form for new item
      setBudgetItemDraftField('description', '');
      setBudgetItemDraftField('accountId', '');
      setBudgetItemDraftField('amount', 0);
      setBudgetItemDraftField('notes', '');
      
      // Initialize period values with zeros
      const newPeriodValues = Array(getPeriodCount()).fill(0);
      setPeriodValues(newPeriodValues);
    }
  }, [itemId, selectedBudgetItem, setBudgetItemDraftField]);
  
  // Get period count based on budget period type
  const getPeriodCount = () => {
    if (!selectedBudget) return 12; // Default to monthly
    
    switch (selectedBudget.periodType) {
      case BudgetPeriodType.MONTHLY:
        return 12;
      case BudgetPeriodType.QUARTERLY:
        return 4;
      case BudgetPeriodType.ANNUAL:
        return 1;
      default:
        return 12;
    }
  };
  
  // Get period labels based on budget period type
  const getPeriodLabels = () => {
    if (!selectedBudget) return [];
    
    switch (selectedBudget.periodType) {
      case BudgetPeriodType.MONTHLY:
        return [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
      case BudgetPeriodType.QUARTERLY:
        return ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'];
      case BudgetPeriodType.ANNUAL:
        return ['Annual'];
      default:
        return [];
    }
  };
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBudgetItemDraftField(name, value);
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value);
    setBudgetItemDraftField(name, numValue);
    
    // If amount is changed and even distribution is enabled, update period values
    if (name === 'amount' && isEvenDistribution) {
      const periodCount = getPeriodCount();
      const newPeriodValues = Array(periodCount).fill(numValue / periodCount);
      setPeriodValues(newPeriodValues);
    }
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  // Handle period value changes
  const handlePeriodValueChange = (index: number, value: number) => {
    const newPeriodValues = [...periodValues];
    newPeriodValues[index] = value;
    setPeriodValues(newPeriodValues);
    
    // Update total amount
    const total = newPeriodValues.reduce((sum, val) => sum + val, 0);
    setBudgetItemDraftField('amount', total);
    
    // Disable even distribution when manually changing values
    setIsEvenDistribution(false);
  };
  
  // Handle even distribution toggle
  const handleEvenDistributionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEven = e.target.checked;
    setIsEvenDistribution(isEven);
    
    if (isEven) {
      // Distribute amount evenly
      const amount = budgetItemDraft.amount || 0;
      const periodCount = getPeriodCount();
      const newPeriodValues = Array(periodCount).fill(amount / periodCount);
      setPeriodValues(newPeriodValues);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!budgetItemDraft.description) {
      newErrors.description = 'Description is required';
    }
    
    if (!budgetItemDraft.accountId) {
      newErrors.accountId = 'Account is required';
    }
    
    if (budgetItemDraft.amount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    
    // Check if period values sum to total amount
    const totalPeriodValues = periodValues.reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalPeriodValues - budgetItemDraft.amount) > 0.01) {
      newErrors.periodValues = 'Period values must sum to total amount';
    }
    
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
      if (itemId) {
        // Update existing budget item
        await updateBudgetItem(itemId, { ...budgetItemDraft, periodDistribution: periodValues });
      } else {
        // Create new budget item
        await createBudgetItem({ ...budgetItemDraft, budgetId, periodDistribution: periodValues });
      }
      
      // Redirect back to budget detail page
      router.push(`/finance/budgeting/annual/${budgetId}`);
    } catch (error) {
      console.error('Error saving budget item:', error);
      setErrors(prev => ({ ...prev, form: 'Failed to save budget item. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (!selectedBudget) {
    return <div className="text-center py-4">Loading budget...</div>;
  }
  
  const periodLabels = getPeriodLabels();
  
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
            <h3 className="text-lg font-medium leading-6 text-gray-900">Budget Item Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              {itemId ? 'Edit the budget item details.' : 'Create a new budget item.'}
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  value={budgetItemDraft.description || ''}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.description ? 'border-red-300' : ''}`}
                />
                {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                  Account
                </label>
                <select
                  id="accountId"
                  name="accountId"
                  value={budgetItemDraft.accountId || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.accountId ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Account</option>
                  {chartOfAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {account.name}
                    </option>
                  ))}
                </select>
                {errors.accountId && <p className="mt-2 text-sm text-red-600">{errors.accountId}</p>}
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Total Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={budgetItemDraft.amount || ''}
                    onChange={handleNumberChange}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${errors.amount ? 'border-red-300' : ''}`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
              </div>
              
              <div className="col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={budgetItemDraft.notes || ''}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Period distribution */}
      {selectedBudget.periodType !== BudgetPeriodType.ANNUAL && (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Period Distribution</h3>
              <p className="mt-1 text-sm text-gray-500">
                Define how the budget is distributed across periods.
              </p>
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    id="evenDistribution"
                    name="evenDistribution"
                    type="checkbox"
                    checked={isEvenDistribution}
                    onChange={handleEvenDistributionChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="evenDistribution" className="ml-2 block text-sm text-gray-900">
                    Distribute amount evenly
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="space-y-4">
                {periodLabels.map((label, index) => (
                  <div key={index} className="grid grid-cols-6 gap-3 items-center">
                    <div className="col-span-2 sm:col-span-2">
                      <label htmlFor={`period-${index}`} className="block text-sm font-medium text-gray-700">
                        {label}
                      </label>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id={`period-${index}`}
                          value={periodValues[index] || 0}
                          onChange={(e) => handlePeriodValueChange(index, parseFloat(e.target.value) || 0)}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          disabled={isEvenDistribution}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {errors.periodValues && (
                  <div className="col-span-6">
                    <p className="mt-2 text-sm text-red-600">{errors.periodValues}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-6 gap-3 items-center pt-2 border-t border-gray-200">
                  <div className="col-span-2 sm:col-span-2">
                    <span className="block text-sm font-medium text-gray-700">
                      Total
                    </span>
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <div className="text-sm font-medium text-gray-900">
                      ${periodValues.reduce((sum, val) => sum + val, 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (itemId ? 'Update Budget Item' : 'Create Budget Item')}
        </button>
      </div>
    </form>
  );
}