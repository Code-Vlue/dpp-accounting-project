// src/components/finance/accounts-payable/BillForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { ExpenseCategory } from '@/types/finance';

interface BillFormProps {
  billId?: string;
  isEdit?: boolean;
}

export default function BillForm({ billId, isEdit = false }: BillFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { 
    accounts,
    accountsLoading,
    fetchAccounts,
    vendors,
    vendorsLoading,
    fetchVendors,
    selectedBill,
    billsLoading,
    billError,
    fetchBillById,
    billDraft,
    updateBillDraft,
    addBillItem,
    removeBillItem,
    updateBillItem,
    resetBillDraft,
    submitBill
  } = useFinanceStore();
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load data when component mounts
  useEffect(() => {
    fetchAccounts();
    fetchVendors();
    
    // If editing, fetch the bill data
    if (isEdit && billId) {
      fetchBillById(billId);
    }
    
    // Check if we have a vendorId in the URL params for new bills
    if (!isEdit) {
      const vendorIdParam = searchParams.get('vendorId');
      if (vendorIdParam) {
        updateBillDraft('vendorId', vendorIdParam);
      }
    }
    
    // Cleanup - reset draft when component unmounts
    return () => {
      if (!isEdit) {
        resetBillDraft();
      }
    };
  }, [fetchAccounts, fetchVendors, isEdit, billId, fetchBillById, resetBillDraft, searchParams, updateBillDraft]);
  
  // Populate form with bill data when editing
  useEffect(() => {
    if (isEdit && selectedBill) {
      // Transform selected bill into bill draft format
      // Update field by field
      updateBillDraft('vendorId', selectedBill.vendorId);
      updateBillDraft('billNumber', selectedBill.invoiceNumber);
      updateBillDraft('billDate', new Date(selectedBill.invoiceDate));
      updateBillDraft('dueDate', new Date(selectedBill.dueDate));
      updateBillDraft('description', selectedBill.description);
      updateBillDraft('referenceNumber', selectedBill.reference || '');
      
      // Update items
      const billItems = selectedBill.billItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        accountId: item.accountId,
        expenseCategory: item.expenseCategory,
        taxable: item.taxable,
        fundId: item.fundId,
        departmentId: item.departmentId,
        projectId: item.projectId
      }));
      updateBillDraft('items', billItems);
    }
  }, [isEdit, selectedBill, updateBillDraft]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Submit the bill
      await submitBill(billDraft); // Pass the entire bill draft
      
      // Redirect based on action
      if (isEdit && billId) {
        router.push(`/finance/accounts-payable/bills/${billId}`);
      } else {
        router.push('/finance/accounts-payable/bills');
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate bill total
  const billTotal = billDraft.items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice), 
    0
  );
  
  // Find the vendor
  const selectedVendor = vendors.find(v => v.id === billDraft.vendorId);
  
  if (isEdit && billsLoading) {
    return <div className="p-4 text-center">Loading bill data...</div>;
  }
  
  if (isEdit && billError) {
    return <div className="p-4 text-center text-red-500">Error loading bill: {billError}</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Bill Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700 mb-1">
              Vendor *
            </label>
            <select
              id="vendorId"
              name="vendorId"
              value={billDraft.vendorId}
              onChange={(e) => updateBillDraft('vendorId', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
              disabled={isEdit}
            >
              <option value="">Select Vendor</option>
              {vendorsLoading ? (
                <option value="" disabled>Loading vendors...</option>
              ) : (
                vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number *
            </label>
            <input
              type="text"
              id="invoiceNumber"
              name="invoiceNumber"
              value={billDraft.billNumber}
              onChange={(e) => updateBillDraft('billNumber', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Date *
            </label>
            <input
              type="date"
              id="invoiceDate"
              name="invoiceDate"
              value={billDraft.billDate.toISOString().substring(0, 10)}
              onChange={(e) => updateBillDraft('billDate', e.target.value ? new Date(e.target.value) : new Date())}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={billDraft.dueDate.toISOString().substring(0, 10)}
              onChange={(e) => updateBillDraft('dueDate', e.target.value ? new Date(e.target.value) : new Date())}
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
              value={billDraft.description}
              onChange={(e) => updateBillDraft('description', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
              Reference
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={billDraft.referenceNumber}
              onChange={(e) => updateBillDraft('referenceNumber', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Bill Items</h3>
          <button
            type="button"
            onClick={addBillItem}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Add Item
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billDraft.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-sm text-gray-500">
                    No items added yet. Click "Add Item" to start.
                  </td>
                </tr>
              ) : (
                billDraft.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateBillItem(index, { description: e.target.value })}
                        placeholder="Description"
                        className="w-full p-1 text-sm border border-gray-300 rounded"
                        required
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.accountId}
                        onChange={(e) => updateBillItem(index, { accountId: e.target.value })}
                        className="w-full p-1 text-sm border border-gray-300 rounded"
                        required
                      >
                        <option value="">Select Account</option>
                        {accountsLoading ? (
                          <option value="" disabled>Loading accounts...</option>
                        ) : (
                          accounts
                            .filter(acc => acc.type === 'EXPENSE')
                            .map(account => (
                              <option key={account.id} value={account.id}>
                                {account.accountNumber} - {account.name}
                              </option>
                            ))
                        )}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.expenseCategory}
                        onChange={(e) => updateBillItem(index, { 
                          expenseCategory: e.target.value as ExpenseCategory 
                        })}
                        className="w-full p-1 text-sm border border-gray-300 rounded"
                        required
                      >
                        <option value="">Select Category</option>
                        {Object.values(ExpenseCategory).map(category => (
                          <option key={category} value={category}>
                            {formatExpenseCategory(category)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateBillItem(index, { 
                          quantity: parseFloat(e.target.value) || 0 
                        })}
                        className="w-full p-1 text-sm border border-gray-300 rounded text-right"
                        required
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateBillItem(index, { 
                          unitPrice: parseFloat(e.target.value) || 0 
                        })}
                        className="w-full p-1 text-sm border border-gray-300 rounded text-right"
                        required
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.taxable}
                        onChange={(e) => updateBillItem(index, { taxable: e.target.checked })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeBillItem(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={billDraft.items.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300">
                <td colSpan={5} className="px-3 py-2 text-right font-medium">Total</td>
                <td className="px-3 py-2 text-right font-medium">${billTotal.toFixed(2)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
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
          disabled={isSubmitting || billDraft.items.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Bill' : 'Create Bill'}
        </button>
      </div>
    </form>
  );
}

function formatExpenseCategory(category: ExpenseCategory): string {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}