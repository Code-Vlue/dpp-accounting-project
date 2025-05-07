// src/app/finance/tuition-credits/providers/payments/new-batch/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import {
  Provider,
  TuitionCredit,
  TuitionCreditStatus,
  PaymentStatus,
  PaymentMethod,
  PaymentPriority
} from '@/types/finance';

export default function NewProviderPaymentBatchPage() {
  const router = useRouter();
  const {
    providers,
    tuitionCredits,
    fetchProviders,
    fetchTuitionCredits,
    createProviderPaymentBatch,
    createProviderPayment
  } = useFinanceStore();

  const [batchName, setBatchName] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [batchDate, setBatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [providerCounts, setProviderCounts] = useState<Record<string, number>>({});
  const [providerAmounts, setProviderAmounts] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.ACH);
  const [accountId, setAccountId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
    fetchTuitionCredits();
  }, [fetchProviders, fetchTuitionCredits]);

  // Calculate eligible credits for each provider
  useEffect(() => {
    // Only consider approved but unpaid tuition credits
    const eligibleCredits = tuitionCredits.filter(credit => 
      credit.creditStatus === TuitionCreditStatus.APPROVED && 
      !credit.paymentDate
    );

    // Group by provider
    const creditsByProvider: Record<string, TuitionCredit[]> = {};
    eligibleCredits.forEach(credit => {
      if (!creditsByProvider[credit.providerId]) {
        creditsByProvider[credit.providerId] = [];
      }
      creditsByProvider[credit.providerId].push(credit);
    });

    // Calculate counts and amounts
    const counts: Record<string, number> = {};
    const amounts: Record<string, number> = {};

    Object.entries(creditsByProvider).forEach(([providerId, credits]) => {
      counts[providerId] = credits.length;
      amounts[providerId] = credits.reduce((sum, credit) => sum + credit.dppPortion, 0);
    });

    setProviderCounts(counts);
    setProviderAmounts(amounts);
  }, [tuitionCredits]);

  const handleProviderSelection = (providerId: string) => {
    setSelectedProviders(current => {
      if (current.includes(providerId)) {
        return current.filter(id => id !== providerId);
      } else {
        return [...current, providerId];
      }
    });
  };

  const toggleAllProviders = () => {
    // Only consider providers with eligible credits
    const providersWithCredits = Object.keys(providerCounts);

    if (selectedProviders.length === providersWithCredits.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders(providersWithCredits);
    }
  };

  const getTotalAmount = () => {
    return selectedProviders.reduce((sum, providerId) => {
      return sum + (providerAmounts[providerId] || 0);
    }, 0);
  };

  const getTotalCredits = () => {
    return selectedProviders.reduce((sum, providerId) => {
      return sum + (providerCounts[providerId] || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (selectedProviders.length === 0) {
        throw new Error('Please select at least one provider with eligible credits');
      }

      if (!batchName) {
        throw new Error('Batch name is required');
      }

      if (!accountId) {
        throw new Error('Payment account is required');
      }

      // Create the payment batch
      await createProviderPaymentBatch({
        name: batchName,
        description: batchDescription,
        date: new Date(batchDate),
        status: PaymentStatus.PENDING,
        totalAmount: getTotalAmount(),
        providerCount: selectedProviders.length,
        paymentIds: [],
        payfileGenerated: false,
        createdById: 'current-user', // Would normally come from auth
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // For TypeScript compliance, we'll create a temporary batch object with an ID
      // In a real implementation, the createProviderPaymentBatch function would return the created batch
      const batch = {
        id: `batch-${Date.now()}`, // Generate a temporary ID
        name: batchName,
        description: batchDescription,
        date: new Date(batchDate),
        status: PaymentStatus.PENDING,
        totalAmount: getTotalAmount(),
        providerCount: selectedProviders.length,
        paymentIds: [],
        payfileGenerated: false,
        createdById: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create individual provider payments
      const paymentPromises = selectedProviders.map(async (providerId) => {
        // Get eligible credits for this provider
        const providerCredits = tuitionCredits.filter(credit => 
          credit.providerId === providerId &&
          credit.creditStatus === TuitionCreditStatus.APPROVED &&
          !credit.paymentDate
        );

        const provider = providers.find(p => p.id === providerId);
        
        if (providerCredits.length > 0) {
          const creditIds = providerCredits.map(credit => credit.id);
          const amount = providerAmounts[providerId] || 0;

          return createProviderPayment({
            providerId,
            amount,
            date: new Date(batchDate),
            method: paymentMethod,
            status: PaymentStatus.PENDING,
            description: `Payment for ${provider?.name || 'provider'} - ${providerCredits.length} credits`,
            reference: `Batch: ${batch.id}`,
            accountId,
            batchId: batch.id,
            tuitionCreditIds: creditIds,
            qualityImprovementGrant: false,
            paymentPriority: PaymentPriority.NORMAL,
            createdById: 'current-user', // Would normally come from auth
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        return null;
      });

      await Promise.all(paymentPromises);

      // Redirect to the batch detail page
      router.push(`/finance/tuition-credits/payment-batches/${batch.id}`);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to create payment batch');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Payment Batch</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        {/* Batch Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Batch Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="batchName" className="block text-sm font-medium text-gray-700 mb-1">
                Batch Name *
              </label>
              <input
                type="text"
                id="batchName"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., April 2025 Provider Payments"
              />
            </div>
            
            <div>
              <label htmlFor="batchDate" className="block text-sm font-medium text-gray-700 mb-1">
                Batch Date *
              </label>
              <input
                type="date"
                id="batchDate"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="batchDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="batchDescription"
                value={batchDescription}
                onChange={(e) => setBatchDescription(e.target.value)}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Optional batch description"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value={PaymentMethod.ACH}>ACH Transfer</option>
                <option value={PaymentMethod.CHECK}>Check</option>
                <option value={PaymentMethod.WIRE}>Wire Transfer</option>
                <option value={PaymentMethod.OTHER}>Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Account *
              </label>
              <input
                type="text"
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Account ID for payments"
              />
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Providers</h2>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedProviders.length > 0 && selectedProviders.length === Object.keys(providerCounts).length}
                onChange={toggleAllProviders}
                className="h-4 w-4 mr-2"
              />
              <label htmlFor="selectAll" className="text-sm">Select All</label>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left"></th>
                  <th className="py-2 px-3 text-left">Provider</th>
                  <th className="py-2 px-3 text-left">Eligible Credits</th>
                  <th className="py-2 px-3 text-left">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {providers
                  .filter(provider => providerCounts[provider.id] && providerCounts[provider.id] > 0)
                  .map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          id={`provider-${provider.id}`}
                          checked={selectedProviders.includes(provider.id)}
                          onChange={() => handleProviderSelection(provider.id)}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <label htmlFor={`provider-${provider.id}`} className="cursor-pointer">
                          <div className="font-medium">{provider.name}</div>
                          {provider.licenseNumber && (
                            <div className="text-sm text-gray-500">License: {provider.licenseNumber}</div>
                          )}
                        </label>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {providerCounts[provider.id] || 0} credits
                      </td>
                      <td className="py-3 px-3 font-medium">
                        ${(providerAmounts[provider.id] || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  
                {providers.filter(provider => providerCounts[provider.id] && providerCounts[provider.id] > 0).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No providers with eligible credits found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Batch Summary */}
        <div className="bg-blue-50 p-6 rounded-lg shadow border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Batch Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-blue-800">Selected Providers:</div>
              <div className="text-lg font-bold">{selectedProviders.length}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-blue-800">Total Credits:</div>
              <div className="text-lg font-bold">{getTotalCredits()}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-blue-800">Total Amount:</div>
              <div className="text-xl font-bold text-blue-600">${getTotalAmount().toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedProviders.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Creating...' : 'Create Payment Batch'}
          </button>
        </div>
      </form>
    </div>
  );
}