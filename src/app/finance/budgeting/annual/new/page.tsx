// src/app/finance/budgeting/annual/new/page.tsx
'use client';

import Link from 'next/link';
import BudgetForm from '@/components/finance/budgeting/BudgetForm';
import { BudgetType } from '@/types/finance';

export default function NewAnnualBudgetPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Annual Budget</h1>
            <p className="text-sm text-gray-500">
              Define a new annual budget for your organization.
            </p>
          </div>
          <Link
            href="/finance/budgeting"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
        </div>
        
        <BudgetForm budgetType={BudgetType.ANNUAL} />
      </div>
    </div>
  );
}