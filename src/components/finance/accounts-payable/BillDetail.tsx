// src/components/finance/accounts-payable/BillDetail.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { TransactionStatus, ExpenseCategory } from '@/types/finance';

interface BillDetailProps {
  billId: string;
}

export default function BillDetail({ billId }: BillDetailProps) {
  const { 
    selectedBill, 
    billsLoading, 
    billError, 
    fetchBillById,
    vendors,
    vendorsLoading,
    fetchVendors,
    payments,
    paymentsLoading,
    fetchPaymentsByBill,
    approveBill,
    postBill
  } = useFinanceStore();
  
  useEffect(() => {
    fetchBillById(billId);
    fetchVendors();
    fetchPaymentsByBill(billId);
  }, [billId, fetchBillById, fetchVendors, fetchPaymentsByBill]);
  
  if (billsLoading) {
    return <div className="p-4 text-center">Loading bill data...</div>;
  }
  
  if (billError) {
    return <div className="p-4 text-center text-red-500">Error loading bill: {billError}</div>;
  }
  
  if (!selectedBill) {
    return <div className="p-4 text-center">Bill not found</div>;
  }
  
  const vendor = vendors.find(v => v.id === selectedBill.vendorId);
  
  const handleApprove = async () => {
    await approveBill(billId, 'user1'); // TODO: Replace with actual user ID
  };
  
  const handlePost = async () => {
    await postBill(billId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          Bill: {selectedBill.invoiceNumber}
        </h2>
        <div className="flex space-x-4">
          {selectedBill.status === TransactionStatus.DRAFT && (
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
            >
              Approve
            </button>
          )}
          {selectedBill.status === TransactionStatus.APPROVED && (
            <button
              onClick={handlePost}
              className="px-4 py-2 bg-purple-600 text-white rounded shadow-sm hover:bg-purple-700"
            >
              Post to GL
            </button>
          )}
          {(selectedBill.status === TransactionStatus.POSTED || 
            selectedBill.status === TransactionStatus.PARTIALLY_PAID) && (
            <Link
              href={`/finance/accounts-payable/bills/${billId}/pay`}
              className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700"
            >
              Make Payment
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Bill Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Bill Information</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedBill.invoiceNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {vendorsLoading ? (
                    'Loading...'
                  ) : (
                    <Link
                      href={`/finance/accounts-payable/vendors/${selectedBill.vendorId}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {vendor?.name || 'Unknown Vendor'}
                    </Link>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Invoice Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedBill.invoiceDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`${isPastDue(selectedBill.dueDate) ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(selectedBill.dueDate)}
                    {isPastDue(selectedBill.dueDate) && ' (Overdue)'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedBill.status)}`}>
                    {formatStatus(selectedBill.status)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Reference</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedBill.reference || 'N/A'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedBill.description}</dd>
              </div>
            </dl>
          </div>
          
          {/* Bill Items */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Bill Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedBill.billItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.description}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{formatExpenseCategory(item.expenseCategory)}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={4} className="px-3 py-2 text-right font-medium">Total</td>
                    <td className="px-3 py-2 text-right font-medium">${selectedBill.amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {/* Payment History */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Payment History</h3>
            {paymentsLoading ? (
              <p className="text-sm text-gray-500">Loading payments...</p>
            ) : payments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments have been made for this bill.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-3 py-2 text-sm text-gray-900">{formatDate(payment.date)}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{formatPaymentMethod(payment.method)}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{payment.referenceNumber || 'N/A'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">${payment.amount.toFixed(2)}</td>
                        <td className="px-3 py-2 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(payment.status)}`}>
                            {formatPaymentStatus(payment.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-300">
                      <td colSpan={3} className="px-3 py-2 text-right font-medium">Total Paid</td>
                      <td className="px-3 py-2 text-right font-medium">${selectedBill.amountPaid.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right font-medium">Remaining</td>
                      <td className="px-3 py-2 text-right font-medium">${(selectedBill.amountDue - selectedBill.amountPaid).toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          {/* Bill Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Bill Summary</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">${selectedBill.amount.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                <dd className="mt-1 text-lg text-gray-900">${selectedBill.amountPaid.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Balance Due</dt>
                <dd className="mt-1 text-lg font-medium text-gray-900">${(selectedBill.amountDue - selectedBill.amountPaid).toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className={`mt-1 text-sm ${isPastDue(selectedBill.dueDate) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {formatDate(selectedBill.dueDate)}
                  {isPastDue(selectedBill.dueDate) && ' (Overdue)'}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Workflow Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Workflow Status</h3>
            <ol className="relative border-l border-gray-200">
              <li className="mb-6 ml-4">
                <div className="absolute w-3 h-3 bg-green-400 rounded-full mt-1.5 -left-1.5"></div>
                <div className="text-sm font-semibold text-gray-900">Created</div>
                <div className="text-xs text-gray-500">{formatDate(selectedBill.createdAt)}</div>
                <div className="text-xs text-gray-500">by {selectedBill.createdById}</div>
              </li>
              {selectedBill.status === TransactionStatus.DRAFT && (
                <li className="mb-6 ml-4">
                  <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5"></div>
                  <div className="text-sm font-normal text-gray-500">Pending Approval</div>
                </li>
              )}
              {(selectedBill.status === TransactionStatus.APPROVED || 
                selectedBill.status === TransactionStatus.POSTED || 
                selectedBill.status === TransactionStatus.PARTIALLY_PAID || 
                selectedBill.status === TransactionStatus.PAID) && (
                <li className="mb-6 ml-4">
                  <div className="absolute w-3 h-3 bg-green-400 rounded-full mt-1.5 -left-1.5"></div>
                  <div className="text-sm font-semibold text-gray-900">Approved</div>
                  {selectedBill.approvedAt && (
                    <>
                      <div className="text-xs text-gray-500">{formatDate(selectedBill.approvedAt)}</div>
                      <div className="text-xs text-gray-500">by {selectedBill.approvedById}</div>
                    </>
                  )}
                </li>
              )}
              {(selectedBill.status === TransactionStatus.DRAFT || 
                selectedBill.status === TransactionStatus.APPROVED) && (
                <li className="ml-4">
                  <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5"></div>
                  <div className="text-sm font-normal text-gray-500">Posted to GL</div>
                </li>
              )}
              {(selectedBill.status === TransactionStatus.POSTED || 
                selectedBill.status === TransactionStatus.PARTIALLY_PAID || 
                selectedBill.status === TransactionStatus.PAID) && (
                <li className="mb-6 ml-4">
                  <div className="absolute w-3 h-3 bg-green-400 rounded-full mt-1.5 -left-1.5"></div>
                  <div className="text-sm font-semibold text-gray-900">Posted to GL</div>
                  {selectedBill.postedAt && (
                    <div className="text-xs text-gray-500">{formatDate(selectedBill.postedAt)}</div>
                  )}
                </li>
              )}
              {(selectedBill.status === TransactionStatus.DRAFT || 
                selectedBill.status === TransactionStatus.APPROVED || 
                selectedBill.status === TransactionStatus.POSTED ||
                selectedBill.status === TransactionStatus.PARTIALLY_PAID) && (
                <li className="ml-4">
                  <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5"></div>
                  <div className="text-sm font-normal text-gray-500">
                    {selectedBill.status === TransactionStatus.PARTIALLY_PAID ? 'Fully Paid' : 'Paid'}
                  </div>
                </li>
              )}
              {selectedBill.status === TransactionStatus.PAID && (
                <li className="ml-4">
                  <div className="absolute w-3 h-3 bg-green-400 rounded-full mt-1.5 -left-1.5"></div>
                  <div className="text-sm font-semibold text-gray-900">Paid in Full</div>
                </li>
              )}
            </ol>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {selectedBill.status === TransactionStatus.DRAFT && (
                <button
                  onClick={handleApprove}
                  className="block w-full py-2 px-4 text-center bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Approve Bill
                </button>
              )}
              {selectedBill.status === TransactionStatus.APPROVED && (
                <button
                  onClick={handlePost}
                  className="block w-full py-2 px-4 text-center bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  Post to General Ledger
                </button>
              )}
              {(selectedBill.status === TransactionStatus.POSTED || 
                selectedBill.status === TransactionStatus.PARTIALLY_PAID) && (
                <Link
                  href={`/finance/accounts-payable/bills/${billId}/pay`}
                  className="block w-full py-2 px-4 text-center bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Make Payment
                </Link>
              )}
              {/* Allow printing for all status except DRAFT */}
              {selectedBill.status !== TransactionStatus.DRAFT && (
                <Link
                  href={`/finance/accounts-payable/bills/${billId}/print`}
                  className="block w-full py-2 px-4 text-center bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Print Bill
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
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

function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'CHECK':
      return 'Check';
    case 'ACH':
      return 'ACH';
    case 'WIRE':
      return 'Wire Transfer';
    case 'CREDIT_CARD':
      return 'Credit Card';
    case 'CASH':
      return 'Cash';
    case 'OTHER':
      return 'Other';
    default:
      return method;
  }
}

function formatPaymentStatus(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'PROCESSING':
      return 'Processing';
    case 'COMPLETED':
      return 'Completed';
    case 'FAILED':
      return 'Failed';
    case 'VOIDED':
      return 'Void';
    default:
      return status;
  }
}

function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'VOIDED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatExpenseCategory(category: ExpenseCategory): string {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function isPastDue(dueDate: Date): boolean {
  return new Date(dueDate) < new Date();
}