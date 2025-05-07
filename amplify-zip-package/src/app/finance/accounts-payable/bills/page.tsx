// src/app/finance/accounts-payable/bills/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import BillList from '@/components/finance/accounts-payable/BillList';
import { TransactionStatus } from '@/types/finance';

export default function BillsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<TransactionStatus | undefined>(undefined);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bills</h1>
        <Link
          href="/finance/accounts-payable/bills/new"
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
        >
          Create New Bill
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Bills
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by invoice #, vendor, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="md:w-1/4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status || ''}
              onChange={(e) => setStatus(e.target.value ? e.target.value as TransactionStatus : undefined)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Statuses</option>
              <option value={TransactionStatus.DRAFT}>Draft</option>
              <option value={TransactionStatus.PENDING_APPROVAL}>Pending Approval</option>
              <option value={TransactionStatus.APPROVED}>Approved</option>
              <option value={TransactionStatus.POSTED}>Posted</option>
              <option value={TransactionStatus.PARTIALLY_PAID}>Partially Paid</option>
              <option value={TransactionStatus.PAID}>Paid</option>
              <option value={TransactionStatus.VOIDED}>Void</option>
            </select>
          </div>
        </div>
        
        <BillList 
          searchTerm={searchTerm}
          status={status}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/finance/accounts-payable/bills?status=DRAFT"
            className="p-4 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100"
          >
            <div className="text-lg font-medium">Draft Bills</div>
            <p className="text-sm text-gray-500">View bills in draft status</p>
          </Link>
          <Link
            href="/finance/accounts-payable/bills?status=PENDING_APPROVAL"
            className="p-4 bg-yellow-50 rounded border border-yellow-200 hover:bg-yellow-100"
          >
            <div className="text-lg font-medium">Pending Approval</div>
            <p className="text-sm text-gray-500">View bills awaiting approval</p>
          </Link>
          <Link
            href="/finance/accounts-payable/bills?status=POSTED"
            className="p-4 bg-purple-50 rounded border border-purple-200 hover:bg-purple-100"
          >
            <div className="text-lg font-medium">Ready to Pay</div>
            <p className="text-sm text-gray-500">View bills ready for payment</p>
          </Link>
          <Link
            href="/finance/accounts-payable/reports/aging"
            className="p-4 bg-red-50 rounded border border-red-200 hover:bg-red-100"
          >
            <div className="text-lg font-medium">Overdue Bills</div>
            <p className="text-sm text-gray-500">View bills past due date</p>
          </Link>
        </div>
      </div>
    </div>
  );
}