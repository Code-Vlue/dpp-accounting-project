// src/app/finance/budgeting/annual/[id]/edit/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BudgetForm from '@/components/finance/budgeting/BudgetForm';
import { useFinanceStore } from '@/store/finance-store';
import { BudgetStatus } from '@/types/finance';

interface EditBudgetPageProps {
  params: {
    id: string;
  };
}

export default function EditBudgetPage({ params }: EditBudgetPageProps) {
  const budgetId = params.id;
  const router = useRouter();
  const { selectedBudget, budgetLoading, budgetError, fetchBudgetById } = useFinanceStore();
  
  // Fetch budget on component mount
  useEffect(() => {
    fetchBudgetById(budgetId);
  }, [budgetId, fetchBudgetById]);
  
  // Loading state
  if (budgetLoading || !selectedBudget) {
    return <div className="text-center py-4">Loading budget...</div>;
  }
  
  // Error state
  if (budgetError) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {budgetError}</span>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/finance/budgeting')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Budgeting Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if budget is editable
  if (selectedBudget.status !== BudgetStatus.DRAFT) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Cannot Edit:</strong>
            <span className="block sm:inline"> This budget cannot be edited because it is not in DRAFT status.</span>
          </div>
          <div className="mt-4">
            <Link
              href={`/finance/budgeting/annual/${budgetId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Budget
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Budget</h1>
            <p className="text-sm text-gray-500">
              Make changes to the budget details.
            </p>
          </div>
          <Link
            href={`/finance/budgeting/annual/${budgetId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
        </div>
        
        <BudgetForm budgetId={budgetId} />
      </div>
    </div>
  );
}