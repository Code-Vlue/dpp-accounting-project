// src/components/finance/providers/ProviderTaxInformationForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { 
  Provider, 
  TaxFormType
} from '@/types/finance';

interface ProviderTaxInformationFormProps {
  providerId: string;
}

export function ProviderTaxInformationForm({ providerId }: ProviderTaxInformationFormProps) {
  const router = useRouter();
  const { 
    fetchProviderById,
    selectedProvider,
    updateProvider
  } = useFinanceStore();
  
  const [taxIdentification, setTaxIdentification] = useState<string>('');
  const [taxForm, setTaxForm] = useState<TaxFormType>(TaxFormType.W9);
  const [taxFormReceived, setTaxFormReceived] = useState<boolean>(false);
  const [taxFormDate, setTaxFormDate] = useState<string>('');
  const [taxFormExpiration, setTaxFormExpiration] = useState<string>('');
  const [taxExempt, setTaxExempt] = useState<boolean>(false);
  const [taxExemptReason, setTaxExemptReason] = useState<string>('');
  const [backupWithholding, setBackupWithholding] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProviderById(providerId);
  }, [providerId, fetchProviderById]);
  
  // Initialize form with provider data when it's loaded
  useEffect(() => {
    if (selectedProvider) {
      setTaxIdentification(selectedProvider.taxIdentification || '');
      setTaxForm(selectedProvider.taxForm || TaxFormType.W9);
      setNotes(selectedProvider.notes || '');
      
      // Additional tax fields would be populated here if they were in the provider model
      // For this demo, we're using state variables for the additional fields
    }
  }, [selectedProvider]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProvider) {
      setErrorMessage('Provider information not available');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Update provider with tax information
      await updateProvider(providerId, {
        taxIdentification,
        taxForm,
        notes: `${notes}\n\nTax Information Updated: ${new Date().toLocaleDateString()}\n` +
              `Tax Form Received: ${taxFormReceived ? 'Yes' : 'No'}\n` +
              (taxFormDate ? `Tax Form Date: ${taxFormDate}\n` : '') +
              (taxFormExpiration ? `Tax Form Expiration: ${taxFormExpiration}\n` : '') +
              `Tax Exempt: ${taxExempt ? 'Yes' : 'No'}\n` +
              (taxExemptReason ? `Tax Exempt Reason: ${taxExemptReason}\n` : '') +
              `Backup Withholding: ${backupWithholding ? 'Yes' : 'No'}`
      });
      
      // Navigate back to provider detail page
      router.push(`/finance/tuition-credits/providers/${providerId}`);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update tax information');
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
            <label className="block text-sm font-medium text-gray-700">Provider ID</label>
            <div className="mt-1 p-2 bg-gray-100 rounded">
              {selectedProvider.vendorNumber}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Tax Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="taxIdentification" className="block text-sm font-medium text-gray-700 mb-1">
              Tax Identification Number (EIN/SSN) *
            </label>
            <input
              type="text"
              id="taxIdentification"
              value={taxIdentification}
              onChange={(e) => setTaxIdentification(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="XX-XXXXXXX or XXX-XX-XXXX"
            />
          </div>
          
          <div>
            <label htmlFor="taxForm" className="block text-sm font-medium text-gray-700 mb-1">
              Tax Form Type *
            </label>
            <select
              id="taxForm"
              value={taxForm}
              onChange={(e) => setTaxForm(e.target.value as TaxFormType)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={TaxFormType.W9}>W-9 (US Person or Entity)</option>
              <option value={TaxFormType.W8BEN}>W-8BEN (Foreign Individual)</option>
              <option value={TaxFormType.W8BENE}>W-8BEN-E (Foreign Entity)</option>
              <option value={TaxFormType.FORM_1099}>1099 (Independent Contractor)</option>
              <option value={TaxFormType.OTHER}>Other Tax Form</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="taxFormReceived"
              checked={taxFormReceived}
              onChange={(e) => setTaxFormReceived(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="taxFormReceived" className="text-sm font-medium text-gray-700">
              Tax Form Received
            </label>
          </div>
          
          {taxFormReceived && (
            <>
              <div>
                <label htmlFor="taxFormDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Form Received Date
                </label>
                <input
                  type="date"
                  id="taxFormDate"
                  value={taxFormDate}
                  onChange={(e) => setTaxFormDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label htmlFor="taxFormExpiration" className="block text-sm font-medium text-gray-700 mb-1">
                  Form Expiration Date
                </label>
                <input
                  type="date"
                  id="taxFormExpiration"
                  value={taxFormExpiration}
                  onChange={(e) => setTaxFormExpiration(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </>
          )}
          
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="taxExempt"
              checked={taxExempt}
              onChange={(e) => setTaxExempt(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="taxExempt" className="text-sm font-medium text-gray-700">
              Tax Exempt
            </label>
          </div>
          
          {taxExempt && (
            <div className="md:col-span-2">
              <label htmlFor="taxExemptReason" className="block text-sm font-medium text-gray-700 mb-1">
                Tax Exempt Reason
              </label>
              <input
                type="text"
                id="taxExemptReason"
                value={taxExemptReason}
                onChange={(e) => setTaxExemptReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., 501(c)(3) Non-profit organization"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="backupWithholding"
              checked={backupWithholding}
              onChange={(e) => setBackupWithholding(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="backupWithholding" className="text-sm font-medium text-gray-700">
              Subject to Backup Withholding
            </label>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Additional tax information notes"
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
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : 'Save Tax Information'}
        </button>
      </div>
    </form>
  );
}