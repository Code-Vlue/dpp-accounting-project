// src/app/finance/accounts-payable/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import BillList from '@/components/finance/accounts-payable/BillList';
import RecurringBillList from '@/components/finance/accounts-payable/RecurringBillList';
import { VendorAnalytics, InvoiceAnalytics } from '@/lib/finance/finance-store-mock';

export default function AccountsPayableDashboard() {
  const { 
    fetchBills, 
    fetchVendors, 
    fetchRecurringBills,
    getVendorAnalytics,
    getOpenInvoiceAnalytics 
  } = useFinanceStore();
  
  const [vendorAnalytics, setVendorAnalytics] = useState<VendorAnalytics>({
    totalVendors: 0,
    activeVendors: 0,
    totalSpend: 0,
    vendorsByType: [],
    topVendorsBySpend: []
  });
  
  const [invoiceAnalytics, setInvoiceAnalytics] = useState<InvoiceAnalytics>({
    totalOpenInvoices: 0,
    totalPastDueInvoices: 0,
    totalOpenAmount: 0,
    totalPastDueAmount: 0,
    agingBuckets: {
      current: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90Plus': 0
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchBills(),
          fetchVendors(),
          fetchRecurringBills()
        ]);
        
        const vendorStats = await getVendorAnalytics();
        const invoiceStats = await getOpenInvoiceAnalytics();
        
        setVendorAnalytics(vendorStats);
        setInvoiceAnalytics(invoiceStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchBills, fetchVendors, fetchRecurringBills, getVendorAnalytics, getOpenInvoiceAnalytics]);
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading dashboard data...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Accounts Payable Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            href="/finance/accounts-payable/vendors/new"
            className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
          >
            New Vendor
          </Link>
          <Link
            href="/finance/accounts-payable/bills/new"
            className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700"
          >
            New Bill
          </Link>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Vendors</div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-semibold text-gray-900">{vendorAnalytics.totalVendors}</div>
            <div className="text-sm text-gray-500">{vendorAnalytics.activeVendors} active</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Year-to-Date Spend</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            ${vendorAnalytics.totalSpend.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Open Bills</div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-semibold text-gray-900">{invoiceAnalytics.totalOpenInvoices}</div>
            <div className="text-sm text-gray-500">${invoiceAnalytics.totalOpenAmount.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Past Due Bills</div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-semibold text-red-600">{invoiceAnalytics.totalPastDueInvoices}</div>
            <div className="text-sm text-red-600">${invoiceAnalytics.totalPastDueAmount.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      {/* Aging Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Aging Summary</h2>
          <Link
            href="/finance/accounts-payable/reports/aging"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View Full Report
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Current</div>
            <div className="mt-1 text-lg font-medium text-gray-900">
              ${invoiceAnalytics.agingBuckets.current.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">1-30 Days</div>
            <div className="mt-1 text-lg font-medium text-yellow-600">
              ${invoiceAnalytics.agingBuckets['1-30'].toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">31-60 Days</div>
            <div className="mt-1 text-lg font-medium text-orange-600">
              ${invoiceAnalytics.agingBuckets['31-60'].toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">61-90 Days</div>
            <div className="mt-1 text-lg font-medium text-red-600">
              ${invoiceAnalytics.agingBuckets['61-90'].toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">90+ Days</div>
            <div className="mt-1 text-lg font-medium text-red-700">
              ${invoiceAnalytics.agingBuckets['90Plus'].toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Bills */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Recent Bills</h2>
          <Link
            href="/finance/accounts-payable/bills"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All
          </Link>
        </div>
        <BillList limit={5} />
      </div>
      
      {/* Recurring Bills */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Upcoming Recurring Bills</h2>
          <Link
            href="/finance/accounts-payable/recurring-bills"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All
          </Link>
        </div>
        <RecurringBillList limit={5} />
      </div>
      
      {/* Top Vendors */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Top Vendors by Spend</h2>
          <Link
            href="/finance/accounts-payable/vendors"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All Vendors
          </Link>
        </div>
        <div className="space-y-4">
          {vendorAnalytics.topVendorsBySpend.map((item, index) => (
            <div key={item.vendor.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-medium">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <Link
                    href={`/finance/accounts-payable/vendors/${item.vendor.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {item.vendor.name}
                  </Link>
                  <div className="text-xs text-gray-500">{item.vendor.type}</div>
                </div>
              </div>
              <div className="font-medium">${item.totalSpend.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}