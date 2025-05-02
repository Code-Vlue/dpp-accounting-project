// src/app/finance/accounts-payable/vendors/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import VendorList from '@/components/finance/accounts-payable/VendorList';
import { VendorType, VendorStatus } from '@/types/finance';

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorType, setVendorType] = useState<VendorType | undefined>(undefined);
  const [status, setStatus] = useState<VendorStatus | undefined>(undefined);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Link
          href="/finance/accounts-payable/vendors/new"
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
        >
          Add New Vendor
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Vendors
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, ID, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="md:w-1/5">
            <label htmlFor="vendorType" className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Type
            </label>
            <select
              id="vendorType"
              value={vendorType || ''}
              onChange={(e) => setVendorType(e.target.value ? e.target.value as VendorType : undefined)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Types</option>
              {Object.values(VendorType).map(type => (
                <option key={type} value={type}>
                  {formatVendorType(type)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:w-1/5">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status || ''}
              onChange={(e) => setStatus(e.target.value ? e.target.value as VendorStatus : undefined)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Statuses</option>
              {Object.values(VendorStatus).map(status => (
                <option key={status} value={status}>
                  {formatVendorStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <VendorList 
          searchTerm={searchTerm}
          vendorType={vendorType}
          status={status}
        />
      </div>
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