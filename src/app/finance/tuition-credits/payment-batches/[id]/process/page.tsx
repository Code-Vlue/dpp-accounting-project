// src/app/finance/tuition-credits/payment-batches/[id]/process/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { PaymentStatus } from '@/types/finance';

export default function ProcessProviderPaymentBatchPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  
  const { 
    selectedProviderPaymentBatch,
    providerPaymentBatchesLoading,
    providerPaymentBatchesError,
    fetchProviderPaymentBatchById,
    processProviderPaymentBatch
  } = useFinanceStore();
  
  const [confirmationInput, setConfirmationInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProviderPaymentBatchById(batchId);
  }, [batchId, fetchProviderPaymentBatchById]);
  
  const handleProcess = async () => {
    if (!selectedProviderPaymentBatch) return;
    
    if (confirmationInput !== 'PROCESS') {
      setProcessingError('Please type PROCESS to confirm');
      return;
    }
    
    setProcessing(true);
    setProcessingError(null);
    
    try {
      await processProviderPaymentBatch(batchId, 'current-user'); // Would normally use actual user ID from auth
      router.push(`/finance/tuition-credits/payment-batches/${batchId}`);
    } catch (error: any) {
      setProcessingError(error.message || 'Failed to process payment batch');
      setProcessing(false);
    }
  };
  
  if (providerPaymentBatchesLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-center">Loading payment batch...</p>
        </div>
      </div>
    );
  }
  
  if (providerPaymentBatchesError) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-red-500 text-center">
            <p>Error: {providerPaymentBatchesError}</p>
            <div className="mt-4">
              <Link
                href={`/finance/tuition-credits/payment-batches/${batchId}`}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
              >
                Back to Batch Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!selectedProviderPaymentBatch) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-center">Payment batch not found</p>
          <div className="mt-4 text-center">
            <Link
              href="/finance/tuition-credits/payment-batches"
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
            >
              Back to Batches
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (selectedProviderPaymentBatch.status !== PaymentStatus.PENDING) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-amber-600 text-center">
            <p>This batch cannot be processed because its current status is {selectedProviderPaymentBatch.status}</p>
            <p className="mt-2">Only batches with PENDING status can be processed.</p>
            <div className="mt-4">
              <Link
                href={`/finance/tuition-credits/payment-batches/${batchId}`}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
              >
                Back to Batch Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Process Payment Batch</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Batch Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Batch Name:</div>
              <div className="text-lg font-semibold">{selectedProviderPaymentBatch.name}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-500">Date:</div>
              <div className="text-lg font-semibold">
                {new Date(selectedProviderPaymentBatch.date).toLocaleDateString()}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-500">Total Providers:</div>
              <div className="text-lg font-semibold">{selectedProviderPaymentBatch.providerCount}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-500">Total Amount:</div>
              <div className="text-lg font-semibold">${selectedProviderPaymentBatch.totalAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">⚠️ Warning</h3>
            <p className="text-amber-700 mb-2">
              You are about to process this payment batch. This action:
            </p>
            <ul className="list-disc pl-5 mb-2 text-amber-700">
              <li>Will mark the batch as COMPLETED</li>
              <li>Will process all payments in the batch</li>
              <li>Cannot be undone directly (payments must be voided individually)</li>
              <li>Will impact financial records and provider accounts</li>
            </ul>
            <p className="text-amber-700 font-medium">
              Please review the batch details carefully before proceeding.
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Type "PROCESS" to confirm:
            </label>
            <input
              type="text"
              id="confirmation"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="PROCESS"
            />
          </div>
          
          {processingError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {processingError}
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <Link
              href={`/finance/tuition-credits/payment-batches/${batchId}`}
              className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              onClick={handleProcess}
              disabled={processing || confirmationInput !== 'PROCESS'}
              className="px-4 py-2 bg-amber-600 text-white rounded shadow-sm hover:bg-amber-700 disabled:bg-amber-300"
            >
              {processing ? 'Processing...' : 'Process Batch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}