// src/app/finance/accounts-receivable/customers/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import CustomerList from '@/components/finance/accounts-receivable/CustomerList';
import { useFinanceStore } from '@/store/finance-store';

const CustomersPage = () => {
  const { fetchCustomers, customers, customersLoading } = useFinanceStore();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link 
          href="/finance/accounts-receivable/customers/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          New Customer
        </Link>
      </div>
      
      <CustomerList customers={customers} isLoading={customersLoading} />
    </div>
  );
};

export default CustomersPage;