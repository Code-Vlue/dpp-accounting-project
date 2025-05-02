// src/components/finance/accounts-receivable/PaymentForm.tsx

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { PaymentMethod, ReceivablePayment, Invoice } from '@/types/finance';

interface PaymentFormProps {
  invoiceId: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ invoiceId }) => {
  const router = useRouter();
  const { 
    fetchInvoiceById, 
    selectedInvoice, 
    invoicesLoading, 
    invoiceError,
    fetchCustomerById,
    selectedCustomer,
    createPayment
  } = useFinanceStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('0.00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CHECK);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchInvoiceById(invoiceId);
  }, [invoiceId, fetchInvoiceById]);

  useEffect(() => {
    if (selectedInvoice) {
      fetchCustomerById(selectedInvoice.customerId);
      
      // Set the default payment amount to the remaining balance
      const remainingBalance = selectedInvoice.amountDue - selectedInvoice.amountPaid;
      setPaymentAmount(remainingBalance.toFixed(2));
      
      // Set a default account ID if available from the invoice
      if (selectedInvoice.entries && selectedInvoice.entries.length > 0) {
        const entry = selectedInvoice.entries.find(e => e.creditAmount > 0);
        if (entry) setAccountId(entry.accountId);
      }
    }
  }, [selectedInvoice, fetchCustomerById]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate payment amount
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.paymentAmount = 'Payment amount must be greater than zero';
    }
    
    // Validate against remaining balance
    if (selectedInvoice) {
      const remainingBalance = selectedInvoice.amountDue - selectedInvoice.amountPaid;
      if (amount > remainingBalance) {
        newErrors.paymentAmount = `Payment amount cannot exceed the remaining balance of ${remainingBalance.toFixed(2)}`;
      }
    }
    
    // Validate payment date
    if (!paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }
    
    // Validate reference number
    if (!referenceNumber && paymentMethod !== PaymentMethod.CHECK) {
      newErrors.referenceNumber = 'Reference number is required';
    }
    
    // Validate check number for check payments
    if (paymentMethod === PaymentMethod.CHECK && !checkNumber) {
      newErrors.checkNumber = 'Check number is required';
    }
    
    // Validate account ID
    if (!accountId) {
      newErrors.accountId = 'Deposit account is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      // Create the payment object
      const paymentData: Omit<ReceivablePayment, 'id' | 'createdAt' | 'updatedAt' | 'processedAt' | 'receiptSent' | 'receiptSentAt'> = {
        invoiceId,
        amount: parseFloat(paymentAmount),
        date: new Date(paymentDate),
        method: paymentMethod,
        status: 'PENDING',
        referenceNumber: referenceNumber || undefined,
        accountId,
        checkNumber: paymentMethod === PaymentMethod.CHECK ? checkNumber : undefined,
        notes: notes || undefined,
        createdById: 'current-user', // This would come from auth context
        transactionId: undefined,
        depositDate: new Date(paymentDate),
      };
      
      // Submit payment
      await createPayment(paymentData);
      
      // Show success message
      setSuccessMessage('Payment recorded successfully');
      
      // Reset form
      setReferenceNumber('');
      setCheckNumber('');
      setNotes('');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/finance/accounts-receivable/invoices/${invoiceId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error recording payment:', error);
      setErrors({ submit: 'An error occurred while recording the payment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (invoicesLoading) {
    return <div className="p-4">Loading invoice details...</div>;
  }

  if (invoiceError) {
    return <div className="p-4 text-red-600">Error: {invoiceError}</div>;
  }

  if (!selectedInvoice) {
    return <div className="p-4">Invoice not found.</div>;
  }

  const remainingBalance = selectedInvoice.amountDue - selectedInvoice.amountPaid;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Record Payment</h1>
        
        {/* Invoice Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <div>
              <h3 className="font-medium text-gray-800">Invoice #{selectedInvoice.invoiceNumber}</h3>
              <p className="text-sm text-gray-600">{selectedInvoice.description}</p>
            </div>
            <div className="mt-2 sm:mt-0 text-right">
              <p className="text-sm text-gray-600">Total Amount: {formatCurrency(selectedInvoice.amountDue)}</p>
              <p className="text-sm text-gray-600">Already Paid: {formatCurrency(selectedInvoice.amountPaid)}</p>
              <p className="text-sm font-medium text-gray-800">Remaining: {formatCurrency(remainingBalance)}</p>
            </div>
          </div>
          
          {selectedCustomer && (
            <div className="text-sm text-gray-600">
              <p>Customer: {selectedCustomer.name}</p>
              <p>Customer ID: {selectedCustomer.customerNumber}</p>
            </div>
          )}
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          {/* Payment Amount */}
          <div className="mb-4">
            <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="paymentAmount"
                name="paymentAmount"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className={`mt-1 block w-full pl-7 pr-12 py-2 border ${errors.paymentAmount ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="0.00"
                required
              />
            </div>
            {errors.paymentAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentAmount}</p>
            )}
          </div>
          
          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method*
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value={PaymentMethod.CHECK}>Check</option>
                <option value={PaymentMethod.ACH}>ACH Transfer</option>
                <option value={PaymentMethod.WIRE}>Wire Transfer</option>
                <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
                <option value={PaymentMethod.CASH}>Cash</option>
                <option value={PaymentMethod.OTHER}>Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date*
              </label>
              <input
                type="date"
                id="paymentDate"
                name="paymentDate"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className={`mt-1 block w-full py-2 px-3 border ${errors.paymentDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              {errors.paymentDate && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>
              )}
            </div>
          </div>
          
          {/* Reference Number or Check Number */}
          <div className="mb-4">
            {paymentMethod === PaymentMethod.CHECK ? (
              <div>
                <label htmlFor="checkNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Check Number*
                </label>
                <input
                  type="text"
                  id="checkNumber"
                  name="checkNumber"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  className={`mt-1 block w-full py-2 px-3 border ${errors.checkNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter check number"
                  required
                />
                {errors.checkNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.checkNumber}</p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number*
                </label>
                <input
                  type="text"
                  id="referenceNumber"
                  name="referenceNumber"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className={`mt-1 block w-full py-2 px-3 border ${errors.referenceNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter reference number"
                  required
                />
                {errors.referenceNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.referenceNumber}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Account ID */}
          <div className="mb-4">
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
              Deposit Account*
            </label>
            <input
              type="text"
              id="accountId"
              name="accountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={`mt-1 block w-full py-2 px-3 border ${errors.accountId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter account ID"
              required
            />
            {errors.accountId && (
              <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">In a real implementation, this would be a dropdown of available bank accounts.</p>
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional payment notes (optional)"
            />
          </div>
          
          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Recording Payment...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;