// src/components/finance/accounts-receivable/InvoiceDetail.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { Invoice, InvoiceStatus, Customer, ReceivablePayment } from '@/types/finance';

interface InvoiceDetailProps {
  invoiceId: string;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoiceId }) => {
  const { 
    fetchInvoiceById, 
    selectedInvoice, 
    invoicesLoading, 
    invoiceError,
    fetchCustomerById,
    selectedCustomer,
    fetchPaymentsByInvoice,
    receivablePayments,
    updateInvoiceStatus,
    voidInvoice,
    sendInvoice
  } = useFinanceStore();

  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);

  useEffect(() => {
    fetchInvoiceById(invoiceId);
  }, [invoiceId, fetchInvoiceById]);

  useEffect(() => {
    if (selectedInvoice) {
      fetchCustomerById(selectedInvoice.customerId);
      fetchPaymentsByInvoice(selectedInvoice.id);
    }
  }, [selectedInvoice, fetchCustomerById, fetchPaymentsByInvoice]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusClass = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case InvoiceStatus.SENT: return 'bg-blue-100 text-blue-800';
      case InvoiceStatus.PARTIALLY_PAID: return 'bg-yellow-100 text-yellow-800';
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-800';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-800';
      case InvoiceStatus.VOIDED: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (invoice: Invoice) => {
    if (
      invoice.invoiceStatus !== InvoiceStatus.PAID &&
      invoice.invoiceStatus !== InvoiceStatus.VOIDED &&
      new Date(invoice.dueDate) < new Date()
    ) {
      return true;
    }
    return false;
  };

  const handleSendInvoice = async () => {
    if (selectedInvoice && selectedInvoice.invoiceStatus === InvoiceStatus.DRAFT) {
      await sendInvoice(selectedInvoice.id);
      fetchInvoiceById(invoiceId);
    }
  };

  const handleVoidInvoice = async () => {
    if (!selectedInvoice || !voidReason.trim()) return;
    
    setIsVoiding(true);
    // Function only takes the ID parameter according to the store definition
    await voidInvoice(selectedInvoice.id);
    // We should consider enhancing the function to include void reason in the future
    setIsVoiding(false);
    setShowVoidModal(false);
    setVoidReason('');
    fetchInvoiceById(invoiceId);
  };

  if (invoicesLoading) {
    return <div className="p-4">Loading invoice details...</div>;
  }

  if (invoiceError) {
    return <div className="p-4 text-red-600">Error: {invoiceError}</div>;
  }

  if (!selectedInvoice) {
    return <div className="p-4">Invoice not found.</div>;
  }

  const invoice = selectedInvoice;
  const customer = selectedCustomer;
  const payments = receivablePayments || [];
  const remainingBalance = invoice.amountDue - invoice.amountPaid;
  const displayStatus = isOverdue(invoice) && invoice.invoiceStatus !== InvoiceStatus.PAID ? 'OVERDUE' : invoice.invoiceStatus;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusClass(invoice.invoiceStatus)}`}>
              {displayStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-gray-600">{invoice.description}</p>
        </div>
        
        <div className="flex gap-2">
          {invoice.invoiceStatus === InvoiceStatus.DRAFT && (
            <button
              onClick={handleSendInvoice}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Send Invoice
            </button>
          )}
          
          {(invoice.invoiceStatus === InvoiceStatus.DRAFT || invoice.invoiceStatus === InvoiceStatus.SENT) && (
            <button
              onClick={() => setShowVoidModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Void
            </button>
          )}
          
          {invoice.invoiceStatus !== InvoiceStatus.PAID && invoice.invoiceStatus !== InvoiceStatus.VOIDED && (
            <Link
              href={`/finance/accounts-receivable/invoices/${invoice.id}/receive-payment`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Record Payment
            </Link>
          )}
          
          {invoice.invoiceStatus === InvoiceStatus.DRAFT && (
            <Link
              href={`/finance/accounts-receivable/invoices/${invoice.id}/edit`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Edit
            </Link>
          )}
        </div>
      </div>
      
      {/* Invoice details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Customer</h3>
          {customer ? (
            <div className="space-y-3">
              <div>
                <p className="font-medium">
                  <Link href={`/finance/accounts-receivable/customers/${customer.id}`} className="text-blue-600 hover:underline">
                    {customer.name}
                  </Link>
                </p>
                <p className="text-sm text-gray-600">{customer.customerNumber}</p>
              </div>
              
              {customer.contactName && (
                <div>
                  <p className="text-sm text-gray-700">{customer.contactName}</p>
                  {customer.email && (
                    <p className="text-sm text-gray-600">
                      <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                        {customer.email}
                      </a>
                    </p>
                  )}
                  {customer.phone && (
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  )}
                </div>
              )}
              
              {customer.address && customer.address.street1 && (
                <div className="text-sm text-gray-600">
                  <p>{customer.address.street1}</p>
                  {customer.address.street2 && <p>{customer.address.street2}</p>}
                  <p>
                    {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                  </p>
                  <p>{customer.address.country}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Customer information unavailable</p>
          )}
        </div>
        
        {/* Invoice Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Invoice Details</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-1">
              <p className="text-sm text-gray-600">Invoice Number:</p>
              <p className="text-sm font-medium text-right">{invoice.invoiceNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <p className="text-sm text-gray-600">Invoice Date:</p>
              <p className="text-sm font-medium text-right">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <p className="text-sm text-gray-600">Due Date:</p>
              <p className="text-sm font-medium text-right">{formatDate(invoice.dueDate)}</p>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <p className="text-sm text-gray-600">Terms:</p>
              <p className="text-sm font-medium text-right">{invoice.paymentTerms || 'Net 30'}</p>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <p className="text-sm text-gray-600">Reference:</p>
              <p className="text-sm font-medium text-right">{invoice.reference || '-'}</p>
            </div>
          </div>
        </div>
        
        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-1">
              <p className="text-sm text-gray-600">Subtotal:</p>
              <p className="text-sm font-medium text-right">{formatCurrency(invoice.subtotal)}</p>
            </div>
            {invoice.discountAmount && invoice.discountAmount > 0 && (
              <div className="grid grid-cols-2 gap-1">
                <p className="text-sm text-gray-600">Discount:</p>
                <p className="text-sm font-medium text-right">-{formatCurrency(invoice.discountAmount)}</p>
              </div>
            )}
            {invoice.taxAmount && invoice.taxAmount > 0 && (
              <div className="grid grid-cols-2 gap-1">
                <p className="text-sm text-gray-600">Tax:</p>
                <p className="text-sm font-medium text-right">{formatCurrency(invoice.taxAmount)}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1 pt-2 border-t">
              <p className="text-sm font-medium text-gray-800">Total:</p>
              <p className="text-sm font-bold text-right">{formatCurrency(invoice.amountDue)}</p>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <p className="text-sm text-gray-600">Amount Paid:</p>
              <p className="text-sm font-medium text-green-600 text-right">{formatCurrency(invoice.amountPaid)}</p>
            </div>
            <div className="grid grid-cols-2 gap-1 pt-2 border-t">
              <p className="text-sm font-medium text-gray-800">Balance Due:</p>
              <p className="text-sm font-bold text-right">{formatCurrency(remainingBalance)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Invoice Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Invoice Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                {invoice.invoiceItems.some(item => item.discountPercent && item.discountPercent > 0) && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.invoiceItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  {invoice.invoiceItems.some(item => item.discountPercent && item.discountPercent > 0) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.discountPercent ? `${item.discountPercent}%` : '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={invoice.invoiceItems.some(item => item.discountPercent && item.discountPercent > 0) ? 4 : 3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(invoice.amountDue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Payment History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Payment History</h3>
        </div>
        {payments.length === 0 ? (
          <div className="p-6 text-gray-500">
            No payments have been recorded for this invoice.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.referenceNumber || payment.checkNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.method}
                      {payment.checkNumber && payment.method === 'CHECK' && ` #${payment.checkNumber}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-right">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        payment.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    Total Paid:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">
                    {formatCurrency(invoice.amountPaid)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      
      {/* Notes Section */}
      {(invoice.customerNotes || invoice.termsAndConditions) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invoice.customerNotes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-3">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.customerNotes}</p>
            </div>
          )}
          
          {invoice.termsAndConditions && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-3">Terms & Conditions</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.termsAndConditions}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Void Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Void Invoice</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to void this invoice? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for voiding
              </label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Please provide a reason for voiding this invoice"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowVoidModal(false);
                  setVoidReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isVoiding}
              >
                Cancel
              </button>
              <button
                onClick={handleVoidInvoice}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                disabled={isVoiding || !voidReason.trim()}
              >
                {isVoiding ? 'Voiding...' : 'Void Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;