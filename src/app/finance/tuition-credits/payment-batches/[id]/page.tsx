// src/app/finance/tuition-credits/payment-batches/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import {
  PaymentStatus,
  Provider,
  ProviderPayment,
  TuitionCredit
} from '@/types/finance';

export default function ProviderPaymentBatchDetailsPage() {
  const params = useParams();
  // Unused variable prefixed with underscore
  const _router = useRouter();
  const batchId = params.id as string;
  
  const {
    providers,
    providerPayments,
    tuitionCredits,
    selectedProviderPaymentBatch,
    fetchProviders,
    fetchProviderPayments,
    fetchTuitionCredits,
    fetchProviderPaymentBatchById,
    processProviderPaymentBatch,
    generatePayfileForBatch
  } = useFinanceStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPayfile, setIsGeneratingPayfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
    fetchProviderPayments();
    fetchTuitionCredits();
    fetchProviderPaymentBatchById(batchId);
  }, [batchId, fetchProviders, fetchProviderPayments, fetchTuitionCredits, fetchProviderPaymentBatchById]);

  // Filter payments for this batch
  const batchPayments = providerPayments.filter(payment => payment.batchId === batchId);

  // Get tuition credits for all payments in this batch
  const creditIds = batchPayments.flatMap(payment => payment.tuitionCreditIds);
  const batchCredits = tuitionCredits.filter(credit => creditIds.includes(credit.id));

  // Group payments by provider
  const paymentsByProvider: Record<string, ProviderPayment[]> = {};
  batchPayments.forEach(payment => {
    if (!paymentsByProvider[payment.providerId]) {
      paymentsByProvider[payment.providerId] = [];
    }
    paymentsByProvider[payment.providerId].push(payment);
  });

  const handleProcessBatch = async () => {
    if (!selectedProviderPaymentBatch) return;
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      await processProviderPaymentBatch(batchId, 'current-user'); // Would normally use actual user ID from auth
      fetchProviderPaymentBatchById(batchId);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to process payment batch');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePayfile = async () => {
    if (!selectedProviderPaymentBatch) return;
    
    setIsGeneratingPayfile(true);
    setErrorMessage(null);
    
    try {
      await generatePayfileForBatch(batchId);
      fetchProviderPaymentBatchById(batchId);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to generate payfile');
    } finally {
      setIsGeneratingPayfile(false);
    }
  };

  if (!selectedProviderPaymentBatch) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-center">Loading payment batch details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Batch Details</h1>
        <div className="flex space-x-2">
          {selectedProviderPaymentBatch.status === PaymentStatus.PENDING && (
            <button
              onClick={handleProcessBatch}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700 disabled:bg-green-400"
            >
              {isProcessing ? 'Processing...' : 'Process Batch'}
            </button>
          )}
          
          {(selectedProviderPaymentBatch.status === PaymentStatus.COMPLETED || 
            selectedProviderPaymentBatch.status === PaymentStatus.PROCESSING) && 
            !selectedProviderPaymentBatch.payfileGenerated && (
            <button
              onClick={handleGeneratePayfile}
              disabled={isGeneratingPayfile}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isGeneratingPayfile ? 'Generating...' : 'Generate Payfile'}
            </button>
          )}
          
          <Link
            href="/finance/tuition-credits/payment-batches"
            className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 hover:bg-gray-50"
          >
            Back to Batches
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {errorMessage}
        </div>
      )}

      {/* Batch Summary */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Batch Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Batch Name:</div>
            <div className="text-lg font-semibold">{selectedProviderPaymentBatch.name}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Batch Date:</div>
            <div className="text-lg font-semibold">
              {new Date(selectedProviderPaymentBatch.date).toLocaleDateString()}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Status:</div>
            <div className="text-lg font-semibold">
              <span className={`px-2 py-1 text-sm rounded-full ${getBatchStatusColor(selectedProviderPaymentBatch.status)}`}>
                {selectedProviderPaymentBatch.status}
              </span>
              {selectedProviderPaymentBatch.payfileGenerated && (
                <span className="ml-2 px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  Payfile Generated
                </span>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Description:</div>
            <div className="text-base">
              {selectedProviderPaymentBatch.description || 'No description provided'}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Created:</div>
            <div className="text-base">
              {new Date(selectedProviderPaymentBatch.createdAt).toLocaleString()}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Last Updated:</div>
            <div className="text-base">
              {new Date(selectedProviderPaymentBatch.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg">
          <div>
            <div className="text-sm font-medium text-blue-800">Providers:</div>
            <div className="text-xl font-bold">{selectedProviderPaymentBatch.providerCount}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-blue-800">Payments:</div>
            <div className="text-xl font-bold">{selectedProviderPaymentBatch.paymentIds.length}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-blue-800">Total Amount:</div>
            <div className="text-xl font-bold text-blue-600">
              ${selectedProviderPaymentBatch.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
        
        {selectedProviderPaymentBatch.payfileGenerated && selectedProviderPaymentBatch.payfileUrl && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
            <div>
              <span className="font-medium text-green-700">Payfile Ready:</span>
              <span className="ml-2 text-green-700">{selectedProviderPaymentBatch.payfileUrl}</span>
            </div>
            <a 
              href={selectedProviderPaymentBatch.payfileUrl}
              download
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Download
            </a>
          </div>
        )}
      </div>

      {/* Provider Payments */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Provider Payments</h2>
        
        {Object.entries(paymentsByProvider).length === 0 ? (
          <p className="text-center text-gray-500 py-4">No payments found in this batch.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left">Provider</th>
                  <th className="py-2 px-3 text-left">Payment ID</th>
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-left">Method</th>
                  <th className="py-2 px-3 text-left">Credits</th>
                  <th className="py-2 px-3 text-left">Amount</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(paymentsByProvider).map(([providerId, payments]) => {
                  const provider = providers.find(p => p.id === providerId);
                  
                  return payments.map((payment, index) => {
                    const creditCount = payment.tuitionCreditIds.length;
                    
                    return (
                      <tr key={payment.id} className={index === 0 ? "border-t-2 border-gray-200" : ""}>
                        <td className="py-3 px-3">
                          {index === 0 && (
                            <div className="font-medium">{provider?.name || 'Unknown Provider'}</div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium">{payment.id.substring(0, 8)}...</div>
                          <div className="text-xs text-gray-500">{payment.description}</div>
                        </td>
                        <td className="py-3 px-3">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          {payment.method}
                        </td>
                        <td className="py-3 px-3">
                          {creditCount}
                        </td>
                        <td className="py-3 px-3 font-medium">
                          ${payment.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <Link
                            href={`/finance/tuition-credits/payments/${payment.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credits Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Tuition Credits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Total Credits:</div>
            <div className="text-lg font-semibold">{batchCredits.length}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Total Students:</div>
            <div className="text-lg font-semibold">
              {new Set(batchCredits.map(credit => credit.studentId)).size}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 text-left">Provider</th>
                <th className="py-2 px-3 text-left">Student</th>
                <th className="py-2 px-3 text-left">Credit Period</th>
                <th className="py-2 px-3 text-left">Amount</th>
                <th className="py-2 px-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {batchCredits.map((credit) => {
                const provider = providers.find(p => p.id === credit.providerId);
                
                return (
                  <tr key={credit.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      {provider?.name || 'Unknown Provider'}
                    </td>
                    <td className="py-2 px-3">
                      {credit.studentName}
                    </td>
                    <td className="py-2 px-3">
                      {formatDateRange(credit.creditPeriodStart, credit.creditPeriodEnd)}
                    </td>
                    <td className="py-2 px-3 font-medium">
                      ${credit.dppPortion.toLocaleString()}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCreditStatusColor(credit.creditStatus)}`}>
                        {credit.creditStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {batchCredits.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No tuition credits found for this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
    day: 'numeric'
  });
  
  return `${start} - ${end}`;
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

function getPaymentStatusColor(status: PaymentStatus): string {
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

function getCreditStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'PENDING_APPROVAL':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800';
    case 'PROCESSED':
      return 'bg-indigo-100 text-indigo-800';
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'VOIDED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}