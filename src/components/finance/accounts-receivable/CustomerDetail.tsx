// src/components/finance/accounts-receivable/CustomerDetail.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { Invoice, ReceivablePayment } from '@/types/finance';

interface CustomerDetailProps {
  customerId: string;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId }) => {
  const { 
    fetchCustomerById, 
    selectedCustomer, 
    customersLoading, 
    customerError,
    fetchInvoicesByCustomer,
    invoices,
    fetchPaymentsByInvoice
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'activity'>('overview');
  const [payments, setPayments] = useState<ReceivablePayment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  useEffect(() => {
    fetchCustomerById(customerId);
    fetchInvoicesByCustomer(customerId);
  }, [customerId, fetchCustomerById, fetchInvoicesByCustomer]);

  useEffect(() => {
    const fetchAllPayments = async () => {
      setIsLoadingPayments(true);
      const allPayments: ReceivablePayment[] = [];
      
      for (const invoice of invoices) {
        const invoicePayments = await useFinanceStore.getState().fetchPaymentsByInvoice(invoice.id);
        if (invoicePayments) {
          allPayments.push(...useFinanceStore.getState().receivablePayments);
        }
      }
      
      setPayments(allPayments);
      setIsLoadingPayments(false);
    };
    
    if (invoices.length > 0) {
      fetchAllPayments();
    }
  }, [invoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (customersLoading) {
    return <div className="p-4">Loading customer details...</div>;
  }

  if (customerError) {
    return <div className="p-4 text-red-600">Error: {customerError}</div>;
  }

  if (!selectedCustomer) {
    return <div className="p-4">Customer not found.</div>;
  }

  const customer = selectedCustomer;
  const outstandingBalance = invoices.reduce(
    (total, invoice) => total + (invoice.amountDue - invoice.amountPaid), 
    0
  );

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'PARTIALLY_PAID': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'VOIDED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-gray-600">{customer.customerNumber}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/finance/accounts-receivable/customers/${customer.id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Edit
          </Link>
          <Link
            href={`/finance/accounts-receivable/invoices/new?customerId=${customer.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Invoice
          </Link>
        </div>
      </div>

      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'overview' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'invoices' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'payments' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'activity' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Year-to-Date Receivables
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(customer.yearToDateReceivables)}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Outstanding Balance
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(outstandingBalance)}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Credit Limit
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {customer.creditLimit ? formatCurrency(customer.creditLimit) : 'Not Set'}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-full bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Customer Information
              </h3>
              <div className="mt-5 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{customer.name}</dd>
                  </div>
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Customer Number</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{customer.customerNumber}</dd>
                  </div>
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{customer.type.replace(/_/g, ' ')}</dd>
                  </div>
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          customer.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                          customer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}
                      >
                        {customer.status}
                      </span>
                    </dd>
                  </div>
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{customer.contactName || '-'}</dd>
                  </div>
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {customer.email ? <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">{customer.email}</a> : '-'}
                    </dd>
                  </div>
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{customer.phone || '-'}</dd>
                  </div>
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {customer.website ? (
                        <a 
                          href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {customer.website}
                        </a>
                      ) : '-'}
                    </dd>
                  </div>
                  {customer.address && customer.address.street1 && (
                    <div className="py-4 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        <div>{customer.address.street1}</div>
                        {customer.address.street2 && <div>{customer.address.street2}</div>}
                        <div>
                          {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                        </div>
                        <div>{customer.address.country}</div>
                      </dd>
                    </div>
                  )}
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Payment Terms</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{customer.paymentTerms || 'Net 30'}</dd>
                  </div>
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{customer.taxIdentification || '-'}</dd>
                  </div>
                  <div className="py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Last Payment</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {customer.lastPaymentReceived ? formatDate(customer.lastPaymentReceived) : 'No payments recorded'}
                    </dd>
                  </div>
                  {customer.billingInstructions && (
                    <div className="py-4 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Billing Instructions</dt>
                      <dd className="text-sm text-gray-900 col-span-2 whitespace-pre-line">
                        {customer.billingInstructions}
                      </dd>
                    </div>
                  )}
                  {customer.notes && (
                    <div className="py-4 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="text-sm text-gray-900 col-span-2 whitespace-pre-line">
                        {customer.notes}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Invoices
            </h3>
            <Link
              href={`/finance/accounts-receivable/invoices/new?customerId=${customer.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              New Invoice
            </Link>
          </div>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No invoices found for this customer. Create a new invoice to get started.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <li key={invoice.id}>
                  <Link href={`/finance/accounts-receivable/invoices/${invoice.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="ml-4 text-sm text-gray-500">
                            {formatDate(invoice.invoiceDate)}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${getInvoiceStatusColor(invoice.invoiceStatus)}`}>
                            {invoice.invoiceStatus.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {invoice.description}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p className="text-gray-900 font-medium">
                            {formatCurrency(invoice.amountDue)}
                          </p>
                          {invoice.amountPaid > 0 && (
                            <p className="ml-2 text-green-600">
                              ({formatCurrency(invoice.amountPaid)} paid)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Payment History
            </h3>
          </div>
          {isLoadingPayments ? (
            <div className="text-center py-8 text-gray-500">
              Loading payment history...
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payment records found for this customer.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {payments.map((payment) => {
                const relatedInvoice = invoices.find(inv => inv.id === payment.invoiceId);
                return (
                  <li key={payment.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {payment.referenceNumber || `Payment #${payment.id.substring(0, 8)}`}
                          </p>
                          <p className="ml-4 text-sm text-gray-500">
                            {formatDate(payment.date)}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                              payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                              payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {payment.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {relatedInvoice ? (
                              <>
                                <span>Invoice: </span>
                                <Link href={`/finance/accounts-receivable/invoices/${relatedInvoice.id}`} className="ml-1 text-blue-600 hover:underline">
                                  {relatedInvoice.invoiceNumber}
                                </Link>
                              </>
                            ) : (
                              'Payment'
                            )}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <span>Method: {payment.method}</span>
                            {payment.checkNumber && (
                              <span className="ml-2">Check: {payment.checkNumber}</span>
                            )}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p className="text-green-600 font-medium">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="text-center py-8 text-gray-500">
            Activity log will be implemented in a future update.
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;