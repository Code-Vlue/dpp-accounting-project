// src/components/finance/accounts-receivable/CustomerList.tsx
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { Customer, CustomerType, CustomerStatus } from '@/types/finance';

interface CustomerListProps {
  customerType?: CustomerType;
  searchQuery?: string;
  customers?: Customer[];
  isLoading?: boolean;
}

const CustomerList: React.FC<CustomerListProps> = ({ customerType, searchQuery = '', customers: propCustomers, isLoading: propIsLoading }) => {
  const { customers: storeCustomers, customersLoading: storeLoading, customerError, fetchCustomers, fetchCustomersByType } = useFinanceStore();
  
  // Use prop values if provided, otherwise use store values
  const customers = propCustomers || storeCustomers;
  const customersLoading = propIsLoading !== undefined ? propIsLoading : storeLoading;
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [sortField, setSortField] = useState<keyof Customer>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<{
    type: CustomerType | 'ALL';
    status: CustomerStatus | 'ALL';
  }>({
    type: customerType || 'ALL',
    status: 'ALL'
  });
  const [query, setQuery] = useState(searchQuery);

  useEffect(() => {
    if (customerType) {
      fetchCustomersByType(customerType);
    } else {
      fetchCustomers();
    }
  }, [customerType, fetchCustomers, fetchCustomersByType]);

  useEffect(() => {
    // Set filter.type when customerType prop changes
    if (customerType) {
      setFilter(prev => ({ ...prev, type: customerType }));
    }
  }, [customerType]);

  useEffect(() => {
    // Set query when searchQuery prop changes
    if (searchQuery) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    let result = [...customers];

    // Filter by type if not 'ALL'
    if (filter.type !== 'ALL') {
      result = result.filter(customer => customer.type === filter.type);
    }

    // Filter by status if not 'ALL'
    if (filter.status !== 'ALL') {
      result = result.filter(customer => customer.status === filter.status);
    }

    // Filter by search query
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      result = result.filter(
        customer =>
          customer.name.toLowerCase().includes(lowercaseQuery) ||
          customer.customerNumber.toLowerCase().includes(lowercaseQuery) ||
          (customer.contactName && customer.contactName.toLowerCase().includes(lowercaseQuery)) ||
          (customer.email && customer.email.toLowerCase().includes(lowercaseQuery))
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
        comparison = fieldA.getTime() - fieldB.getTime();
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        comparison = fieldA - fieldB;
      } else if (fieldA === null && fieldB !== null) {
        comparison = -1;
      } else if (fieldA !== null && fieldB === null) {
        comparison = 1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredCustomers(result);
  }, [customers, filter, query, sortField, sortDirection]);

  const handleSort = useCallback((field: keyof Customer) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleFilterChange = useCallback((
    filterKey: keyof typeof filter,
    value: CustomerType | CustomerStatus | 'ALL'
  ) => {
    setFilter(prev => ({ ...prev, [filterKey]: value }));
  }, []);

  const getSortIndicator = useCallback((field: keyof Customer) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? '▲' : '▼';
  }, [sortField, sortDirection]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }, []);

  if (customersLoading) {
    return <div className="p-4">Loading customers...</div>;
  }

  if (customerError) {
    return <div className="p-4 text-red-600">Error: {customerError}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Customers</h2>
        <Link 
          href="/finance/accounts-receivable/customers/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          New Customer
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded"
            value={filter.type}
            onChange={e => handleFilterChange('type', e.target.value as CustomerType | 'ALL')}
          >
            <option value="ALL">All Types</option>
            {Object.values(CustomerType).map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded"
            value={filter.status}
            onChange={e => handleFilterChange('status', e.target.value as CustomerStatus | 'ALL')}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(CustomerStatus).map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-4 rounded shadow">
          No customers found. {!customerType && !query && 'Create a new customer to get started.'}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name {getSortIndicator('name')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  Type {getSortIndicator('type')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status {getSortIndicator('status')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('contactName')}
                >
                  Contact {getSortIndicator('contactName')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('yearToDateReceivables')}
                >
                  YTD Receivables {getSortIndicator('yearToDateReceivables')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link href={`/finance/accounts-receivable/customers/${customer.id}`}>
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.type.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        customer.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        customer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.contactName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(customer.yearToDateReceivables)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      href={`/finance/accounts-receivable/customers/${customer.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <Link 
                      href={`/finance/accounts-receivable/invoices/new?customerId=${customer.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      New Invoice
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

export default CustomerList;