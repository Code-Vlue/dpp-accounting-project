// src/app/finance/budgeting/variance/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { BudgetPeriodType } from '@/types/finance';

export default function BudgetVariancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const budgetId = searchParams.get('budgetId');
  
  const {
    budgets,
    selectedBudget,
    // Unused variable prefixed with underscore
    _budgetItems: budgetItems,
    varianceData,
    varianceLoading,
    varianceError,
    fetchBudgets,
    fetchBudgetById,
    fetchBudgetItems,
    fetchVarianceData,
  } = useFinanceStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [showPercentage, setShowPercentage] = useState<boolean>(true);
  const [filterAccounts, setFilterAccounts] = useState<string>('all');
  
  // Fetch necessary data on component mount
  useEffect(() => {
    fetchBudgets();
    
    if (budgetId) {
      fetchBudgetById(budgetId);
      fetchBudgetItems(budgetId);
      fetchVarianceData(budgetId);
    }
  }, [budgetId, fetchBudgets, fetchBudgetById, fetchBudgetItems, fetchVarianceData]);
  
  // Handle budget change
  const handleBudgetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBudgetId = e.target.value;
    if (newBudgetId) {
      router.push(`/finance/budgeting/variance?budgetId=${newBudgetId}`);
    } else {
      router.push('/finance/budgeting/variance');
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return '0.00%';
    return `${value.toFixed(2)}%`;
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
  
  // Get variance class based on value (positive/negative)
  const getVarianceClass = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  // Filter variance data based on selected period and accounts
  const getFilteredVarianceData = () => {
    if (!varianceData) return [];
    
    let filtered = [...varianceData];
    
    // Filter by period
    if (selectedPeriod !== 'all' && selectedPeriod !== 'ytd') {
      const periodIndex = parseInt(selectedPeriod);
      filtered = filtered.map(item => ({
        ...item,
        budgetAmount: item.periodBudgetAmounts?.[periodIndex] || 0,
        actualAmount: item.periodActualAmounts?.[periodIndex] || 0,
        variance: (item.periodActualAmounts?.[periodIndex] || 0) - (item.periodBudgetAmounts?.[periodIndex] || 0),
        variancePercentage: item.periodBudgetAmounts?.[periodIndex] 
          ? ((item.periodActualAmounts?.[periodIndex] || 0) - (item.periodBudgetAmounts?.[periodIndex] || 0)) / item.periodBudgetAmounts[periodIndex] * 100
          : 0
      }));
    } else if (selectedPeriod === 'ytd') {
      // Year to date calculation - sum all periods up to current date
      const today = new Date();
      const currentMonth = today.getMonth(); // 0-based index (0 = January)
      
      filtered = filtered.map(item => {
        let ytdBudget = 0;
        let ytdActual = 0;
        
        // Sum up all periods until current month
        for (let i = 0; i <= currentMonth && i < (item.periodBudgetAmounts?.length || 0); i++) {
          ytdBudget += item.periodBudgetAmounts?.[i] || 0;
          ytdActual += item.periodActualAmounts?.[i] || 0;
        }
        
        const ytdVariance = ytdActual - ytdBudget;
        const ytdVariancePercentage = ytdBudget ? (ytdVariance / ytdBudget) * 100 : 0;
        
        return {
          ...item,
          budgetAmount: ytdBudget,
          actualAmount: ytdActual,
          variance: ytdVariance,
          variancePercentage: ytdVariancePercentage
        };
      });
    }
    
    // Filter by account type
    if (filterAccounts !== 'all') {
      filtered = filtered.filter(item => item.accountType === filterAccounts);
    }
    
    return filtered;
  };
  
  // Get totals for the filtered data
  const getTotals = () => {
    const filteredData = getFilteredVarianceData();
    
    const totalBudget = filteredData.reduce((sum, item) => sum + (item.budgetAmount || 0), 0);
    const totalActual = filteredData.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
    const totalVariance = totalActual - totalBudget;
    const totalVariancePercentage = totalBudget ? (totalVariance / totalBudget) * 100 : 0;
    
    return {
      totalBudget,
      totalActual,
      totalVariance,
      totalVariancePercentage
    };
  };
  
  // Loading state
  if ((budgetId && (!selectedBudget || varianceLoading)) || (!budgetId && !budgets.length)) {
    return <div className="text-center py-4">Loading variance analysis...</div>;
  }
  
  const periodLabels = selectedBudget ? getPeriodLabels() : [];
  const filteredVarianceData = getFilteredVarianceData();
  const totals = getTotals();
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Budget Variance Analysis</h1>
            <p className="text-sm text-gray-500">
              Compare budget to actual expenses and identify variances.
            </p>
          </div>
          <Link
            href="/finance/budgeting"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Budgets
          </Link>
        </div>
        
        {/* Budget selector */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Budget Selection</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a budget to view variance analysis.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="budget-select" className="block text-sm font-medium text-gray-700">
                    Budget
                  </label>
                  <select
                    id="budget-select"
                    value={budgetId || ''}
                    onChange={handleBudgetChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Budget</option>
                    {budgets.map(budget => (
                      <option key={budget.id} value={budget.id}>
                        {budget.name} ({budget.fiscalYear?.name || budget.fiscalYearId})
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedBudget && (
                  <>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="period-select" className="block text-sm font-medium text-gray-700">
                        Period
                      </label>
                      <select
                        id="period-select"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="all">All Periods</option>
                        <option value="ytd">Year to Date</option>
                        {periodLabels.map((label, index) => (
                          <option key={index} value={index.toString()}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="account-filter" className="block text-sm font-medium text-gray-700">
                        Account Type
                      </label>
                      <select
                        id="account-filter"
                        value={filterAccounts}
                        onChange={(e) => setFilterAccounts(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="all">All Accounts</option>
                        <option value="expense">Expenses</option>
                        <option value="revenue">Revenue</option>
                        <option value="asset">Assets</option>
                        <option value="liability">Liabilities</option>
                        <option value="equity">Equity</option>
                      </select>
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3 flex items-center">
                      <div className="flex items-center h-5">
                        <input
                          id="show-percentage"
                          name="show-percentage"
                          type="checkbox"
                          checked={showPercentage}
                          onChange={(e) => setShowPercentage(e.target.checked)}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="show-percentage" className="font-medium text-gray-700">Show Variance Percentage</label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {varianceError && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {varianceError}</span>
          </div>
        )}
        
        {/* No budget selected message */}
        {!budgetId && (
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">Please select a budget to view variance analysis.</span>
          </div>
        )}
        
        {/* Variance table */}
        {budgetId && selectedBudget && !varianceError && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Budget vs. Actual</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {selectedBudget.name} ({selectedBudget.fiscalYear?.name || selectedBudget.fiscalYearId})
                  {selectedPeriod !== 'all' && selectedPeriod !== 'ytd' && ` - ${periodLabels[parseInt(selectedPeriod)]}`}
                  {selectedPeriod === 'ytd' && ' - Year to Date'}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variance
                      </th>
                      {showPercentage && (
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Variance %
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVarianceData.length === 0 ? (
                      <tr>
                        <td colSpan={showPercentage ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                          No variance data available
                        </td>
                      </tr>
                    ) : (
                      <>
                        {filteredVarianceData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.accountName}
                              <div className="text-xs text-gray-500">{item.accountType}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                              {formatCurrency(item.budgetAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                              {formatCurrency(item.actualAmount)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getVarianceClass(item.variance || 0)}`}>
                              {formatCurrency(item.variance)}
                            </td>
                            {showPercentage && (
                              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getVarianceClass(item.variancePercentage || 0)}`}>
                                {formatPercentage(item.variancePercentage)}
                              </td>
                            )}
                          </tr>
                        ))}
                        
                        {/* Total row */}
                        <tr className="bg-gray-100 font-semibold hover:bg-gray-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Total
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatCurrency(totals.totalBudget)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatCurrency(totals.totalActual)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getVarianceClass(totals.totalVariance)}`}>
                            {formatCurrency(totals.totalVariance)}
                          </td>
                          {showPercentage && (
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getVarianceClass(totals.totalVariancePercentage)}`}>
                              {formatPercentage(totals.totalVariancePercentage)}
                            </td>
                          )}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}