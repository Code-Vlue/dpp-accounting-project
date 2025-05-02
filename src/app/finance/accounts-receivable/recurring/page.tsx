// src/app/finance/accounts-receivable/recurring/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { RecurrenceFrequency } from '@/types/finance';
// Unused import removed: RecurringInvoice

const RecurringInvoicesPage = () => {
  const { 
    fetchAllRecurringInvoices, 
    recurringInvoices, 
    recurringInvoicesLoading,
    generateInvoiceFromRecurring
  } = useFinanceStore();
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAllRecurringInvoices();
  }, [fetchAllRecurringInvoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatFrequency = (frequency: RecurrenceFrequency) => {
    return frequency.replace('_', ' ').toLowerCase();
  };

  const handleGenerateInvoice = async (recurringInvoiceId: string) => {
    setProcessingId(recurringInvoiceId);
    try {
      await generateInvoiceFromRecurring(recurringInvoiceId);
      fetchAllRecurringInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error generating invoice:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (recurringInvoicesLoading) {
    return <div className="p-6">Loading recurring invoices...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recurring Invoices</h1>
        <Link
          href="/finance/accounts-receivable/recurring/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          New Recurring Invoice
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {recurringInvoices && recurringInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recurringInvoices.map((recurring) => (
                  <tr key={recurring.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link href={`/finance/accounts-receivable/recurring/${recurring.id}`} className="text-blue-600 hover:underline">
                        {recurring.description}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/finance/accounts-receivable/customers/${recurring.customerId}`} className="text-blue-600 hover:underline">
                        {/* Customer name would be displayed here */}
                        Customer {recurring.customerId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFrequency(recurring.frequency)}
                      {recurring.dayOfMonth && ` (day ${recurring.dayOfMonth})`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(recurring.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(recurring.nextGenerationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${recurring.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {recurring.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleGenerateInvoice(recurring.id)}
                        disabled={processingId === recurring.id || !recurring.active}
                        className="text-blue-600 hover:text-blue-900 mr-3 disabled:text-gray-400"
                      >
                        {processingId === recurring.id ? 'Generating...' : 'Generate Now'}
                      </button>
                      <Link
                        href={`/finance/accounts-receivable/recurring/${recurring.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No recurring invoices found.</p>
            <p className="mt-2">
              <Link href="/finance/accounts-receivable/recurring/new" className="text-blue-600 hover:underline">
                Create your first recurring invoice
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringInvoicesPage;