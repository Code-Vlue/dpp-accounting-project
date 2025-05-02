// src/app/finance/tuition-credits/providers/payments/reconciliation/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { 
  PaymentStatus, 
  Provider, 
  ProviderPayment,
  TuitionCredit
} from '@/types/finance';

export default function ProviderPaymentReconciliationPage() {
  // Unused variable prefixed with underscore
  const _router = useRouter();
  const { 
    providers, 
    providerPayments,
    tuitionCredits,
    fetchProviders,
    fetchProviderPayments,
    fetchTuitionCredits,
    updateProviderPayment
  } = useFinanceStore();

  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconciliationData, setReconciliationData] = useState<{
    paymentId: string;
    matched: boolean;
    notes: string;
  }[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  useEffect(() => {
    fetchProviders();
    fetchProviderPayments();
    fetchTuitionCredits();
  }, [fetchProviders, fetchProviderPayments, fetchTuitionCredits]);

  // Filter payments based on selected criteria
  const filteredPayments = providerPayments.filter(payment => {
    const matchesProvider = !selectedProviderId || payment.providerId === selectedProviderId;
    const matchesDateRange = 
      (!startDate || new Date(payment.date) >= new Date(startDate)) &&
      (!endDate || new Date(payment.date) <= new Date(endDate));
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    
    return matchesProvider && matchesDateRange && matchesStatus;
  });

  // Group payments by provider for easier display
  const paymentsByProvider: Record<string, {
    provider: Provider | undefined;
    payments: ProviderPayment[];
    totalAmount: number;
  }> = {};

  filteredPayments.forEach(payment => {
    if (!paymentsByProvider[payment.providerId]) {
      const provider = providers.find(p => p.id === payment.providerId);
      paymentsByProvider[payment.providerId] = {
        provider,
        payments: [],
        totalAmount: 0
      };
    }
    
    paymentsByProvider[payment.providerId].payments.push(payment);
    paymentsByProvider[payment.providerId].totalAmount += payment.amount;
  });

  // Initialize reconciliation mode
  const startReconciliation = () => {
    const initialData = filteredPayments
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .map(payment => ({
        paymentId: payment.id,
        matched: false,
        notes: ''
      }));
    
    setReconciliationData(initialData);
    setIsReconciling(true);
  };

  // Cancel reconciliation mode
  const cancelReconciliation = () => {
    setReconciliationData([]);
    setIsReconciling(false);
    setSelectedPayments([]);
  };

  // Save reconciliation data
  const saveReconciliation = async () => {
    // Process each payment with reconciliation data
    const updates = reconciliationData.map(async data => {
      if (data.matched) {
        // Update payment with reconciliation notes
        return updateProviderPayment(data.paymentId, {
          notes: data.notes ? `${data.notes}\n\nReconciled on ${new Date().toLocaleDateString()}` : `Reconciled on ${new Date().toLocaleDateString()}`
        });
      }
      return null;
    });
    
    await Promise.all(updates);
    
    // Exit reconciliation mode
    setIsReconciling(false);
    setReconciliationData([]);
    setSelectedPayments([]);
  };

  // Handle payment selection for bulk operations
  const handlePaymentSelection = (paymentId: string) => {
    setSelectedPayments(current => {
      if (current.includes(paymentId)) {
        return current.filter(id => id !== paymentId);
      } else {
        return [...current, paymentId];
      }
    });
  };

  // Toggle all payments selection
  const toggleAllPayments = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map(p => p.id));
    }
  };

  // Handle reconciliation data change
  const handleReconciliationChange = (paymentId: string, matched: boolean, notes: string = '') => {
    setReconciliationData(current => 
      current.map(item => 
        item.paymentId === paymentId ? { ...item, matched, notes } : item
      )
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provider Payment Reconciliation</h1>
        <div className="flex space-x-2">
          {!isReconciling ? (
            <button
              onClick={startReconciliation}
              disabled={filteredPayments.filter(p => p.status === PaymentStatus.COMPLETED).length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
            >
              Start Reconciliation
            </button>
          ) : (
            <>
              <button
                onClick={saveReconciliation}
                className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700"
              >
                Save Reconciliation
              </button>
              <button
                onClick={cancelReconciliation}
                className="px-4 py-2 bg-gray-600 text-white rounded shadow-sm hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          )}
          <Link
            href="/finance/tuition-credits/providers/payments/new-batch"
            className="px-4 py-2 bg-purple-600 text-white rounded shadow-sm hover:bg-purple-700"
          >
            New Payment Batch
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="providerFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              id="providerFilter"
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Providers</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'ALL')}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="ALL">All Statuses</option>
              <option value={PaymentStatus.PENDING}>Pending</option>
              <option value={PaymentStatus.PROCESSING}>Processing</option>
              <option value={PaymentStatus.COMPLETED}>Completed</option>
              <option value={PaymentStatus.FAILED}>Failed</option>
              <option value={PaymentStatus.VOIDED}>Voided</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reconciliation Summary */}
      {isReconciling && (
        <div className="bg-blue-50 p-6 rounded-lg shadow mb-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Reconciliation in Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-blue-800">Total Payments:</div>
              <div className="text-lg font-bold">{reconciliationData.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-800">Matched Payments:</div>
              <div className="text-lg font-bold">{reconciliationData.filter(d => d.matched).length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-800">Unmatched Payments:</div>
              <div className="text-lg font-bold">{reconciliationData.filter(d => !d.matched).length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        {Object.entries(paymentsByProvider).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payments found matching the selected filters.
          </div>
        ) : (
          <>
            {Object.entries(paymentsByProvider).map(([providerId, { provider, payments, totalAmount }]) => (
              <div key={providerId} className="mb-8">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                  {provider?.name || 'Unknown Provider'} 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({payments.length} payment{payments.length !== 1 ? 's' : ''}, Total: ${totalAmount.toLocaleString()})
                  </span>
                </h3>
                
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {isReconciling && (
                        <th className="py-2 px-3 text-left">
                          <input
                            type="checkbox"
                            checked={payments.every(p => selectedPayments.includes(p.id))}
                            onChange={() => toggleAllPayments()}
                            className="h-4 w-4"
                          />
                        </th>
                      )}
                      <th className="py-2 px-3 text-left">Date</th>
                      <th className="py-2 px-3 text-left">Description</th>
                      <th className="py-2 px-3 text-left">Method</th>
                      <th className="py-2 px-3 text-left">Amount</th>
                      <th className="py-2 px-3 text-left">Credits</th>
                      <th className="py-2 px-3 text-left">Status</th>
                      {isReconciling ? (
                        <th className="py-2 px-3 text-left">Reconciliation</th>
                      ) : (
                        <th className="py-2 px-3 text-left">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      // Look up tuition credits for this payment
                      const relatedCredits = tuitionCredits.filter(credit => 
                        payment.tuitionCreditIds.includes(credit.id)
                      );
                      
                      // Get reconciliation data for this payment if in reconciliation mode
                      const reconciliation = reconciliationData.find(d => d.paymentId === payment.id);
                      
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          {isReconciling && (
                            <td className="py-3 px-3">
                              <input
                                type="checkbox"
                                checked={selectedPayments.includes(payment.id)}
                                onChange={() => handlePaymentSelection(payment.id)}
                                className="h-4 w-4"
                              />
                            </td>
                          )}
                          <td className="py-3 px-3">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium">{payment.description}</div>
                            {payment.reference && (
                              <div className="text-sm text-gray-500">Ref: {payment.reference}</div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {payment.method}
                          </td>
                          <td className="py-3 px-3 font-medium">
                            ${payment.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium">{relatedCredits.length}</span>
                            <span className="text-sm text-gray-500 ml-1">credits</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          {isReconciling && payment.status === PaymentStatus.COMPLETED ? (
                            <td className="py-3 px-3">
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`matched-${payment.id}`}
                                    checked={reconciliation?.matched || false}
                                    onChange={(e) => handleReconciliationChange(
                                      payment.id, 
                                      e.target.checked,
                                      reconciliation?.notes || ''
                                    )}
                                    className="h-4 w-4 mr-2"
                                  />
                                  <label htmlFor={`matched-${payment.id}`} className="text-sm">
                                    Payment Matched
                                  </label>
                                </div>
                                {reconciliation?.matched && (
                                  <input
                                    type="text"
                                    placeholder="Reconciliation notes..."
                                    value={reconciliation?.notes || ''}
                                    onChange={(e) => handleReconciliationChange(
                                      payment.id,
                                      true,
                                      e.target.value
                                    )}
                                    className="w-full text-sm p-1 border border-gray-300 rounded"
                                  />
                                )}
                              </div>
                            </td>
                          ) : (
                            <td className="py-3 px-3">
                              {isReconciling ? (
                                <span className="text-sm text-gray-500">Not eligible</span>
                              ) : (
                                <div className="flex space-x-2">
                                  <Link
                                    href={`/finance/tuition-credits/payments/${payment.id}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    View
                                  </Link>
                                  {payment.status === PaymentStatus.PENDING && (
                                    <Link
                                      href={`/finance/tuition-credits/payments/${payment.id}/process`}
                                      className="text-green-600 hover:text-green-800 text-sm"
                                    >
                                      Process
                                    </Link>
                                  )}
                                  {payment.status !== PaymentStatus.VOIDED && (
                                    <Link
                                      href={`/finance/tuition-credits/payments/${payment.id}/void`}
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      Void
                                    </Link>
                                  )}
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// Helper function to get status color class
function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case PaymentStatus.PROCESSING:
      return 'bg-blue-100 text-blue-800';
    case PaymentStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    case PaymentStatus.FAILED:
      return 'bg-red-100 text-red-800';
    case PaymentStatus.VOIDED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}