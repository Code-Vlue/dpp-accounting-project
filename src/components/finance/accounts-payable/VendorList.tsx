// src/components/finance/accounts-payable/VendorList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { Vendor, VendorType, VendorStatus } from '@/types/finance';

interface VendorListProps {
  searchTerm?: string;
  vendorType?: VendorType;
  status?: VendorStatus;
}

export default function VendorList({ searchTerm = '', vendorType, status }: VendorListProps) {
  const { vendors, vendorsLoading, vendorError, fetchVendors } = useFinanceStore();
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  
  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);
  
  useEffect(() => {
    let filtered = [...vendors];
    
    // Filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(vendor => 
        vendor.name.toLowerCase().includes(term) || 
        vendor.vendorNumber.toLowerCase().includes(term) ||
        (vendor.contactName && vendor.contactName.toLowerCase().includes(term))
      );
    }
    
    // Filter by vendor type if provided
    if (vendorType) {
      filtered = filtered.filter(vendor => vendor.type === vendorType);
    }
    
    // Filter by status if provided
    if (status) {
      filtered = filtered.filter(vendor => vendor.status === status);
    }
    
    setFilteredVendors(filtered);
  }, [vendors, searchTerm, vendorType, status]);
  
  if (vendorsLoading) {
    return <div className="p-4 text-center">Loading vendors...</div>;
  }
  
  if (vendorError) {
    return <div className="p-4 text-center text-red-500">Error loading vendors: {vendorError}</div>;
  }
  
  if (filteredVendors.length === 0) {
    return <div className="p-4 text-center">No vendors found.</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Vendor</th>
            <th className="py-2 px-4 border-b text-left">Type</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">YTD Payments</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVendors.map((vendor) => (
            <tr key={vendor.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{vendor.name}</div>
                <div className="text-sm text-gray-500">ID: {vendor.vendorNumber}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getVendorTypeColor(vendor.type)}`}>
                  {formatVendorType(vendor.type)}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getVendorStatusColor(vendor.status)}`}>
                  {formatVendorStatus(vendor.status)}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">${vendor.yearToDatePayments.toLocaleString()}</div>
                {vendor.lastPaymentDate && (
                  <div className="text-sm text-gray-500">
                    Last: {formatDate(vendor.lastPaymentDate)}
                  </div>
                )}
              </td>
              <td className="py-2 px-4 border-b">
                <div className="flex space-x-2">
                  <Link 
                    href={`/finance/accounts-payable/vendors/${vendor.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                  <Link 
                    href={`/finance/accounts-payable/vendors/${vendor.id}/edit`}
                    className="text-green-600 hover:text-green-800"
                  >
                    Edit
                  </Link>
                  <Link 
                    href={`/finance/accounts-payable/vendors/${vendor.id}/bills`}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    Bills
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatVendorType(type: VendorType): string {
  switch (type) {
    case VendorType.PROVIDER:
      return 'Provider';
    case VendorType.SUPPLIER:
      return 'Supplier';
    case VendorType.CONTRACTOR:
      return 'Contractor';
    case VendorType.GOVERNMENT:
      return 'Government';
    case VendorType.NONPROFIT:
      return 'Non-Profit';
    case VendorType.OTHER:
      return 'Other';
    default:
      return type;
  }
}

function getVendorTypeColor(type: VendorType): string {
  switch (type) {
    case VendorType.PROVIDER:
      return 'bg-blue-100 text-blue-800';
    case VendorType.SUPPLIER:
      return 'bg-green-100 text-green-800';
    case VendorType.CONTRACTOR:
      return 'bg-purple-100 text-purple-800';
    case VendorType.GOVERNMENT:
      return 'bg-yellow-100 text-yellow-800';
    case VendorType.NONPROFIT:
      return 'bg-pink-100 text-pink-800';
    case VendorType.OTHER:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatVendorStatus(status: VendorStatus): string {
  switch (status) {
    case VendorStatus.ACTIVE:
      return 'Active';
    case VendorStatus.INACTIVE:
      return 'Inactive';
    case VendorStatus.PENDING:
      return 'Pending';
    case VendorStatus.BLOCKED:
      return 'Blocked';
    default:
      return status;
  }
}

function getVendorStatusColor(status: VendorStatus): string {
  switch (status) {
    case VendorStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case VendorStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800';
    case VendorStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case VendorStatus.BLOCKED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}