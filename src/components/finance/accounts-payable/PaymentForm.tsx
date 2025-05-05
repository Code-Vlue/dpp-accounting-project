// src/components/finance/accounts-payable/PaymentForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { PaymentMethod, PaymentStatus } from '@/types/finance';

interface PaymentFormProps {
  billId: string;
}

export default function PaymentForm({ billId }: PaymentFormProps) {
  const router = useRouter();
  const { 
    selectedBill, 
    billsLoading, 
    billError, 
    fetchBillById,
    accounts,
    accountsLoading,
    fetchAccounts,
    createPayment
  } = useFinanceStore();
  
  const [formData, setFormData] = useState({
    amount: 0,
    date: new Date().toISOString().substring(0, 10),
    method: PaymentMethod.CHECK,
    referenceNumber: '',
    accountId: '',
    checkNumber: '',
    notes: ''
  });
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchBillById(billId);
    fetchAccounts();
  }, [billId, fetchBillById, fetchAccounts]);
  
  useEffect(() => {
    if (selectedBill) {
      const remainingAmount = selectedBill.amountDue - selectedBill.amountPaid;
      setFormData(prevFormData => ({
        ...prevFormData,
        amount: remainingAmount
      }));
    }
  }, [selectedBill]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setFormData({
        ...formData,
        amount: parseFloat(value) || 0
      });
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
      // Validate payment amount
      if (!selectedBill) {
        throw new Error('Bill information not available');
      }
      
      const remainingAmount = selectedBill.amountDue - selectedBill.amountPaid;
      
      if (formData.amount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }
      
      if (formData.amount > remainingAmount) {
        throw new Error(`Payment amount cannot exceed the remaining balance of $${remainingAmount.toFixed(2)}`);
      }
      
      // Create payment
      await createPayment({
        billId,
        amount: formData.amount,
        date: new Date(formData.date),
        method: formData.method as PaymentMethod,
        referenceNumber: formData.referenceNumber,
        accountId: formData.accountId,
        checkNumber: formData.method === PaymentMethod.CHECK ? formData.checkNumber : undefined,
        notes: formData.notes,
        status: PaymentStatus.COMPLETED,
        createdById: 'user1', // TODO: Replace with actual user ID
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Redirect back to bill detail
      router.push(`/finance/accounts-payable/bills/${billId}`);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (billsLoading) {
    return <div className="p-4 text-center">Loading bill data...</div>;
  }
  
  if (billError) {
    return <div className="p-4 text-center text-red-500">Error loading bill: {billError}</div>;
  }
  
  if (!selectedBill) {
    return <div className="p-4 text-center">Bill not found</div>;
  }
  
  const remainingAmount = selectedBill.amountDue - selectedBill.amountPaid;
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-semibold">Make Payment</h2>
        <p className="text-gray-600">
          Bill: {selectedBill.invoiceNumber} | Vendor: {selectedBill.vendorId} | 
          Remaining: ${remainingAmount.toFixed(2)}
        </p>
      </div>
      
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Amount *
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              min="0.01"
              max={remainingAmount}
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange}
              className="pl-7 w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
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
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value={PaymentMethod.CHECK}>Check</option>
            <option value={PaymentMethod.ACH}>ACH</option>
            <option value={PaymentMethod.WIRE}>Wire Transfer</option>
            <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
            <option value={PaymentMethod.CASH}>Cash</option>
            <option value={PaymentMethod.OTHER}>Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Account *
          </label>
          <select
            id="accountId"
            name="accountId"
            value={formData.accountId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Account</option>
            {accountsLoading ? (
              <option value="" disabled>Loading accounts...</option>
            ) : (
              accounts
                .filter(acc => acc.isBankAccount)
                .map(account => (
                  <option key={account.id} value={account.id}>
                    {account.accountNumber} - {account.name}
                  </option>
                ))
            )}
          </select>
        </div>
        
        <div>
          <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            id="referenceNumber"
            name="referenceNumber"
            value={formData.referenceNumber}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        {formData.method === PaymentMethod.CHECK && (
          <div>
            <label htmlFor="checkNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Check Number
            </label>
            <input
              type="text"
              id="checkNumber"
              name="checkNumber"
              value={formData.checkNumber}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
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
        
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || formData.amount <= 0 || !formData.accountId}
            className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700 disabled:bg-green-300"
          >
            {isSubmitting ? 'Processing...' : 'Make Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}