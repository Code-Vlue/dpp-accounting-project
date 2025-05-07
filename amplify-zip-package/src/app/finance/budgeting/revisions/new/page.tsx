// src/app/finance/budgeting/revisions/new/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BudgetRevisionForm from '@/components/finance/budgeting/BudgetRevisionForm';

export default function NewBudgetRevisionPage() {
  const searchParams = useSearchParams();
  const budgetId = searchParams.get('budgetId');

  if (!budgetId) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">No budget ID provided. Please select a budget to create a revision.</span>
          </div>
          <Link
            href="/finance/budgeting"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Budgets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Create Budget Revision</h1>
            <p className="text-sm text-gray-500">
              Create a revision to modify an existing budget
            </p>
          </div>
          <Link
            href={`/finance/budgeting/annual/${budgetId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
        </div>
        
        <BudgetRevisionForm budgetId={budgetId} />
      </div>
    </div>
  );
}