// src/app/finance/accounts-payable/recurring-bills/page.tsx
'use client';

import Link from 'next/link';
import RecurringBillList from '@/components/finance/accounts-payable/RecurringBillList';

export default function RecurringBillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Recurring Bills</h1>
        <Link
          href="/finance/accounts-payable/recurring-bills/new"
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
        >
          Create Recurring Bill
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <RecurringBillList />
      </div>
    </div>
  );
}