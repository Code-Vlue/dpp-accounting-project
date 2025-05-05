// src/components/finance/accounts-receivable/InvoiceForm.tsx

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  RevenueCategory,
  TransactionStatus,
  TransactionType,
  Customer
} from '@/types/finance';

interface InvoiceFormProps {
  invoiceId?: string; // Optional - if provided, we're editing an existing invoice
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceId }) => {
  const router = useRouter();
  const {
    customers,
    fetchCustomers,
    fetchInvoiceById,
    selectedInvoice,
    invoicesLoading,
    createInvoice,
    updateInvoice
  } = useFinanceStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [customerNotes, setCustomerNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [sendReceipt, setSendReceipt] = useState(true);
  const [invoiceItems, setInvoiceItems] = useState<Partial<InvoiceItem>[]>([{
    description: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
    revenueCategory: RevenueCategory.PROGRAM_REVENUE,
    taxable: false,
  }]);

  // Generate a unique invoice number when creating a new invoice
  useEffect(() => {
    if (!invoiceId) {
      const today = new Date();
      const yearMonth = today.toISOString().substring(0, 7).replace('-', '');
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setInvoiceNumber(`INV-${yearMonth}-${randomNum}`);
      
      // Set default dates
      setInvoiceDate(today.toISOString().split('T')[0]);
      
      // Set due date to 30 days from today by default
      const due = new Date(today);
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().split('T')[0]);
    }
    
    // Load customers
    fetchCustomers();
  }, [invoiceId, fetchCustomers]);

  // Load invoice data if editing
  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceById(invoiceId);
    }
  }, [invoiceId, fetchInvoiceById]);

  // Populate form when selectedInvoice changes
  useEffect(() => {
    if (selectedInvoice && invoiceId) {
      setCustomerId(selectedInvoice.customerId);
      setInvoiceNumber(selectedInvoice.invoiceNumber);
      setInvoiceDate(new Date(selectedInvoice.invoiceDate).toISOString().split('T')[0]);
      setDueDate(new Date(selectedInvoice.dueDate).toISOString().split('T')[0]);
      setDescription(selectedInvoice.description);
      setReference(selectedInvoice.reference || '');
      setPaymentTerms(selectedInvoice.paymentTerms || 'Net 30');
      setCustomerNotes(selectedInvoice.customerNotes || '');
      setTermsAndConditions(selectedInvoice.termsAndConditions || '');
      setSendReceipt(selectedInvoice.sendReceipt);
      
      if (selectedInvoice.invoiceItems && selectedInvoice.invoiceItems.length > 0) {
        // Map invoice items to form state
        const items = selectedInvoice.invoiceItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          accountId: item.accountId,
          revenueCategory: item.revenueCategory,
          taxable: item.taxable,
          fundId: item.fundId,
          discountPercent: item.discountPercent
        }));
        setInvoiceItems(items);
      }
    }
  }, [selectedInvoice, invoiceId]);

  // Update selectedCustomer when customerId changes
  useEffect(() => {
    if (customerId && customers) {
      const customer = customers.find(c => c.id === customerId);
      setSelectedCustomer(customer || null);
      
      // If we have a customer and we're creating a new invoice, update payment terms
      if (customer && !invoiceId) {
        setPaymentTerms(customer.paymentTerms || 'Net 30');
      }
    }
  }, [customerId, customers, invoiceId]);

  // Calculate line item amount when quantity or unit price changes
  const updateLineItemAmount = (index: number, quantity: number, unitPrice: number, discount?: number) => {
    const newItems = [...invoiceItems];
    
    let amount = quantity * unitPrice;
    
    // Apply discount if provided
    if (discount && discount > 0) {
      amount = amount * (1 - discount / 100);
    }
    
    newItems[index] = {
      ...newItems[index],
      quantity,
      unitPrice,
      amount,
      discountPercent: discount
    };
    
    setInvoiceItems(newItems);
  };

  // Add a new line item
  const addLineItem = () => {
    setInvoiceItems([...invoiceItems, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      revenueCategory: RevenueCategory.PROGRAM_REVENUE,
      taxable: false,
    }]);
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    if (invoiceItems.length === 1) return; // Don't remove the last item
    
    const newItems = [...invoiceItems];
    newItems.splice(index, 1);
    setInvoiceItems(newItems);
  };

  // Calculate invoice subtotal
  const calculateSubtotal = (): number => {
    return invoiceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || invoiceItems.some(item => !item.description || !item.quantity || !item.unitPrice)) {
      // Form validation would go here in a real implementation
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const subtotal = calculateSubtotal();
      
      // Create or update invoice
      if (invoiceId && selectedInvoice) {
        // Update existing invoice
        await updateInvoice(invoiceId, {
          customerId,
          invoiceNumber,
          invoiceDate: new Date(invoiceDate),
          dueDate: new Date(dueDate),
          description,
          reference,
          paymentTerms,
          customerNotes,
          termsAndConditions,
          sendReceipt,
          invoiceItems: invoiceItems as InvoiceItem[],
          // Keep existing values
          amountDue: subtotal,
          amountPaid: selectedInvoice.amountPaid,
          invoiceStatus: selectedInvoice.invoiceStatus,
          subtotal
        });
      } else {
        // Create new invoice
        await createInvoice({
          customerId,
          invoiceNumber,
          invoiceDate: new Date(invoiceDate),
          dueDate: new Date(dueDate),
          amountDue: subtotal,
          amountPaid: 0,
          invoiceStatus: InvoiceStatus.DRAFT,
          paymentTerms,
          sendReceipt,
          customerNotes,
          termsAndConditions,
          type: TransactionType.ACCOUNTS_RECEIVABLE,
          date: new Date(invoiceDate),
          description,
          reference,
          amount: subtotal,
          status: TransactionStatus.DRAFT,
          fiscalYearId: 'FY2024', // This would be dynamically determined in a real implementation
          fiscalPeriodId: 'Q2-2024', // This would be dynamically determined in a real implementation
          createdById: 'current-user', // This would come from auth context
          subtotal,
          invoiceItems: invoiceItems as InvoiceItem[],
          // Add missing required properties
          entries: [], // Transaction entries will be empty initially
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Navigate back to invoices list
      router.push('/finance/accounts-receivable/invoices');
      
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (invoiceId && invoicesLoading) {
    return <div className="p-4">Loading invoice data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          {invoiceId ? 'Edit Invoice' : 'Create New Invoice'}
        </h1>
        
        <form onSubmit={handleSubmit}>
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left column */}
            <div className="space-y-4">
              {/* Customer Selection */}
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer*
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!!invoiceId} // Disable if editing
                >
                  <option value="">Select a customer</option>
                  {customers?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.customerNumber})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Customer details display if selected */}
              {selectedCustomer && (
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  {selectedCustomer.contactName && (
                    <p>{selectedCustomer.contactName}</p>
                  )}
                  {selectedCustomer.email && (
                    <p>{selectedCustomer.email}</p>
                  )}
                  {selectedCustomer.address && selectedCustomer.address.street1 && (
                    <div className="mt-1">
                      <p>{selectedCustomer.address.street1}</p>
                      {selectedCustomer.address.street2 && (
                        <p>{selectedCustomer.address.street2}</p>
                      )}
                      <p>
                        {selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Invoice description"
                  required
                />
              </div>
              
              {/* Reference Number */}
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional reference number"
                />
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-4">
              {/* Invoice Number */}
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number*
                </label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!!invoiceId} // Disable if editing
                />
              </div>
              
              {/* Invoice Date */}
              <div>
                <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date*
                </label>
                <input
                  type="date"
                  id="invoiceDate"
                  name="invoiceDate"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Due Date */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date*
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Payment Terms */}
              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <select
                  id="paymentTerms"
                  name="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Invoice Items */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Invoice Items</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description*
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity*
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price*
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount %
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Category
                    </th>
                    <th scope="col" className="relative px-3 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => {
                            const newItems = [...invoiceItems];
                            newItems[index] = { ...newItems[index], description: e.target.value };
                            setInvoiceItems(newItems);
                          }}
                          className="w-full py-1 px-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Item description"
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || ''}
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value, 10) || 0;
                            updateLineItemAmount(
                              index,
                              quantity,
                              item.unitPrice || 0,
                              item.discountPercent
                            );
                          }}
                          className="w-24 py-1 px-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-xs">$</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice || ''}
                            onChange={(e) => {
                              const unitPrice = parseFloat(e.target.value) || 0;
                              updateLineItemAmount(
                                index,
                                item.quantity || 0,
                                unitPrice,
                                item.discountPercent
                              );
                            }}
                            className="w-28 py-1 pl-5 pr-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                            required
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.discountPercent || ''}
                            onChange={(e) => {
                              const discount = parseFloat(e.target.value) || 0;
                              updateLineItemAmount(
                                index,
                                item.quantity || 0,
                                item.unitPrice || 0,
                                discount
                              );
                            }}
                            className="w-20 py-1 pr-5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                          />
                          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-xs">%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-sm">
                        {formatCurrency(item.amount || 0)}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.revenueCategory || RevenueCategory.PROGRAM_REVENUE}
                          onChange={(e) => {
                            const newItems = [...invoiceItems];
                            newItems[index] = { ...newItems[index], revenueCategory: e.target.value as RevenueCategory };
                            setInvoiceItems(newItems);
                          }}
                          className="w-full py-1 px-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          {Object.values(RevenueCategory).map((category) => (
                            <option key={category} value={category}>
                              {category.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-800 ml-2 disabled:text-gray-400"
                          disabled={invoiceItems.length === 1}
                          title="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add Line Item Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Line Item
              </button>
            </div>
            
            {/* Invoice Total */}
            <div className="mt-6 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Notes */}
            <div>
              <label htmlFor="customerNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Notes
              </label>
              <textarea
                id="customerNotes"
                name="customerNotes"
                rows={4}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Notes visible to the customer (optional)"
              />
            </div>
            
            {/* Terms and Conditions */}
            <div>
              <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-1">
                Terms and Conditions
              </label>
              <textarea
                id="termsAndConditions"
                name="termsAndConditions"
                rows={4}
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Terms and conditions (optional)"
              />
            </div>
          </div>
          
          {/* Send Receipt Option */}
          <div className="mb-8">
            <div className="flex items-center">
              <input
                id="sendReceipt"
                name="sendReceipt"
                type="checkbox"
                checked={sendReceipt}
                onChange={(e) => setSendReceipt(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sendReceipt" className="ml-2 block text-sm text-gray-900">
                Send receipt when payment is recorded
              </label>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/finance/accounts-receivable/invoices')}
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
              {isSubmitting ? 'Saving...' : (invoiceId ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;