// src/app/finance/tuition-credits/payment-batches/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { ProviderPaymentBatchList } from '@/components/finance/tuition-credits';
import { PaymentStatus } from '@/types/finance';

export default function ProviderPaymentBatchesPage() {
  // Unused variable prefixed with underscore
  const _router = useRouter();
  const { fetchProviderPaymentBatches } = useFinanceStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  useEffect(() => {
    fetchProviderPaymentBatches();
  }, [fetchProviderPaymentBatches]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The ProviderPaymentBatchList component handles the filtering
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provider Payment Batches</h1>
        <Link
          href="/finance/tuition-credits/providers/payments/new-batch"
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
        >
          Create New Batch
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'ALL')}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="ALL">All Statuses</option>
              <option value={PaymentStatus.PENDING}>Pending</option>
              <option value={PaymentStatus.PROCESSING}>Processing</option>
              <option value={PaymentStatus.COMPLETED}>Completed</option>
              <option value={PaymentStatus.FAILED}>Failed</option>
              <option value={PaymentStatus.VOIDED}>Voided</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </form>
      </div>
      
      {/* Batches List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <ProviderPaymentBatchList 
          searchTerm={searchTerm}
          status={statusFilter !== 'ALL' ? statusFilter : undefined}
          startDate={startDate ? new Date(startDate) : undefined}
          endDate={endDate ? new Date(endDate) : undefined}
        />
      </div>
    </div>
  );
}