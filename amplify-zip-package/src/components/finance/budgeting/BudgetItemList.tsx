// src/components/finance/budgeting/BudgetItemList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { BudgetItem, BudgetPeriodType } from '@/types/finance';
import Link from 'next/link';

interface BudgetItemListProps {
  budgetId: string;
  editable?: boolean;
}

export default function BudgetItemList({ budgetId, editable = false }: BudgetItemListProps) {
  const { 
    budgetItems, 
    budgetItemsLoading, 
    budgetItemsError,
    selectedBudget,
    chartOfAccounts,
    fetchBudgetItems,
    fetchChartOfAccounts,
    fetchBudgetById,
    deleteBudgetItem
  } = useFinanceStore();
  
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchBudgetItems(budgetId);
    fetchChartOfAccounts();
    fetchBudgetById(budgetId);
  }, [budgetId, fetchBudgetItems, fetchChartOfAccounts, fetchBudgetById]);
  
  // Get account name from chart of accounts
  const getAccountName = (accountId: string) => {
    const account = chartOfAccounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Handle delete confirmation
  const handleDeleteClick = (itemId: string) => {
    setShowConfirmDelete(itemId);
  };
  
  // Handle delete cancellation
  const handleCancelDelete = () => {
    setShowConfirmDelete(null);
  };
  
  // Handle delete confirmation
  const handleConfirmDelete = async (itemId: string) => {
    await deleteBudgetItem(itemId);
    setShowConfirmDelete(null);
  };
  
  // Get period distribution labels
  const getPeriodLabels = (periodType: BudgetPeriodType) => {
    switch (periodType) {
      case BudgetPeriodType.MONTHLY:
        return [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
      case BudgetPeriodType.QUARTERLY:
        return ['Q1', 'Q2', 'Q3', 'Q4'];
      case BudgetPeriodType.ANNUAL:
        return ['Annual'];
      default:
        return ['Unknown'];
    }
  };
  
  // Get period values from budget item
  const getPeriodValues = (item: BudgetItem, periodType: BudgetPeriodType) => {
    if (!item.periodDistribution) return [];
    
    // Extract values from periodDistribution
    const periodValues = item.periodDistribution.map(period => period.amount);
    
    switch (periodType) {
      case BudgetPeriodType.MONTHLY:
        return periodValues.slice(0, 12);
      case BudgetPeriodType.QUARTERLY:
        return periodValues.slice(0, 4);
      case BudgetPeriodType.ANNUAL:
        return [item.amount];
      default:
        return [];
    }
  };
  
  // Loading state
  if (budgetItemsLoading || !selectedBudget) {
    return <div className="text-center py-4">Loading budget items...</div>;
  }
  
  // Error state
  if (budgetItemsError) {
    return <div className="text-center py-4 text-red-600">Error loading budget items: {budgetItemsError}</div>;
  }
  
  // Empty state
  if (budgetItems.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Budget Items</h3>
          {editable && (
            <Link 
              href={`/finance/budgeting/annual/${budgetId}/items/new`}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Budget Item
            </Link>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-5">
          <p className="text-center text-gray-500">No budget items found</p>
          {editable && (
            <div className="mt-4 text-center">
              <Link 
                href={`/finance/budgeting/annual/${budgetId}/items/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add First Budget Item
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Get period labels based on budget period type
  const periodLabels = getPeriodLabels(selectedBudget.periodType as BudgetPeriodType);
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Budget Items</h3>
        {editable && (
          <Link 
            href={`/finance/budgeting/annual/${budgetId}/items/new`}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Budget Item
          </Link>
        )}
      </div>
      <div className="border-t border-gray-200">
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
                  Amount
                </th>
                {selectedBudget.periodType !== BudgetPeriodType.ANNUAL && periodLabels.map((label, index) => (
                  <th 
                    key={index} 
                    scope="col" 
                    className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {label}
                  </th>
                ))}
                {editable && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getAccountName(item.accountId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(item.amount)}
                  </td>
                  {selectedBudget.periodType !== BudgetPeriodType.ANNUAL && 
                    getPeriodValues(item, selectedBudget.periodType as BudgetPeriodType).map((value, index) => (
                      <td 
                        key={index} 
                        className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900"
                      >
                        {formatCurrency(value)}
                      </td>
                    ))
                  }
                  {editable && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {showConfirmDelete === item.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleConfirmDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <Link 
                            href={`/finance/budgeting/annual/${budgetId}/items/${item.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-gray-100 font-semibold hover:bg-gray-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  All Budget Items
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatCurrency(budgetItems.reduce((sum, item) => sum + item.amount, 0))}
                </td>
                {selectedBudget.periodType !== BudgetPeriodType.ANNUAL && 
                  periodLabels.map((_, index) => {
                    const periodTotal = budgetItems.reduce((sum, item) => {
                      const periodValues = getPeriodValues(item, selectedBudget.periodType as BudgetPeriodType);
                      return sum + (periodValues[index] || 0);
                    }, 0);
                    
                    return (
                      <td 
                        key={index} 
                        className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900"
                      >
                        {formatCurrency(periodTotal)}
                      </td>
                    );
                  })
                }
                {editable && <td className="px-6 py-4"></td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}