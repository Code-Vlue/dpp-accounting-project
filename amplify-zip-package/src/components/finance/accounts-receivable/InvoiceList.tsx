// src/components/finance/accounts-receivable/InvoiceList.tsx
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { Invoice, InvoiceStatus, Customer } from '@/types/finance';

interface InvoiceListProps {
  customerId?: string;
  status?: InvoiceStatus;
  showOverdue?: boolean;
  invoices?: Invoice[];
  isLoading?: boolean;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ 
  customerId, 
  status,
  showOverdue = false,
  invoices: propInvoices,
  isLoading: propIsLoading
}) => {
  const router = useRouter();
  const { 
    invoices: storeInvoices, 
    invoicesLoading: storeLoading, 
    invoiceError,
    fetchInvoices,
    fetchInvoicesByCustomer,
    fetchInvoicesByStatus,
    fetchOverdueInvoices,
    customers,
    fetchCustomers
  } = useFinanceStore();
  
  // Use prop values if provided, otherwise use store values
  const invoices = propInvoices || storeInvoices;
  const invoicesLoading = propIsLoading !== undefined ? propIsLoading : storeLoading;

  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [sortField, setSortField] = useState<keyof Invoice>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<{
    status: InvoiceStatus | 'ALL';
    customerId: string | 'ALL';
    dateRange: 'all' | '30days' | '60days' | '90days';
  }>({
    status: status || 'ALL',
    customerId: customerId || 'ALL',
    dateRange: 'all'
  });
  const [query, setQuery] = useState('');
  const [customerMap, setCustomerMap] = useState<Map<string, Customer>>(new Map());

  useEffect(() => {
    if (showOverdue) {
      fetchOverdueInvoices();
    } else if (customerId) {
      fetchInvoicesByCustomer(customerId);
    } else if (status) {
      fetchInvoicesByStatus(status);
    } else {
      fetchInvoices();
    }
    
    fetchCustomers();
  }, [customerId, status, showOverdue, fetchInvoices, fetchInvoicesByCustomer, fetchInvoicesByStatus, fetchOverdueInvoices, fetchCustomers]);

  useEffect(() => {
    // Create map of customer ID to customer object for quick lookup
    const map = new Map();
    customers.forEach(customer => {
      map.set(customer.id, customer);
    });
    setCustomerMap(map);
  }, [customers]);

  useEffect(() => {
    // Set filter when props change
    if (customerId) {
      setFilter(prev => ({ ...prev, customerId }));
    }
    
    if (status) {
      setFilter(prev => ({ ...prev, status }));
    }
  }, [customerId, status]);

  useEffect(() => {
    let result = [...invoices];
    const now = new Date();
    
    // Filter by status if not 'ALL'
    if (filter.status !== 'ALL') {
      result = result.filter(invoice => invoice.invoiceStatus === filter.status);
    }
    
    // Filter by customer if not 'ALL'
    if (filter.customerId !== 'ALL') {
      result = result.filter(invoice => invoice.customerId === filter.customerId);
    }
    
    // Filter by date range
    if (filter.dateRange === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      result = result.filter(invoice => new Date(invoice.invoiceDate) >= thirtyDaysAgo);
    } else if (filter.dateRange === '60days') {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(now.getDate() - 60);
      result = result.filter(invoice => new Date(invoice.invoiceDate) >= sixtyDaysAgo);
    } else if (filter.dateRange === '90days') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      result = result.filter(invoice => new Date(invoice.invoiceDate) >= ninetyDaysAgo);
    }
    
    // Filter by search query
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      result = result.filter(
        invoice =>
          invoice.invoiceNumber.toLowerCase().includes(lowercaseQuery) ||
          invoice.description.toLowerCase().includes(lowercaseQuery) ||
          (customerMap.get(invoice.customerId)?.name || '').toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Sort the results
    result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (fieldA === undefined || fieldB === undefined) return 0;
      
      let comparison = 0;
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        comparison = fieldA.localeCompare(fieldB);
      } else if (fieldA instanceof Date && fieldB instanceof Date) {
        comparison = new Date(fieldA).getTime() - new Date(fieldB).getTime();
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        comparison = fieldA - fieldB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredInvoices(result);
  }, [invoices, filter, query, sortField, sortDirection, customerMap]);

  const handleSort = useCallback((field: keyof Invoice) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleFilterChange = useCallback((
    filterKey: keyof typeof filter,
    value: any
  ) => {
    setFilter(prev => ({ ...prev, [filterKey]: value }));
  }, []);

  const getSortIndicator = useCallback((field: keyof Invoice) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? '▲' : '▼';
  }, [sortField]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }, []);

  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString();
  }, []);

  const isOverdue = useCallback((invoice: Invoice) => {
    return (
      invoice.invoiceStatus !== InvoiceStatus.PAID &&
      invoice.invoiceStatus !== InvoiceStatus.VOIDED &&
      new Date(invoice.dueDate) < new Date()
    );
  }, []);

  const getDaysOverdue = useCallback((dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = Math.abs(now.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  const getStatusColor = useCallback((invoice: Invoice) => {
    if (invoice.invoiceStatus === InvoiceStatus.PAID) return 'bg-green-100 text-green-800';
    if (invoice.invoiceStatus === InvoiceStatus.VOIDED) return 'bg-purple-100 text-purple-800';
    if (invoice.invoiceStatus === InvoiceStatus.PARTIALLY_PAID) return 'bg-yellow-100 text-yellow-800';
    if (isOverdue(invoice)) return 'bg-red-100 text-red-800';
    if (invoice.invoiceStatus === InvoiceStatus.SENT) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  }, [isOverdue]);

  const getStatusText = useCallback((invoice: Invoice) => {
    if (isOverdue(invoice) && invoice.invoiceStatus !== InvoiceStatus.PAID) {
      return `OVERDUE (${getDaysOverdue(invoice.dueDate)} days)`;
    }
    return invoice.invoiceStatus.replace(/_/g, ' ');
  }, [isOverdue, getDaysOverdue]);

  if (invoicesLoading) {
    return <div className="p-4">Loading invoices...</div>;
  }

  if (invoiceError) {
    return <div className="p-4 text-red-600">Error: {invoiceError}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {showOverdue ? 'Overdue Invoices' : 
           customerId ? `Invoices for ${customerMap.get(customerId)?.name || ''}` : 
           status ? `${status.replace(/_/g, ' ')} Invoices` : 'All Invoices'}
        </h2>
        <Link
          href="/finance/accounts-receivable/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          New Invoice
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {!status && (
            <select
              className="px-4 py-2 border border-gray-300 rounded"
              value={filter.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {Object.values(InvoiceStatus).map(status => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          )}

          {!customerId && (
            <select
              className="px-4 py-2 border border-gray-300 rounded"
              value={filter.customerId}
              onChange={e => handleFilterChange('customerId', e.target.value)}
            >
              <option value="ALL">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          )}

          <select
            className="px-4 py-2 border border-gray-300 rounded"
            value={filter.dateRange}
            onChange={e => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="30days">Last 30 Days</option>
            <option value="60days">Last 60 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="bg-white p-4 rounded shadow">
          No invoices found. {!customerId && !status && !showOverdue && 'Create a new invoice to get started.'}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('invoiceNumber')}
                >
                  Invoice # {getSortIndicator('invoiceNumber')}
                </th>
                {!customerId && (
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                )}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('invoiceDate')}
                >
                  Date {getSortIndicator('invoiceDate')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('dueDate')}
                >
                  Due Date {getSortIndicator('dueDate')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amountDue')}
                >
                  Amount {getSortIndicator('amountDue')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amountPaid')}
                >
                  Paid {getSortIndicator('amountPaid')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('invoiceStatus')}
                >
                  Status {getSortIndicator('invoiceStatus')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link href={`/finance/accounts-receivable/invoices/${invoice.id}`}>
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  {!customerId && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link 
                        href={`/finance/accounts-receivable/customers/${invoice.customerId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {customerMap.get(invoice.customerId)?.name || 'Unknown Customer'}
                      </Link>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.invoiceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(invoice.amountDue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {formatCurrency(invoice.amountPaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice)}`}>
                      {getStatusText(invoice)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {invoice.invoiceStatus !== InvoiceStatus.PAID && invoice.invoiceStatus !== InvoiceStatus.VOIDED && (
                      <Link 
                        href={`/finance/accounts-receivable/invoices/${invoice.id}/receive-payment`}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Record Payment
                      </Link>
                    )}
                    <Link 
                      href={`/finance/accounts-receivable/invoices/${invoice.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;