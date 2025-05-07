// src/app/finance/accounts-receivable/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { InvoiceStatus } from '@/types/finance';

const AccountsReceivableDashboard = () => {
  const {
    customers,
    invoices,
    customersLoading,
    invoicesLoading,
    fetchCustomers,
    fetchInvoices,
    fetchOverdueInvoices,
    getAgingReport
  } = useFinanceStore();

  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalOutstanding: 0,
    overdueAmount: 0,
    draftInvoices: 0,
    sentInvoices: 0,
    partiallyPaidInvoices: 0,
    paidInvoices: 0
  });

  const [agingData, setAgingData] = useState<{
    current: number;
    '1-30': number;
    '31-60': number;
    '61-90': number;
    '90Plus': number;
    total: number;
  } | null>(null);

  useEffect(() => {
    fetchCustomers();
    fetchInvoices();
    fetchOverdueInvoices();
    
    const fetchAgingData = async () => {
      // getAgingReport returns void, not a report
      await getAgingReport();
      // Get the report from the store instead
      const report = useFinanceStore.getState().agingReport;
      if (report) {
        setAgingData({
          current: report.current,
          '1-30': report['1-30'],
          '31-60': report['31-60'],
          '61-90': report['61-90'],
          '90Plus': report['90Plus'],
          total: report.total
        });
      }
    };
    
    fetchAgingData();
  }, [fetchCustomers, fetchInvoices, fetchOverdueInvoices, getAgingReport]);

  useEffect(() => {
    if (customers.length > 0 && invoices.length > 0) {
      const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
      const totalOutstanding = invoices.reduce(
        (total, invoice) => total + (invoice.amountDue - invoice.amountPaid), 
        0
      );
      
      const overdueInvoices = invoices.filter(
        i => i.invoiceStatus !== InvoiceStatus.PAID && 
             i.invoiceStatus !== InvoiceStatus.VOIDED && 
             new Date(i.dueDate) < new Date()
      );
      
      const overdueAmount = overdueInvoices.reduce(
        (total, invoice) => total + (invoice.amountDue - invoice.amountPaid),
        0
      );
      
      const draftInvoices = invoices.filter(i => i.invoiceStatus === InvoiceStatus.DRAFT).length;
      const sentInvoices = invoices.filter(i => i.invoiceStatus === InvoiceStatus.SENT).length;
      const partiallyPaidInvoices = invoices.filter(i => i.invoiceStatus === InvoiceStatus.PARTIALLY_PAID).length;
      const paidInvoices = invoices.filter(i => i.invoiceStatus === InvoiceStatus.PAID).length;
      
      setStats({
        totalCustomers: customers.length,
        activeCustomers,
        totalOutstanding,
        overdueAmount,
        draftInvoices,
        sentInvoices,
        partiallyPaidInvoices,
        paidInvoices
      });
    }
  }, [customers, invoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (customersLoading || invoicesLoading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Outstanding */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Outstanding
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(stats.totalOutstanding)}
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2 flex justify-between">
            <Link href="/finance/accounts-receivable/invoices" className="text-sm text-blue-600 hover:text-blue-900">
              View all invoices
            </Link>
          </div>
        </div>

        {/* Overdue Amount */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Overdue Amount
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-red-600">
                    {formatCurrency(stats.overdueAmount)}
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2 flex justify-between">
            <Link href="/finance/accounts-receivable/aging" className="text-sm text-blue-600 hover:text-blue-900">
              View aging report
            </Link>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Customers
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stats.activeCustomers}
                  </div>
                  <p className="ml-2 text-sm text-gray-500">
                    of {stats.totalCustomers} total
                  </p>
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2 flex justify-between">
            <Link href="/finance/accounts-receivable/customers" className="text-sm text-blue-600 hover:text-blue-900">
              View all customers
            </Link>
          </div>
        </div>

        {/* Invoices by Status */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Invoice Status
                </dt>
                <dd className="mt-2">
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Draft:</span>
                      <span className="font-medium">{stats.draftInvoices}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Sent:</span>
                      <span className="font-medium">{stats.sentInvoices}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Partial:</span>
                      <span className="font-medium">{stats.partiallyPaidInvoices}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Paid:</span>
                      <span className="font-medium">{stats.paidInvoices}</span>
                    </div>
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2 flex justify-between">
            <Link href="/finance/accounts-receivable/invoices" className="text-sm text-blue-600 hover:text-blue-900">
              Manage invoices
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity and Aging Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aging Summary */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Aging Summary</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {agingData ? (
              <div className="space-y-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        Current: {formatCurrency(agingData.current)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        {agingData.total > 0 ? `${Math.round((agingData.current / agingData.total) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: agingData.total > 0 ? `${(agingData.current / agingData.total) * 100}%` : '0%' }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        1-30 Days: {formatCurrency(agingData['1-30'])}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        {agingData.total > 0 ? `${Math.round((agingData['1-30'] / agingData.total) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: agingData.total > 0 ? `${(agingData['1-30'] / agingData.total) * 100}%` : '0%' }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        31-60 Days: {formatCurrency(agingData['31-60'])}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        {agingData.total > 0 ? `${Math.round((agingData['31-60'] / agingData.total) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: agingData.total > 0 ? `${(agingData['31-60'] / agingData.total) * 100}%` : '0%' }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        61-90 Days: {formatCurrency(agingData['61-90'])}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        {agingData.total > 0 ? `${Math.round((agingData['61-90'] / agingData.total) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: agingData.total > 0 ? `${(agingData['61-90'] / agingData.total) * 100}%` : '0%' }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        90+ Days: {formatCurrency(agingData['90Plus'])}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        {agingData.total > 0 ? `${Math.round((agingData['90Plus'] / agingData.total) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: agingData.total > 0 ? `${(agingData['90Plus'] / agingData.total) * 100}%` : '0%' }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                    ></div>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Outstanding:</span>
                    <span className="text-lg font-bold">{formatCurrency(agingData.total)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading aging data...</p>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-2 flex justify-between">
            <Link href="/finance/accounts-receivable/aging" className="text-sm text-blue-600 hover:text-blue-900">
              View full aging report
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/finance/accounts-receivable/customers/new"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">New Customer</p>
                  <p className="text-xs text-gray-500">Add a new customer to the system</p>
                </div>
              </Link>

              <Link
                href="/finance/accounts-receivable/invoices/new"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">New Invoice</p>
                  <p className="text-xs text-gray-500">Create a new invoice for a customer</p>
                </div>
              </Link>

              <Link
                href="/finance/accounts-receivable/recurring"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-2">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Recurring Invoices</p>
                  <p className="text-xs text-gray-500">Manage repeating invoices</p>
                </div>
              </Link>

              <Link
                href="/finance/accounts-receivable/aging"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0 bg-red-100 rounded-md p-2">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Aging Report</p>
                  <p className="text-xs text-gray-500">View outstanding balances by age</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Invoices</h3>
          <Link
            href="/finance/accounts-receivable/invoices"
            className="text-sm text-blue-600 hover:text-blue-900"
          >
            View all
          </Link>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {invoices.length === 0 ? (
            <p className="text-gray-500">No invoices found. Create your first invoice to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((invoice) => {
                      const isOverdue = 
                        invoice.invoiceStatus !== InvoiceStatus.PAID && 
                        invoice.invoiceStatus !== InvoiceStatus.VOIDED && 
                        new Date(invoice.dueDate) < new Date();
                      
                      const statusColor = 
                        invoice.invoiceStatus === InvoiceStatus.PAID ? 'bg-green-100 text-green-800' :
                        invoice.invoiceStatus === InvoiceStatus.VOIDED ? 'bg-purple-100 text-purple-800' :
                        invoice.invoiceStatus === InvoiceStatus.PARTIALLY_PAID ? 'bg-yellow-100 text-yellow-800' :
                        isOverdue ? 'bg-red-100 text-red-800' :
                        invoice.invoiceStatus === InvoiceStatus.SENT ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800';
                      
                      const customer = customers.find(c => c.id === invoice.customerId);
                      
                      return (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            <Link href={`/finance/accounts-receivable/invoices/${invoice.id}`}>
                              {invoice.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer?.name || 'Unknown Customer'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {formatCurrency(invoice.amountDue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                              {isOverdue ? 'OVERDUE' : invoice.invoiceStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountsReceivableDashboard;