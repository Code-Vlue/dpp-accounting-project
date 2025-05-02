// src/components/finance/tuition-credits/TuitionCreditForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { 
  TuitionCredit, 
  TuitionCreditStatus, 
  Provider, 
  TransactionType 
} from '@/types/finance';

interface TuitionCreditFormProps {
  creditId?: string;
  providerId?: string;
  isEdit?: boolean;
  isAdjustment?: boolean;
  originalCreditId?: string;
}

export default function TuitionCreditForm({ 
  creditId, 
  providerId, 
  isEdit = false, 
  isAdjustment = false,
  originalCreditId
}: TuitionCreditFormProps) {
  const router = useRouter();
  const { 
    providers,
    selectedTuitionCredit, 
    tuitionCreditDraft,
    tuitionCreditsLoading, 
    tuitionCreditsError, 
    fetchProviders,
    fetchTuitionCreditById, 
    setTuitionCreditFormField,
    createTuitionCredit, 
    updateTuitionCredit,
    resetTuitionCreditForm
  } = useFinanceStore();
  
  const [formData, setFormData] = useState({
    ...tuitionCreditDraft
  });
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load providers and credit data if editing
  useEffect(() => {
    fetchProviders();
    
    if ((isEdit || isAdjustment) && creditId) {
      fetchTuitionCreditById(creditId);
    } else {
      resetTuitionCreditForm();
    }
    
    // If providerId is provided, set it in the form
    if (providerId && !isEdit && !isAdjustment) {
      setFormData({
        ...formData,
        providerId
      });
      setTuitionCreditFormField('providerId', providerId);
    }
    
    return () => {
      resetTuitionCreditForm();
    };
  }, [fetchProviders, fetchTuitionCreditById, isEdit, isAdjustment, creditId, providerId, resetTuitionCreditForm]);
  
  // Populate form with credit data when it's loaded
  useEffect(() => {
    if ((isEdit || isAdjustment) && selectedTuitionCredit) {
      if (isAdjustment) {
        // For adjustment, create a new form with reference to original credit
        setFormData({
          ...tuitionCreditDraft,
          providerId: selectedTuitionCredit.providerId,
          studentId: selectedTuitionCredit.studentId,
          studentName: selectedTuitionCredit.studentName,
          creditPeriodStart: selectedTuitionCredit.creditPeriodStart,
          creditPeriodEnd: selectedTuitionCredit.creditPeriodEnd,
          creditAmount: 0, // Start with zero for adjustment
          familyPortion: 0,
          dppPortion: 0,
          description: `Adjustment for credit ${selectedTuitionCredit.id.substring(0, 8)}`,
          isAdjustment: true,
          originalCreditId: selectedTuitionCredit.id
        });
      } else {
        // For edit, use all the original credit data
        setFormData({
          ...selectedTuitionCredit,
          // Convert string dates back to Date objects if needed
          creditPeriodStart: new Date(selectedTuitionCredit.creditPeriodStart),
          creditPeriodEnd: new Date(selectedTuitionCredit.creditPeriodEnd)
        });
      }
    }
  }, [isEdit, isAdjustment, selectedTuitionCredit, tuitionCreditDraft]);
  
  // Update store's draft when form changes
  useEffect(() => {
    Object.keys(formData).forEach(key => {
      setTuitionCreditFormField(key, formData[key]);
    });
  }, [formData, setTuitionCreditFormField]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'creditPeriodStart' || name === 'creditPeriodEnd') {
      setFormData({
        ...formData,
        [name]: new Date(value)
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else if (type === 'number') {
      // Handle amount fields
      const numValue = parseFloat(value);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? 0 : numValue
      });
      
      // Auto-calculate total if dppPortion or familyPortion is changed
      if (name === 'dppPortion' || name === 'familyPortion') {
        const dppPortion = name === 'dppPortion' ? numValue : formData.dppPortion;
        const familyPortion = name === 'familyPortion' ? numValue : formData.familyPortion;
        
        setFormData(prev => ({
          ...prev,
          creditAmount: dppPortion + familyPortion,
          [name]: isNaN(numValue) ? 0 : numValue
        }));
      }
      
      // Auto-calculate portions if creditAmount is changed
      if (name === 'creditAmount') {
        // By default, all goes to DPP portion when total is changed
        setFormData(prev => ({
          ...prev,
          dppPortion: isNaN(numValue) ? 0 : numValue,
          familyPortion: 0
        }));
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      if (isEdit && creditId) {
        // Update existing credit
        await updateTuitionCredit(creditId, formData);
        router.push(`/finance/tuition-credits/credits/${creditId}`);
      } else {
        // Create new credit or adjustment
        const creditData = {
          ...formData,
          type: TransactionType.TUITION_CREDIT,
          isAdjustment: isAdjustment,
          creditStatus: TuitionCreditStatus.DRAFT,
          originalCreditId: isAdjustment ? originalCreditId || selectedTuitionCredit?.id : undefined
        };
        
        const newCredit = await createTuitionCredit(creditData);
        router.push(`/finance/tuition-credits/credits/${newCredit.id}`);
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save tuition credit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if ((isEdit || isAdjustment) && tuitionCreditsLoading) {
    return <div className="p-4 text-center">Loading tuition credit data...</div>;
  }
  
  if ((isEdit || isAdjustment) && tuitionCreditsError) {
    return <div className="p-4 text-center text-red-500">Error loading tuition credit: {tuitionCreditsError}</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">
          {isAdjustment ? 'Tuition Credit Adjustment' : 'Tuition Credit Information'}
        </h3>
        
        {isAdjustment && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            <p>This is an adjustment to an existing tuition credit. The adjustment amount can be positive or negative.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="providerId" className="block text-sm font-medium text-gray-700 mb-1">
              Provider *
            </label>
            <select
              id="providerId"
              name="providerId"
              value={formData.providerId}
              onChange={handleInputChange}
              required
              disabled={isEdit || isAdjustment}
              className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
            >
              <option value="">Select Provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
              Student ID *
            </label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              required
              disabled={isAdjustment}
              className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
              Student Name *
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleInputChange}
              required
              disabled={isAdjustment}
              className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
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
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Credit Period and Amounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="creditPeriodStart" className="block text-sm font-medium text-gray-700 mb-1">
              Period Start Date *
            </label>
            <input
              type="date"
              id="creditPeriodStart"
              name="creditPeriodStart"
              value={formData.creditPeriodStart ? formData.creditPeriodStart.toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              required
              disabled={isAdjustment}
              className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="creditPeriodEnd" className="block text-sm font-medium text-gray-700 mb-1">
              Period End Date *
            </label>
            <input
              type="date"
              id="creditPeriodEnd"
              name="creditPeriodEnd"
              value={formData.creditPeriodEnd ? formData.creditPeriodEnd.toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              required
              disabled={isAdjustment}
              className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="creditAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Total Credit Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="creditAmount"
                name="creditAmount"
                value={formData.creditAmount}
                onChange={handleInputChange}
                required
                min={isAdjustment ? null : 0}
                step="0.01"
                className="w-full pl-7 p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dppPortion" className="block text-sm font-medium text-gray-700 mb-1">
                DPP Portion *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="dppPortion"
                  name="dppPortion"
                  value={formData.dppPortion}
                  onChange={handleInputChange}
                  required
                  min={isAdjustment ? null : 0}
                  step="0.01"
                  className="w-full pl-7 p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="familyPortion" className="block text-sm font-medium text-gray-700 mb-1">
                Family Portion *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="familyPortion"
                  name="familyPortion"
                  value={formData.familyPortion}
                  onChange={handleInputChange}
                  required
                  min={isAdjustment ? null : 0}
                  step="0.01"
                  className="w-full pl-7 p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
          
          {isAdjustment && (
            <div className="md:col-span-2">
              <label htmlFor="adjustmentNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment Notes *
              </label>
              <textarea
                id="adjustmentNotes"
                name="adjustmentNotes"
                value={formData.adjustmentNotes || ''}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Please explain the reason for this adjustment"
              />
            </div>
          )}
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
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Credit' : isAdjustment ? 'Create Adjustment' : 'Create Credit'}
        </button>
      </div>
    </form>
  );
}