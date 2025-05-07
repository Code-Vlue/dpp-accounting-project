// src/components/finance/tuition-credits/ProviderPaymentBatchList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { ProviderPaymentBatch, PaymentStatus } from '@/types/finance';

interface ProviderPaymentBatchListProps {
  searchTerm?: string;
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  batches?: ProviderPaymentBatch[];
  onView?: (id: string) => void;
  onProcess?: (id: string) => void;
  onGeneratePayfile?: (id: string) => void;
}

export default function ProviderPaymentBatchList({ 
  searchTerm = '', 
  status, 
  startDate,
  endDate,
  batches: propBatches,
  onView,
  onProcess,
  onGeneratePayfile
}: ProviderPaymentBatchListProps) {
  const { 
    providerPaymentBatches, 
    providerPaymentBatchesLoading, 
    providerPaymentBatchesError, 
    fetchProviderPaymentBatches 
  } = useFinanceStore();
  
  const [filteredBatches, setFilteredBatches] = useState<ProviderPaymentBatch[]>([]);
  
  useEffect(() => {
    // Only fetch if we're not given batches as props
    if (!propBatches) {
      fetchProviderPaymentBatches();
    }
  }, [fetchProviderPaymentBatches, propBatches]);
  
  useEffect(() => {
    // Use the batches from props if available, otherwise use the ones from the store
    let filtered = [...(propBatches || providerPaymentBatches)];
    
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
      filtered = filtered.filter(batch => new Date(batch.date) >= startDate);
    }
    
    if (endDate) {
      filtered = filtered.filter(batch => new Date(batch.date) <= endDate);
    }
    
    setFilteredBatches(filtered);
  }, [propBatches, providerPaymentBatches, searchTerm, status, startDate, endDate]);
  
  // Only show loading/error states if we're not given batches via props
  if (!propBatches && providerPaymentBatchesLoading) {
    return <div className="p-4 text-center">Loading payment batches...</div>;
  }
  
  if (!propBatches && providerPaymentBatchesError) {
    return <div className="p-4 text-center text-red-500">Error loading batches: {providerPaymentBatchesError}</div>;
  }
  
  if (filteredBatches.length === 0) {
    return <div className="p-4 text-center">No payment batches found.</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Batch Name</th>
            <th className="py-2 px-4 border-b text-left">Date</th>
            <th className="py-2 px-4 border-b text-left">Providers</th>
            <th className="py-2 px-4 border-b text-left">Payments</th>
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
                <div className="font-medium">{formatDate(batch.date)}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{batch.providerCount}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{batch.paymentIds.length}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">${batch.totalAmount.toLocaleString()}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getBatchStatusColor(batch.status)}`}>
                  {formatBatchStatus(batch.status)}
                </span>
                {batch.payfileGenerated && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    Payfile Generated
                  </span>
                )}
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
                      href={`/finance/tuition-credits/payment-batches/${batch.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  )}
                  
                  {batch.status === PaymentStatus.PENDING && (
                    onGeneratePayfile ? (
                      <button 
                        onClick={() => onGeneratePayfile(batch.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Generate Payfile
                      </button>
                    ) : (
                      <Link 
                        href={`/finance/tuition-credits/payment-batches/${batch.id}/generate-payfile`}
                        className="text-green-600 hover:text-green-800"
                      >
                        Generate Payfile
                      </Link>
                    )
                  )}
                  
                  {batch.status === PaymentStatus.PENDING && (
                    onProcess ? (
                      <button 
                        onClick={() => onProcess(batch.id)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Process
                      </button>
                    ) : (
                      <Link 
                        href={`/finance/tuition-credits/payment-batches/${batch.id}/process`}
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
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatBatchStatus(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'Pending';
    case PaymentStatus.PROCESSING:
      return 'Processing';
    case PaymentStatus.COMPLETED:
      return 'Completed';
    case PaymentStatus.FAILED:
      return 'Failed';
    case PaymentStatus.VOIDED:
      return 'Voided';
    default:
      return status;
  }
}

function getBatchStatusColor(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case PaymentStatus.PROCESSING:
      return 'bg-blue-100 text-blue-800';
    case PaymentStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    case PaymentStatus.FAILED:
      return 'bg-red-100 text-red-800';
    case PaymentStatus.VOIDED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}