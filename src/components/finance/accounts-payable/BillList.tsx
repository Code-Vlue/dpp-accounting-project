// src/components/finance/accounts-payable/BillList.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { Bill, TransactionStatus } from '@/types/finance';

interface BillListProps {
  vendorId?: string;
  status?: TransactionStatus;
  searchTerm?: string;
  limit?: number;
}

export default function BillList({ 
  vendorId, 
  status, 
  searchTerm = '',
  limit
}: BillListProps) {
  const { 
    bills, 
    billsLoading, 
    billError, 
    fetchBills, 
    fetchBillsByVendor, 
    fetchBillsByStatus,
    vendors,
    vendorsLoading,
    fetchVendors
  } = useFinanceStore();
  
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  
  // Helper functions using useCallback to prevent re-renders
  const getVendorName = useCallback((vendorId: string): string | undefined => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name;
  }, [vendors]);
  
  const formatDate = useCallback((date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);
  
  const formatStatus = useCallback((status: string): string => {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'PENDING_APPROVAL':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'POSTED':
        return 'Posted';
      case 'PAID':
        return 'Paid';
      case 'PARTIALLY_PAID':
        return 'Partial';
      case 'VOIDED':
        return 'Void';
      default:
        return status;
    }
  }, []);
  
  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'POSTED':
        return 'bg-purple-100 text-purple-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_PAID':
        return 'bg-teal-100 text-teal-800';
      case 'VOIDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);
  
  const isPastDue = useCallback((dueDate: Date): boolean => {
    return new Date(dueDate) < new Date();
  }, []);
  
  const getDaysRemaining = useCallback((dueDate: Date): string => {
    const today = new Date();
    const due = new Date(dueDate);
    
    // Set hours to 0 to compare just the dates
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
    }
  }, []);
  
  const canPay = useCallback((bill: Bill): boolean => {
    return bill.status === TransactionStatus.POSTED || 
           bill.status === TransactionStatus.PARTIALLY_PAID;
  }, []);
  
  // Fetch bills based on props
  useEffect(() => {
    if (vendorId) {
      fetchBillsByVendor(vendorId);
    } else if (status) {
      fetchBillsByStatus(status);
    } else {
      fetchBills();
    }
    
    if (vendors.length === 0) {
      fetchVendors();
    }
  }, [vendorId, status, fetchBills, fetchBillsByVendor, fetchBillsByStatus, vendors, fetchVendors]);
  
  // Filter bills based on search term
  useEffect(() => {
    let filtered = [...bills];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(bill => 
        bill.invoiceNumber.toLowerCase().includes(term) ||
        bill.description.toLowerCase().includes(term) ||
        bill.reference?.toLowerCase().includes(term) ||
        getVendorName(bill.vendorId)?.toLowerCase().includes(term)
      );
    }
    
    // Limit the number of results if specified
    if (limit && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }
    
    setFilteredBills(filtered);
  }, [bills, searchTerm, limit, getVendorName]);
  
  if (billsLoading) {
    return <div className="p-4 text-center">Loading bills...</div>;
  }
  
  if (billError) {
    return <div className="p-4 text-center text-red-500">Error loading bills: {billError}</div>;
  }
  
  if (filteredBills.length === 0) {
    return <div className="p-4 text-center">No bills found.</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Bill</th>
            <th className="py-2 px-4 border-b text-left">Vendor</th>
            <th className="py-2 px-4 border-b text-left">Due Date</th>
            <th className="py-2 px-4 border-b text-right">Amount</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBills.map((bill) => (
            <tr key={bill.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{bill.invoiceNumber}</div>
                <div className="text-xs text-gray-500">{formatDate(bill.invoiceDate)}</div>
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
                <div className={`font-medium ${isPastDue(bill.dueDate) ? 'text-red-600' : ''}`}>
                  {formatDate(bill.dueDate)}
                </div>
                <div className="text-xs text-gray-500">
                  {getDaysRemaining(bill.dueDate)}
                </div>
              </td>
              <td className="py-2 px-4 border-b text-right">
                <div className="font-medium">${bill.amount.toLocaleString()}</div>
                {bill.amountPaid > 0 && (
                  <div className="text-xs text-gray-500">
                    Paid: ${bill.amountPaid.toLocaleString()}
                  </div>
                )}
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bill.status)}`}>
                  {formatStatus(bill.status)}
                </span>
              </td>
              <td className="py-2 px-4 border-b text-right">
                <div className="flex justify-end space-x-2">
                  <Link 
                    href={`/finance/accounts-payable/bills/${bill.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                  {canPay(bill) && (
                    <Link 
                      href={`/finance/accounts-payable/bills/${bill.id}/pay`}
                      className="text-green-600 hover:text-green-800"
                    >
                      Pay
                    </Link>
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