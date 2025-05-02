// src/app/finance/tuition-credits/payment-batches/[id]/generate-payfile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { PaymentStatus } from '@/types/finance';

export default function GeneratePayfilePage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  
  const { 
    selectedProviderPaymentBatch,
    providerPaymentBatchesLoading,
    providerPaymentBatchesError,
    fetchProviderPaymentBatchById,
    generatePayfileForBatch
  } = useFinanceStore();
  
  const [confirmationInput, setConfirmationInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProviderPaymentBatchById(batchId);
  }, [batchId, fetchProviderPaymentBatchById]);
  
  const handleGeneratePayfile = async () => {
    if (!selectedProviderPaymentBatch) return;
    
    if (confirmationInput !== 'GENERATE') {
      setGenerationError('Please type GENERATE to confirm');
      return;
    }
    
    setGenerating(true);
    setGenerationError(null);
    
    try {
      await generatePayfileForBatch(batchId);
      router.push(`/finance/tuition-credits/payment-batches/${batchId}`);
    } catch (error: any) {
      setGenerationError(error.message || 'Failed to generate payfile');
      setGenerating(false);
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
  
  if (selectedProviderPaymentBatch.status !== PaymentStatus.COMPLETED && 
      selectedProviderPaymentBatch.status !== PaymentStatus.PROCESSING) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-amber-600 text-center">
            <p>This batch cannot have a payfile generated because its current status is {selectedProviderPaymentBatch.status}</p>
            <p className="mt-2">Only batches with COMPLETED or PROCESSING status can have payfiles generated.</p>
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
  
  if (selectedProviderPaymentBatch.payfileGenerated) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-600 mb-3">Payfile Already Generated</h2>
            <p className="mb-4">A payfile has already been generated for this batch.</p>
            {selectedProviderPaymentBatch.payfileUrl && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg inline-block mx-auto">
                <p className="font-medium text-green-800 mb-2">Payfile URL:</p>
                <p className="text-green-700">{selectedProviderPaymentBatch.payfileUrl}</p>
                <div className="mt-3">
                  <a 
                    href={selectedProviderPaymentBatch.payfileUrl}
                    download
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Download Payfile
                  </a>
                </div>
              </div>
            )}
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
        <h1 className="text-3xl font-bold">Generate Payfile</h1>
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
            
            <div>
              <div className="text-sm font-medium text-gray-500">Status:</div>
              <div className="text-lg font-semibold">{selectedProviderPaymentBatch.status}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-500">Total Payments:</div>
              <div className="text-lg font-semibold">{selectedProviderPaymentBatch.paymentIds.length}</div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Generate Payment File</h3>
            <p className="text-blue-700 mb-2">
              You are about to generate a payment file for ACH/direct deposit processing. This action:
            </p>
            <ul className="list-disc pl-5 mb-2 text-blue-700">
              <li>Will create a standardized payment file that can be uploaded to your banking system</li>
              <li>Will mark the batch as having a payment file generated</li>
              <li>Does not initiate the actual funds transfer (this must be done in your banking system)</li>
            </ul>
            <p className="text-blue-700 font-medium">
              Please verify that all payment information is correct before generating the file.
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Type "GENERATE" to confirm:
            </label>
            <input
              type="text"
              id="confirmation"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="GENERATE"
            />
          </div>
          
          {generationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {generationError}
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
              onClick={handleGeneratePayfile}
              disabled={generating || confirmationInput !== 'GENERATE'}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
            >
              {generating ? 'Generating...' : 'Generate Payfile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}