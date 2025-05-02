// src/components/finance/accounts-payable/VendorDetail.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { VendorType, VendorStatus, TaxFormType } from '@/types/finance';

interface VendorDetailProps {
  vendorId: string;
}

export default function VendorDetail({ vendorId }: VendorDetailProps) {
  const { 
    selectedVendor, 
    vendorsLoading, 
    vendorError, 
    fetchVendorById,
    bills,
    billsLoading,
    fetchBillsByVendor
  } = useFinanceStore();
  
  useEffect(() => {
    fetchVendorById(vendorId);
    fetchBillsByVendor(vendorId);
  }, [vendorId, fetchVendorById, fetchBillsByVendor]);
  
  if (vendorsLoading) {
    return <div className="p-4 text-center">Loading vendor data...</div>;
  }
  
  if (vendorError) {
    return <div className="p-4 text-center text-red-500">Error loading vendor: {vendorError}</div>;
  }
  
  if (!selectedVendor) {
    return <div className="p-4 text-center">Vendor not found</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{selectedVendor.name}</h2>
        <div className="flex space-x-4">
          <Link
            href={`/finance/accounts-payable/vendors/${vendorId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
          >
            Edit Vendor
          </Link>
          <Link
            href={`/finance/accounts-payable/bills/new?vendorId=${vendorId}`}
            className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700"
          >
            Create Bill
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Vendor Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Vendor Information</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Vendor ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedVendor.vendorNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getVendorTypeColor(selectedVendor.type)}`}>
                    {formatVendorType(selectedVendor.type)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getVendorStatusColor(selectedVendor.status)}`}>
                    {formatVendorStatus(selectedVendor.status)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Provider</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedVendor.isProvider ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
          
          {/* Contact Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedVendor.contactName || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {selectedVendor.email ? (
                    <a href={`mailto:${selectedVendor.email}`} className="text-blue-600 hover:underline">
                      {selectedVendor.email}
                    </a>
                  ) : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {selectedVendor.phone ? (
                    <a href={`tel:${selectedVendor.phone}`} className="text-blue-600 hover:underline">
                      {selectedVendor.phone}
                    </a>
                  ) : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {selectedVendor.website ? (
                    <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedVendor.website}
                    </a>
                  ) : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Address */}
          {selectedVendor.address && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Address</h3>
              <address className="not-italic text-sm">
                {selectedVendor.address.street1}<br />
                {selectedVendor.address.street2 && <>{selectedVendor.address.street2}<br /></>}
                {selectedVendor.address.city}, {selectedVendor.address.state} {selectedVendor.address.zipCode}<br />
                {selectedVendor.address.country}
              </address>
            </div>
          )}
          
          {/* Payment Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Payment Information</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Terms</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedVendor.paymentTerms || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Default Expense Account</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedVendor.defaultAccountId || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedVendor.taxIdentification || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tax Form</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatTaxForm(selectedVendor.taxForm) || 'N/A'}</dd>
              </div>
              {selectedVendor.invoicingInstructions && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Invoicing Instructions</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedVendor.invoicingInstructions}</dd>
                </div>
              )}
            </dl>
          </div>
          
          {/* Notes */}
          {selectedVendor.notes && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Notes</h3>
              <p className="text-sm text-gray-900 whitespace-pre-line">{selectedVendor.notes}</p>
            </div>
          )}
        </div>
        
        <div className="col-span-1 space-y-6">
          {/* Vendor Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Vendor Summary</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">YTD Payments</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">${selectedVendor.yearToDatePayments.toLocaleString()}</dd>
              </div>
              {selectedVendor.lastPaymentDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Payment</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedVendor.lastPaymentDate)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Open Bills</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {billsLoading ? 'Loading...' : 
                    bills.filter(b => 
                      b.vendorId === vendorId && 
                      b.status !== 'PAID' && 
                      b.status !== 'VOIDED'
                    ).length}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/finance/accounts-payable/bills/new?vendorId=${vendorId}`}
                className="block w-full py-2 px-4 text-center bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Create New Bill
              </Link>
              <Link
                href={`/finance/accounts-payable/vendors/${vendorId}/bills`}
                className="block w-full py-2 px-4 text-center bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                View All Bills
              </Link>
              <Link
                href={`/finance/accounts-payable/vendors/${vendorId}/recurring-bills`}
                className="block w-full py-2 px-4 text-center bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                Manage Recurring Bills
              </Link>
              <Link
                href={`/finance/accounts-payable/vendors/${vendorId}/tax-documents`}
                className="block w-full py-2 px-4 text-center bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                Tax Documents
              </Link>
            </div>
          </div>
          
          {/* Recent Bills */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Bills</h3>
              <Link
                href={`/finance/accounts-payable/vendors/${vendorId}/bills`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            </div>
            {billsLoading ? (
              <p className="text-gray-500 text-sm">Loading bills...</p>
            ) : bills.filter(b => b.vendorId === vendorId).length === 0 ? (
              <p className="text-gray-500 text-sm">No bills found</p>
            ) : (
              <ul className="space-y-4">
                {bills
                  .filter(b => b.vendorId === vendorId)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map(bill => (
                    <li key={bill.id} className="border-b border-gray-200 pb-2 last:border-0">
                      <Link
                        href={`/finance/accounts-payable/bills/${bill.id}`}
                        className="block hover:bg-gray-50 p-2 -mx-2 rounded"
                      >
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{bill.invoiceNumber}</span>
                          <span className="text-sm font-medium">${bill.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatDate(bill.date)}</span>
                          <span className={`px-2 rounded-full ${getStatusColor(bill.status)}`}>
                            {formatStatus(bill.status)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
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

function formatTaxForm(taxForm?: TaxFormType): string {
  if (!taxForm) return '';
  
  switch (taxForm) {
    case TaxFormType.W9:
      return 'W-9';
    case TaxFormType.W8BEN:
      return 'W-8BEN';
    case TaxFormType.W8BENE:
      return 'W-8BEN-E';
    case TaxFormType.FORM_1099:
      return '1099';
    case TaxFormType.OTHER:
      return 'Other';
    default:
      return taxForm;
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatStatus(status: string): string {
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
}

function getStatusColor(status: string): string {
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
}