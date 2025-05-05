// src/app/finance/budgeting/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { BudgetStatus, BudgetType } from '@/types/finance';

export default function BudgetingDashboard() {
  // Unused variable prefixed with underscore
  const _router = useRouter();
  const { 
    budgets, 
    budgetsLoading, 
    budgetError,
    fetchBudgets
  } = useFinanceStore();
  
  const [activeTab, setActiveTab] = useState('annual');

  // Fetch budgets on component mount
  React.useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Filter budgets by type
  const annualBudgets = budgets.filter(budget => budget.type === BudgetType.ANNUAL);
  const programBudgets = budgets.filter(budget => budget.type === BudgetType.PROGRAM);
  const departmentBudgets = budgets.filter(budget => budget.type === BudgetType.DEPARTMENT);
  const projectBudgets = budgets.filter(budget => budget.type === BudgetType.PROJECT);
  
  // Current active budget
  const currentAnnualBudget = annualBudgets.find(budget => budget.isCurrent);

  // Status badges
  const getBudgetStatusBadge = (status: BudgetStatus) => {
    const statusClasses = {
      [BudgetStatus.DRAFT]: 'bg-gray-200 text-gray-800',
      [BudgetStatus.PENDING_APPROVAL]: 'bg-yellow-100 text-yellow-800',
      [BudgetStatus.APPROVED]: 'bg-green-100 text-green-800',
      [BudgetStatus.ACTIVE]: 'bg-blue-100 text-blue-800',
      [BudgetStatus.CLOSED]: 'bg-gray-100 text-gray-800',
      [BudgetStatus.REJECTED]: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  // Budget type names
  const getBudgetTypeName = (type: BudgetType) => {
    const typeNames = {
      [BudgetType.ANNUAL]: 'Annual',
      [BudgetType.PROGRAM]: 'Program',
      [BudgetType.DEPARTMENT]: 'Department',
      [BudgetType.PROJECT]: 'Project'
    };
    
    return typeNames[type] || 'Unknown';
  };

  // Budget list component
  const BudgetList = ({ budgets }: { budgets: any[] }) => {
    if (budgetsLoading) {
      return <div className="text-center py-4">Loading budgets...</div>;
    }
    
    if (budgetError) {
      return <div className="text-center py-4 text-red-600">Error loading budgets: {budgetError}</div>;
    }
    
    if (budgets.length === 0) {
      return <div className="text-center py-4 text-gray-500">No budgets found</div>;
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiscal Year</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {budgets.map((budget) => (
              <tr key={budget.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {budget.name}
                    {budget.isCurrent && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Current</span>}
                  </div>
                  <div className="text-sm text-gray-500">{budget.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {budget.fiscalYear?.name || budget.fiscalYearId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getBudgetStatusBadge(budget.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getBudgetTypeName(budget.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/finance/budgeting/${activeTab}/${budget.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                    View
                  </Link>
                  {budget.status === BudgetStatus.DRAFT && (
                    <Link href={`/finance/budgeting/${activeTab}/${budget.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </Link>
                  )}
                  {(budget.status === BudgetStatus.DRAFT || budget.status === BudgetStatus.PENDING_APPROVAL) && (
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {/* implement delete functionality */}}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Budgeting System</h1>
          <div className="flex space-x-3">
            <Link
              href="/finance/budgeting/annual/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              New Budget
            </Link>
            <Link
              href="/finance/budgeting/templates"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Budget Templates
            </Link>
            <Link
              href="/finance/budgeting/import-export"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Import/Export
            </Link>
          </div>
        </div>

        {/* Current budget summary */}
        {currentAnnualBudget && (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-blue-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Current Annual Budget</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {currentAnnualBudget.fiscalYearId}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Budget Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentAnnualBudget.name}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {getBudgetStatusBadge(currentAnnualBudget.status)}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Budget</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${currentAnnualBudget.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(currentAnnualBudget.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:px-6">
                  <div className="flex justify-end">
                    <Link 
                      href={`/finance/budgeting/annual/${currentAnnualBudget.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/finance/budgeting/variance?budgetId=${currentAnnualBudget.id}`}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Variance Analysis
                    </Link>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Budget tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('annual')}
                className={`${
                  activeTab === 'annual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Annual Budgets
              </button>
              <button
                onClick={() => setActiveTab('programs')}
                className={`${
                  activeTab === 'programs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Program Budgets
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`${
                  activeTab === 'departments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Department Budgets
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Project Budgets
              </button>
              <button
                onClick={() => setActiveTab('revisions')}
                className={`${
                  activeTab === 'revisions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Budget Revisions
              </button>
            </nav>
          </div>
        </div>

        {/* Budget lists */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {activeTab === 'annual' && 'Annual Budgets'}
              {activeTab === 'programs' && 'Program Budgets'}
              {activeTab === 'departments' && 'Department Budgets'}
              {activeTab === 'projects' && 'Project Budgets'}
              {activeTab === 'revisions' && 'Budget Revisions'}
            </h3>
            <Link
              href={`/finance/budgeting/${activeTab}/new`}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {activeTab === 'revisions' ? 'New Revision' : 'New Budget'}
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {activeTab === 'annual' && <BudgetList budgets={annualBudgets} />}
            {activeTab === 'programs' && <BudgetList budgets={programBudgets} />}
            {activeTab === 'departments' && <BudgetList budgets={departmentBudgets} />}
            {activeTab === 'projects' && <BudgetList budgets={projectBudgets} />}
            {activeTab === 'revisions' && (
              <div className="px-6 py-4 text-gray-500">
                Budget revisions will be displayed here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}