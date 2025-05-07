// src/components/finance/accounts-payable/RecurringBillList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { RecurrenceFrequency } from '@/types/finance';

interface RecurringBillListProps {
  vendorId?: string;
  limit?: number;
}

export default function RecurringBillList({ vendorId, limit }: RecurringBillListProps) {
  const { 
    recurringBills, 
    recurringBillsLoading, 
    recurringBillError, 
    fetchRecurringBills,
    vendors,
    vendorsLoading,
    fetchVendors,
    generateBillFromRecurring
  } = useFinanceStore();
  
  const [filteredBills, setFilteredBills] = useState([]);
  
  useEffect(() => {
    fetchRecurringBills();
    
    if (vendors.length === 0) {
      fetchVendors();
    }
  }, [fetchRecurringBills, vendors, fetchVendors]);
  
  useEffect(() => {
    let filtered = [...recurringBills];
    
    if (vendorId) {
      filtered = filtered.filter(bill => bill.vendorId === vendorId);
    }
    
    if (limit && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }
    
    setFilteredBills(filtered);
  }, [recurringBills, vendorId, limit]);
  
  // Helper function to get vendor name
  function getVendorName(vendorId: string): string | undefined {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name;
  }
  
  const handleGenerateBill = async (recurringBillId: string) => {
    await generateBillFromRecurring(recurringBillId);
  };
  
  if (recurringBillsLoading) {
    return <div className="p-4 text-center">Loading recurring bills...</div>;
  }
  
  if (recurringBillError) {
    return <div className="p-4 text-center text-red-500">Error loading recurring bills: {recurringBillError}</div>;
  }
  
  if (filteredBills.length === 0) {
    return <div className="p-4 text-center">No recurring bills found.</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Description</th>
            <th className="py-2 px-4 border-b text-left">Vendor</th>
            <th className="py-2 px-4 border-b text-left">Frequency</th>
            <th className="py-2 px-4 border-b text-left">Next Generation</th>
            <th className="py-2 px-4 border-b text-right">Amount</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBills.map((bill) => (
            <tr key={bill.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{bill.description}</div>
                {bill.lastGeneratedDate && (
                  <div className="text-xs text-gray-500">
                    Last: {formatDate(bill.lastGeneratedDate)}
                  </div>
                )}
              </td>
              <td className="py-2 px-4 border-b">
                {!vendorsLoading ? 
                  <div className="font-medium">
                    <Link 
                      href={`/finance/accounts-payable/vendors/${bill.vendorId}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {getVendorName(bill.vendorId) || 'Unknown Vendor'}
                    </Link>
                  </div> : 
                  <div>Loading...</div>
                }
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{formatFrequency(bill.frequency)}</div>
                {bill.dayOfMonth && (
                  <div className="text-xs text-gray-500">
                    Day: {bill.dayOfMonth}
                  </div>
                )}
              </td>
              <td className="py-2 px-4 border-b">
                {formatDate(bill.nextGenerationDate)}
              </td>
              <td className="py-2 px-4 border-b text-right">
                <div className="font-medium">${bill.amount.toLocaleString()}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${bill.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {bill.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-2 px-4 border-b text-right">
                <div className="flex justify-end space-x-2">
                  <Link 
                    href={`/finance/accounts-payable/recurring-bills/${bill.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                  <Link 
                    href={`/finance/accounts-payable/recurring-bills/${bill.id}/edit`}
                    className="text-green-600 hover:text-green-800"
                  >
                    Edit
                  </Link>
                  {bill.active && (
                    <button
                      onClick={() => handleGenerateBill(bill.id)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Generate Bill
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatFrequency(frequency: RecurrenceFrequency): string {
  switch (frequency) {
    case 'DAILY':
      return 'Daily';
    case 'WEEKLY':
      return 'Weekly';
    case 'BIWEEKLY':
      return 'Bi-weekly';
    case 'MONTHLY':
      return 'Monthly';
    case 'QUARTERLY':
      return 'Quarterly';
    case 'ANNUALLY':
      return 'Annually';
    case 'CUSTOM':
      return 'Custom';
    default:
      return frequency;
  }
}