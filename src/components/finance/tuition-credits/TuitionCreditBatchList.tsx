// src/components/finance/tuition-credits/TuitionCreditBatchList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCreditBatch, TuitionCreditStatus } from '@/types/finance';

interface TuitionCreditBatchListProps {
  searchTerm?: string;
  status?: TuitionCreditStatus;
  startDate?: Date;
  endDate?: Date;
  batches: TuitionCreditBatch[];
  onView?: (id: string) => void;
  onProcess?: (id: string) => void;
}

export default function TuitionCreditBatchList({ 
  searchTerm = '', 
  status, 
  startDate,
  endDate,
  batches: propBatches,
  onView,
  onProcess
}: TuitionCreditBatchListProps) {
  const { 
    tuitionCreditBatches, 
    tuitionCreditBatchesLoading, 
    tuitionCreditBatchesError, 
    fetchTuitionCreditBatches 
  } = useFinanceStore();
  
  const [filteredBatches, setFilteredBatches] = useState<TuitionCreditBatch[]>([]);
  
  useEffect(() => {
    // Only fetch batches if we're not given them as props
    if (!propBatches) {
      fetchTuitionCreditBatches();
    }
  }, [fetchTuitionCreditBatches, propBatches]);
  
  useEffect(() => {
    // Use provided batches if available, otherwise use store batches
    let filtered = [...(propBatches || tuitionCreditBatches)];
    
    // Filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(batch => 
        batch.name.toLowerCase().includes(term) || 
        batch.description.toLowerCase().includes(term)
      );
    }
    
    // Filter by status if provided
    if (status) {
      filtered = filtered.filter(batch => batch.status === status);
    }
    
    // Filter by date range if provided
    if (startDate) {
      filtered = filtered.filter(batch => new Date(batch.periodStart) >= startDate);
    }
    
    if (endDate) {
      filtered = filtered.filter(batch => new Date(batch.periodEnd) <= endDate);
    }
    
    setFilteredBatches(filtered);
  }, [propBatches, tuitionCreditBatches, searchTerm, status, startDate, endDate]);
  
  // Only show loading if we're not given batches as props and we're loading from the store
  if (!propBatches && tuitionCreditBatchesLoading) {
    return <div className="p-4 text-center">Loading tuition credit batches...</div>;
  }
  
  // Only show error if we're not given batches as props and there's an error from the store
  if (!propBatches && tuitionCreditBatchesError) {
    return <div className="p-4 text-center text-red-500">Error loading batches: {tuitionCreditBatchesError}</div>;
  }
  
  if (filteredBatches.length === 0) {
    return <div className="p-4 text-center">No tuition credit batches found.</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Batch Name</th>
            <th className="py-2 px-4 border-b text-left">Period</th>
            <th className="py-2 px-4 border-b text-left">Providers</th>
            <th className="py-2 px-4 border-b text-left">Credits</th>
            <th className="py-2 px-4 border-b text-left">Total Amount</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBatches.map((batch) => (
            <tr key={batch.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{batch.name}</div>
                <div className="text-sm text-gray-500">{batch.description}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{formatDateRange(batch.periodStart, batch.periodEnd)}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{batch.providerIds.length}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{batch.creditIds.length}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">${batch.totalAmount.toLocaleString()}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getBatchStatusColor(batch.status)}`}>
                  {formatBatchStatus(batch.status)}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="flex space-x-2">
                  {onView ? (
                    <button 
                      onClick={() => onView(batch.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  ) : (
                    <Link 
                      href={`/finance/tuition-credits/batches/${batch.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  )}
                  {batch.status === TuitionCreditStatus.DRAFT && (
                    <Link 
                      href={`/finance/tuition-credits/batches/${batch.id}/edit`}
                      className="text-green-600 hover:text-green-800"
                    >
                      Edit
                    </Link>
                  )}
                  {batch.status === TuitionCreditStatus.PENDING_APPROVAL && (
                    <Link 
                      href={`/finance/tuition-credits/batches/${batch.id}/approve`}
                      className="text-amber-600 hover:text-amber-800"
                    >
                      Approve
                    </Link>
                  )}
                  {batch.status === TuitionCreditStatus.APPROVED && (
                    onProcess ? (
                      <button 
                        onClick={() => onProcess(batch.id)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Process
                      </button>
                    ) : (
                      <Link 
                        href={`/finance/tuition-credits/batches/${batch.id}/process-payment`}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Process
                      </Link>
                    )
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper functions
function formatDateRange(startDate: Date, endDate: Date): string {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${start} - ${end}`;
}

function formatBatchStatus(status: TuitionCreditStatus): string {
  switch (status) {
    case TuitionCreditStatus.DRAFT:
      return 'Draft';
    case TuitionCreditStatus.PENDING_APPROVAL:
      return 'Pending Approval';
    case TuitionCreditStatus.APPROVED:
      return 'Approved';
    case TuitionCreditStatus.PROCESSED:
      return 'Processed';
    case TuitionCreditStatus.PAID:
      return 'Paid';
    case TuitionCreditStatus.REJECTED:
      return 'Rejected';
    case TuitionCreditStatus.VOIDED:
      return 'Voided';
    default:
      return status;
  }
}

function getBatchStatusColor(status: TuitionCreditStatus): string {
  switch (status) {
    case TuitionCreditStatus.DRAFT:
      return 'bg-gray-100 text-gray-800';
    case TuitionCreditStatus.PENDING_APPROVAL:
      return 'bg-yellow-100 text-yellow-800';
    case TuitionCreditStatus.APPROVED:
      return 'bg-blue-100 text-blue-800';
    case TuitionCreditStatus.PROCESSED:
      return 'bg-indigo-100 text-indigo-800';
    case TuitionCreditStatus.PAID:
      return 'bg-green-100 text-green-800';
    case TuitionCreditStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case TuitionCreditStatus.VOIDED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}