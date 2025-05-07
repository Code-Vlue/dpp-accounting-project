// src/app/finance/accounts-receivable/invoices/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import InvoiceList from '@/components/finance/accounts-receivable/InvoiceList';
import { useFinanceStore } from '@/store/finance-store';

const InvoicesPage = () => {
  const { fetchInvoices, invoices, invoicesLoading } = useFinanceStore();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link 
          href="/finance/accounts-receivable/invoices/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          New Invoice
        </Link>
      </div>

      <div className="mb-6 flex justify-end">
        <Link
          href="/finance/accounts-receivable/aging"
          className="px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
        >
          View Aging Report
        </Link>
      </div>
      
      <InvoiceList invoices={invoices} isLoading={invoicesLoading} />
    </div>
  );
};

export default InvoicesPage;