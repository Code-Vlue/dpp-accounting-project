// src/components/finance/tuition-credits/TuitionCreditBatchForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCredit, TuitionCreditStatus, Provider } from '@/types/finance';

interface TuitionCreditBatchFormProps {
  batchId?: string;
  isEdit?: boolean;
}

export default function TuitionCreditBatchForm({ batchId, isEdit = false }: TuitionCreditBatchFormProps) {
  const router = useRouter();
  const { 
    providers,
    tuitionCredits,
    selectedTuitionCreditBatch,
    tuitionCreditBatchesLoading, 
    tuitionCreditBatchesError,
    fetchProviders,
    fetchTuitionCredits,
    fetchTuitionCreditBatchById,
    createTuitionCreditBatch,
    updateTuitionCreditBatch 
  } = useFinanceStore();
  
  // Filter for eligible credits (approved but not in a batch)
  const eligibleCredits = tuitionCredits.filter(
    credit => credit.creditStatus === TuitionCreditStatus.APPROVED && !credit.paymentBatchId
  );
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    periodStart: new Date(),
    periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    providerIds: [] as string[],
    creditIds: [] as string[],
    notes: ''
  });
  
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedCredits, setSelectedCredits] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load providers, credits and batch data if editing
  useEffect(() => {
    fetchProviders();
    fetchTuitionCredits();
    
    if (isEdit && batchId) {
      fetchTuitionCreditBatchById(batchId);
    }
  }, [fetchProviders, fetchTuitionCredits, fetchTuitionCreditBatchById, isEdit, batchId]);
  
  // Populate form with batch data when it's loaded
  useEffect(() => {
    if (isEdit && selectedTuitionCreditBatch) {
      setFormData({
        name: selectedTuitionCreditBatch.name || '',
        description: selectedTuitionCreditBatch.description || '',
        periodStart: new Date(selectedTuitionCreditBatch.periodStart),
        periodEnd: new Date(selectedTuitionCreditBatch.periodEnd),
        providerIds: selectedTuitionCreditBatch.providerIds || [],
        creditIds: selectedTuitionCreditBatch.creditIds || [],
        notes: selectedTuitionCreditBatch.notes || ''
      });
      
      setSelectedProviders(selectedTuitionCreditBatch.providerIds || []);
      setSelectedCredits(selectedTuitionCreditBatch.creditIds || []);
    }
  }, [isEdit, selectedTuitionCreditBatch]);
  
  // Filter credits by selected providers
  const creditsForSelectedProviders = eligibleCredits.filter(
    credit => selectedProviders.length === 0 || selectedProviders.includes(credit.providerId)
  );
  
  // Calculate total amount
  const totalAmount = selectedCredits
    .map(id => eligibleCredits.find(credit => credit.id === id))
    .filter(Boolean)
    .reduce((sum, credit) => sum + (credit?.creditAmount || 0), 0);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'periodStart' || name === 'periodEnd') {
      setFormData({
        ...formData,
        [name]: new Date(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleProviderSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedProviders(selectedOptions);
    setFormData({
      ...formData,
      providerIds: selectedOptions
    });
    
    // Clear previously selected credits when providers change
    setSelectedCredits([]);
    setFormData(prev => ({
      ...prev,
      creditIds: []
    }));
  };
  
  const handleCreditSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedCredits(selectedOptions);
    setFormData({
      ...formData,
      creditIds: selectedOptions
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    if (formData.creditIds.length === 0) {
      setSubmitError('Please select at least one tuition credit for this batch.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (isEdit && batchId) {
        // Update existing batch
        await updateTuitionCreditBatch(batchId, {
          ...formData,
          totalAmount
        });
        router.push(`/finance/tuition-credits/batches/${batchId}`);
      } else {
        // Create new batch
        const newBatch = await createTuitionCreditBatch({
          ...formData,
          status: TuitionCreditStatus.DRAFT,
          totalAmount
        });
        router.push(`/finance/tuition-credits/batches/${newBatch.id}`);
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save tuition credit batch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (tuitionCreditBatchesLoading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }
  
  if (tuitionCreditBatchesError) {
    return <div className="p-4 text-center text-red-500">Error: {tuitionCreditBatchesError}</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Batch Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Batch Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="periodStart" className="block text-sm font-medium text-gray-700 mb-1">
              Period Start Date *
            </label>
            <input
              type="date"
              id="periodStart"
              name="periodStart"
              value={formData.periodStart ? formData.periodStart.toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="periodEnd" className="block text-sm font-medium text-gray-700 mb-1">
              Period End Date *
            </label>
            <input
              type="date"
              id="periodEnd"
              name="periodEnd"
              value={formData.periodEnd ? formData.periodEnd.toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Provider Selection</h3>
        <div>
          <label htmlFor="providerIds" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Providers (Optional)
          </label>
          <select
            id="providerIds"
            name="providerIds"
            multiple
            value={selectedProviders}
            onChange={handleProviderSelection}
            className="w-full p-2 border border-gray-300 rounded h-40"
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Hold Ctrl (or Cmd) to select multiple providers. Leave empty to include all providers.
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Credit Selection</h3>
        <div>
          <label htmlFor="creditIds" className="block text-sm font-medium text-gray-700 mb-1">
            Select Tuition Credits for Batch *
          </label>
          <select
            id="creditIds"
            name="creditIds"
            multiple
            value={selectedCredits}
            onChange={handleCreditSelection}
            required
            className="w-full p-2 border border-gray-300 rounded h-60"
          >
            {creditsForSelectedProviders.length === 0 ? (
              <option disabled value="">No eligible credits found for selected providers</option>
            ) : (
              creditsForSelectedProviders.map(credit => (
                <option key={credit.id} value={credit.id}>
                  {credit.studentName} (${credit.creditAmount.toLocaleString()}) - {getProviderName(credit.providerId, providers)}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Hold Ctrl (or Cmd) to select multiple credits. Only approved credits that are not in a batch are shown.
          </p>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
            <p className="font-semibold">Batch Summary:</p>
            <ul className="mt-2">
              <li>Selected Credits: {selectedCredits.length}</li>
              <li>Total Amount: ${totalAmount.toLocaleString()}</li>
              <li>Providers: {Array.from(new Set(selectedCredits.map(id => 
                eligibleCredits.find(credit => credit.id === id)?.providerId
              ).filter(Boolean))).length}</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Batch Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      
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
          disabled={isSubmitting || selectedCredits.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Batch' : 'Create Batch'}
        </button>
      </div>
    </form>
  );
}

// Helper function to get provider name
function getProviderName(providerId: string, providers: Provider[]): string {
  const provider = providers.find(p => p.id === providerId);
  return provider ? provider.name : `Provider ${providerId.substring(0, 8)}`;
}