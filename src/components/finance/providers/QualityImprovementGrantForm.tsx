// src/components/finance/providers/QualityImprovementGrantForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { 
  Provider, 
  ProviderQualityRating,
  PaymentMethod,
  PaymentStatus,
  PaymentPriority
} from '@/types/finance';

interface QualityImprovementGrantFormProps {
  providerId: string;
}

export function QualityImprovementGrantForm({ providerId }: QualityImprovementGrantFormProps) {
  const router = useRouter();
  const { 
    providers, 
    fetchProviderById, 
    fetchProviders,
    selectedProvider,
    createProviderPayment
  } = useFinanceStore();
  
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.ACH);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProviderById(providerId);
  }, [providerId, fetchProviderById]);
  
  // Reset form when provider changes
  useEffect(() => {
    if (selectedProvider) {
      setDescription(`Quality Improvement Grant for ${selectedProvider.name}`);
      
      // Set default values based on provider info
      if (selectedProvider.paymentMethod) {
        setPaymentMethod(selectedProvider.paymentMethod);
      }
      
      // Suggest a reason based on quality rating
      if (selectedProvider.qualityRating) {
        let defaultReason = '';
        switch (selectedProvider.qualityRating) {
          case ProviderQualityRating.LEVEL_1:
            defaultReason = 'Quality improvement to support advancement to Level 2 rating';
            break;
          case ProviderQualityRating.LEVEL_2:
            defaultReason = 'Quality improvement to support advancement to Level 3 rating';
            break;
          case ProviderQualityRating.LEVEL_3:
            defaultReason = 'Quality improvement to support advancement to Level 4 rating';
            break;
          case ProviderQualityRating.LEVEL_4:
            defaultReason = 'Quality improvement to support advancement to Level 5 rating';
            break;
          case ProviderQualityRating.LEVEL_5:
            defaultReason = 'Quality improvement to maintain Level 5 rating excellence';
            break;
          default:
            defaultReason = 'Quality improvement to support initial quality rating';
        }
        setReason(defaultReason);
      }
    }
  }, [selectedProvider]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProvider) {
      setErrorMessage('Provider information not available');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid grant amount');
      return;
    }
    
    if (!accountId) {
      setErrorMessage('Payment account is required');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Create a provider payment with the grant flag
      await createProviderPayment({
        providerId,
        amount: parseFloat(amount),
        date: new Date(paymentDate),
        method: paymentMethod,
        status: PaymentStatus.PENDING,
        description: description,
        reference: `Quality Improvement Grant - ${new Date().toISOString().split('T')[0]}`,
        accountId,
        tuitionCreditIds: [], // No tuition credits associated with grants
        qualityImprovementGrant: true,
        grantAmount: parseFloat(amount),
        grantReason: reason,
        paymentPriority: PaymentPriority.NORMAL,
        createdById: 'current-user', // Would normally come from auth
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Navigate back to provider detail page
      router.push(`/finance/tuition-credits/providers/${providerId}`);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to create quality improvement grant');
      setIsSubmitting(false);
    }
  };
  
  if (!selectedProvider) {
    return <div className="p-6">Loading provider information...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Provider Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Provider Name</label>
            <div className="mt-1 p-2 bg-gray-100 rounded">
              {selectedProvider.name}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Quality Rating</label>
            <div className="mt-1 p-2 bg-gray-100 rounded">
              {selectedProvider.qualityRating || 'Not Rated'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <div className="mt-1 p-2 bg-gray-100 rounded">
              {selectedProvider.licenseNumber || 'Not Available'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Provider Type</label>
            <div className="mt-1 p-2 bg-gray-100 rounded">
              {selectedProvider.providerType}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Grant Date</label>
            <div className="mt-1 p-2 bg-gray-100 rounded">
              {selectedProvider.lastQualityImprovementGrantDate ? 
                new Date(selectedProvider.lastQualityImprovementGrantDate).toLocaleDateString() : 
                'No Previous Grants'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Eligible for Grant</label>
            <div className="mt-1 p-2 bg-gray-100 rounded">
              {selectedProvider.qualityImprovementGrantEligible ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Grant Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Grant Amount *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full p-2 pl-8 border border-gray-300 rounded"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              id="paymentDate"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Quality Improvement Grant for Provider"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Grant Reason *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Explain the reason for this quality improvement grant"
            />
          </div>
          
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
              <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
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
              placeholder="Account ID for grant payment"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !selectedProvider.qualityImprovementGrantEligible}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Processing...' : 'Create Quality Improvement Grant'}
        </button>
      </div>
    </form>
  );
}