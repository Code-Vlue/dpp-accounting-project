// src/components/finance/tuition-credits/ProviderPaymentForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { 
  Provider, 
  TuitionCredit, 
  PaymentMethod, 
  PaymentStatus,
  PaymentPriority 
} from '@/types/finance';

interface ProviderPaymentFormProps {
  paymentId?: string;
  providerId?: string;
  batchId?: string;
  isEdit?: boolean;
  providers?: Provider[];
  eligibleCredits?: TuitionCredit[];
  paymentDraft?: Partial<{
    providerId: string;
    amount: number;
    date: Date;
    method: PaymentMethod;
    description: string;
    reference: string;
    accountId: string;
    tuitionCreditIds: string[];
    qualityImprovementGrant: boolean;
    grantAmount: number;
    grantReason: string;
    notes: string;
    paymentPriority: PaymentPriority;
  }>;
  onUpdatePayment?: (field: string, value: any) => void;
  onSubmit?: () => Promise<void>;
  loading?: boolean;
}

export default function ProviderPaymentForm({ 
  paymentId, 
  providerId, 
  batchId,
  isEdit = false,
  providers: propProviders,
  eligibleCredits: propEligibleCredits,
  paymentDraft: propPaymentDraft,
  onUpdatePayment,
  onSubmit: externalSubmit,
  loading: propLoading
}: ProviderPaymentFormProps) {
  const router = useRouter();
  const { 
    providers,
    tuitionCredits,
    selectedProviderPayment,
    providerPaymentsLoading, 
    providerPaymentsError,
    fetchProviders,
    fetchTuitionCredits,
    fetchProviderPaymentById,
    createProviderPayment,
    updateProviderPayment 
  } = useFinanceStore();
  
  // Find provider from providerId
  const provider = providers.find(p => p.id === providerId);
  
  // Filter for eligible credits for this provider
  const eligibleCredits = tuitionCredits.filter(
    credit => credit.providerId === providerId && !credit.paymentDate
  );
  
  const [formData, setFormData] = useState({
    providerId: providerId || '',
    amount: 0,
    date: new Date(),
    method: provider?.paymentMethod || PaymentMethod.ACH,
    description: `Provider payment for ${provider?.name || 'selected provider'}`,
    reference: '',
    accountId: '',
    tuitionCreditIds: [] as string[],
    qualityImprovementGrant: false,
    grantAmount: 0,
    grantReason: '',
    notes: '',
    paymentPriority: PaymentPriority.NORMAL
  });
  
  const [selectedCredits, setSelectedCredits] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load providers, credits and payment data if editing
  useEffect(() => {
    fetchProviders();
    fetchTuitionCredits();
    
    if (isEdit && paymentId) {
      fetchProviderPaymentById(paymentId);
    }
  }, [fetchProviders, fetchTuitionCredits, fetchProviderPaymentById, isEdit, paymentId]);
  
  // Populate form with payment data when it's loaded
  useEffect(() => {
    if (isEdit && selectedProviderPayment) {
      setFormData({
        providerId: selectedProviderPayment.providerId,
        amount: selectedProviderPayment.amount,
        date: new Date(selectedProviderPayment.date),
        method: selectedProviderPayment.method,
        description: selectedProviderPayment.description,
        reference: selectedProviderPayment.reference || '',
        accountId: selectedProviderPayment.accountId,
        tuitionCreditIds: selectedProviderPayment.tuitionCreditIds || [],
        qualityImprovementGrant: selectedProviderPayment.qualityImprovementGrant,
        grantAmount: selectedProviderPayment.grantAmount || 0,
        grantReason: selectedProviderPayment.grantReason || '',
        notes: selectedProviderPayment.notes || '',
        paymentPriority: selectedProviderPayment.paymentPriority
      });
      
      setSelectedCredits(selectedProviderPayment.tuitionCreditIds || []);
    }
  }, [isEdit, selectedProviderPayment]);
  
  // Calculate total credit amount
  const creditTotal = selectedCredits
    .map(id => eligibleCredits.find(credit => credit.id === id))
    .filter(Boolean)
    .reduce((sum, credit) => sum + (credit?.creditAmount || 0), 0);
  
  // Update total amount when credits or grant amount changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      amount: creditTotal + (prev.qualityImprovementGrant ? prev.grantAmount : 0)
    }));
  }, [creditTotal, formData.qualityImprovementGrant, formData.grantAmount]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'date') {
      setFormData({
        ...formData,
        [name]: new Date(value)
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
      
      // If turning off quality improvement grant, reset grant amount and reason
      if (name === 'qualityImprovementGrant' && !(e.target as HTMLInputElement).checked) {
        setFormData(prev => ({
          ...prev,
          grantAmount: 0,
          grantReason: ''
        }));
      }
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleCreditSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedCredits(selectedOptions);
    setFormData(prev => ({
      ...prev,
      tuitionCreditIds: selectedOptions
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    if (formData.tuitionCreditIds.length === 0) {
      setSubmitError('Please select at least one tuition credit for this payment.');
      setIsSubmitting(false);
      return;
    }
    
    // Validate quality improvement grant if enabled
    if (formData.qualityImprovementGrant && formData.grantAmount <= 0) {
      setSubmitError('Please enter a grant amount greater than zero.');
      setIsSubmitting(false);
      return;
    }
    
    if (formData.qualityImprovementGrant && !formData.grantReason) {
      setSubmitError('Please provide a reason for the quality improvement grant.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (isEdit && paymentId) {
        // Update existing payment
        await updateProviderPayment(paymentId, formData);
        router.push(`/finance/tuition-credits/payments/${paymentId}`);
      } else {
        // Create new payment
        const paymentData = {
          ...formData,
          status: PaymentStatus.PENDING,
          batchId: batchId,
          createdById: 'current-user-id', // This should be fetched from authentication context
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await createProviderPayment(paymentData);
        
        // Navigate to the batch or back to payments list
        if (batchId) {
          router.push(`/finance/tuition-credits/batches/${batchId}`);
        } else {
          router.push(`/finance/tuition-credits/payments`);
        }
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save provider payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (providerPaymentsLoading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }
  
  if (providerPaymentsError) {
    return <div className="p-4 text-center text-red-500">Error: {providerPaymentsError}</div>;
  }
  
  if (!providerId && !isEdit) {
    return <div className="p-4 text-center text-amber-500">Provider ID is required to create a payment.</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Payment Information</h3>
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
              disabled={providerId != null || isEdit}
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
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleInputChange}
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
            <label htmlFor="paymentPriority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="paymentPriority"
              name="paymentPriority"
              value={formData.paymentPriority}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={PaymentPriority.NORMAL}>Normal</option>
              <option value={PaymentPriority.HIGH}>High</option>
              <option value={PaymentPriority.URGENT}>Urgent</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Account *
            </label>
            <input
              type="text"
              id="accountId"
              name="accountId"
              value={formData.accountId}
              onChange={handleInputChange}
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
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Tuition Credits</h3>
        <div>
          <label htmlFor="tuitionCreditIds" className="block text-sm font-medium text-gray-700 mb-1">
            Select Tuition Credits for Payment *
          </label>
          <select
            id="tuitionCreditIds"
            name="tuitionCreditIds"
            multiple
            value={selectedCredits}
            onChange={handleCreditSelection}
            required
            className="w-full p-2 border border-gray-300 rounded h-48"
          >
            {eligibleCredits.length === 0 ? (
              <option disabled value="">No eligible credits found for this provider</option>
            ) : (
              eligibleCredits.map(credit => (
                <option key={credit.id} value={credit.id}>
                  {credit.studentName} (${credit.creditAmount.toLocaleString()}) - {formatDateRange(credit.creditPeriodStart, credit.creditPeriodEnd)}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Hold Ctrl (or Cmd) to select multiple credits. Only unpaid credits for this provider are shown.
          </p>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
            <p className="font-semibold">Credit Summary:</p>
            <ul className="mt-2">
              <li>Selected Credits: {selectedCredits.length}</li>
              <li>Total Credit Amount: ${creditTotal.toLocaleString()}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Quality Improvement Grant</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="qualityImprovementGrant"
              name="qualityImprovementGrant"
              checked={formData.qualityImprovementGrant}
              onChange={(e) => setFormData({
                ...formData, 
                qualityImprovementGrant: e.target.checked,
                grantAmount: e.target.checked ? formData.grantAmount : 0,
                grantReason: e.target.checked ? formData.grantReason : ''
              })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              disabled={!provider?.qualityImprovementGrantEligible}
            />
            <label htmlFor="qualityImprovementGrant" className="ml-2 block text-sm text-gray-700">
              Include Quality Improvement Grant in this payment
            </label>
          </div>
          
          {!provider?.qualityImprovementGrantEligible && (
            <div className="text-sm text-amber-600">
              This provider is not eligible for quality improvement grants.
            </div>
          )}
          
          {formData.qualityImprovementGrant && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="grantAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Grant Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    id="grantAmount"
                    name="grantAmount"
                    value={formData.grantAmount}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.01"
                    className="w-full pl-7 p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="grantReason" className="block text-sm font-medium text-gray-700 mb-1">
                  Grant Reason *
                </label>
                <textarea
                  id="grantReason"
                  name="grantReason"
                  value={formData.grantReason}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Explain the purpose of this quality improvement grant"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Payment Summary</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Tuition Credits Total:</p>
              <p className="text-lg font-semibold">${creditTotal.toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Quality Improvement Grant:</p>
              <p className="text-lg font-semibold">${formData.qualityImprovementGrant ? formData.grantAmount.toLocaleString() : '0.00'}</p>
            </div>
            
            <div className="col-span-2">
              <div className="h-px bg-gray-200 my-2"></div>
            </div>
            
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Total Payment Amount:</p>
              <p className="text-xl font-bold text-blue-600">${formData.amount.toLocaleString()}</p>
            </div>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Notes
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
          {isSubmitting ? 'Processing...' : isEdit ? 'Update Payment' : 'Create Payment'}
        </button>
      </div>
    </form>
  );
}

// Helper function
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