// src/components/finance/providers/ProviderPaymentHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { 
  Provider, 
  ProviderPayment,
  PaymentStatus,
  TuitionCredit
} from '@/types/finance';

interface ProviderPaymentHistoryProps {
  providerId: string;
  limit?: number;
  showViewAll?: boolean;
}

export function ProviderPaymentHistory({ 
  providerId, 
  limit = 5,
  showViewAll = true
}: ProviderPaymentHistoryProps) {
  const {
    providerPayments,
    tuitionCredits,
    fetchProviderPaymentsByProvider,
    fetchTuitionCreditsByProvider,
    paymentsLoading,
    tuitionCreditsLoading
  } = useFinanceStore();
  
  const [timeFrame, setTimeFrame] = useState<'all' | '30days' | '90days' | '12months'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  
  useEffect(() => {
    fetchProviderPaymentsByProvider(providerId);
    fetchTuitionCreditsByProvider(providerId);
  }, [providerId, fetchProviderPaymentsByProvider, fetchTuitionCreditsByProvider]);
  
  // Filter and sort payments based on current filters
  const filteredPayments = React.useMemo(() => {
    let filtered = [...providerPayments].filter(payment => payment.providerId === providerId);
    
    // Apply time frame filter
    if (timeFrame !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (timeFrame) {
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case '12months':
          cutoffDate.setMonth(now.getMonth() - 12);
          break;
      }
      
      filtered = filtered.filter(payment => new Date(payment.date) >= cutoffDate);
    }
    
    // Apply status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    // Apply limit if needed
    if (limit > 0) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }, [providerPayments, providerId, timeFrame, filterStatus, sortOrder, limit]);
  
  // Calculate payment metrics
  const paymentMetrics = React.useMemo(() => {
    const allProviderPayments = providerPayments.filter(payment => payment.providerId === providerId);
    
    // Total payments
    const totalPayments = allProviderPayments.length;
    
    // Total amount paid
    const totalAmountPaid = allProviderPayments
      .filter(payment => payment.status === PaymentStatus.COMPLETED)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Pending amount
    const pendingAmount = allProviderPayments
      .filter(payment => payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.PROCESSING)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Payment by type
    const regularPayments = allProviderPayments
      .filter(payment => !payment.qualityImprovementGrant)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const grantPayments = allProviderPayments
      .filter(payment => payment.qualityImprovementGrant)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // YTD payments
    const currentYear = new Date().getFullYear();
    const yearToDatePayments = allProviderPayments
      .filter(payment => 
        payment.status === PaymentStatus.COMPLETED &&
        new Date(payment.date).getFullYear() === currentYear
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      totalPayments,
      totalAmountPaid,
      pendingAmount,
      regularPayments,
      grantPayments,
      yearToDatePayments
    };
  }, [providerPayments, providerId]);
  
  // Getting tuition credits for each payment
  const getPaymentCredits = (payment: ProviderPayment) => {
    return tuitionCredits.filter(credit => 
      payment.tuitionCreditIds && payment.tuitionCreditIds.includes(credit.id)
    );
  };
  
  if (paymentsLoading || tuitionCreditsLoading) {
    return <div className="p-4 text-center">Loading payment history...</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Payment History</h2>
        
        {showViewAll && filteredPayments.length > 0 && (
          <Link
            href={`/finance/tuition-credits/providers/${providerId}/payments`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View All Payments
          </Link>
        )}
      </div>
      
      {/* Payment Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Total Received</div>
          <div className="text-2xl font-bold">${paymentMetrics.totalAmountPaid.toLocaleString()}</div>
          <div className="text-xs text-gray-500">From {paymentMetrics.totalPayments} payments</div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-bold">${paymentMetrics.pendingAmount.toLocaleString()}</div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Year to Date</div>
          <div className="text-2xl font-bold">${paymentMetrics.yearToDatePayments.toLocaleString()}</div>
          <div className="text-xs text-gray-500">For {new Date().getFullYear()}</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="all">All Time</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="12months">Last 12 Months</option>
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="ALL">All Statuses</option>
          <option value={PaymentStatus.PENDING}>Pending</option>
          <option value={PaymentStatus.PROCESSING}>Processing</option>
          <option value={PaymentStatus.COMPLETED}>Completed</option>
          <option value={PaymentStatus.FAILED}>Failed</option>
          <option value={PaymentStatus.VOIDED}>Voided</option>
        </select>
        
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      
      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No payments found matching the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => {
                const paymentCredits = getPaymentCredits(payment);
                
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="font-medium">{payment.description}</div>
                      {payment.reference && (
                        <div className="text-xs text-gray-500">Ref: {payment.reference}</div>
                      )}
                      {payment.qualityImprovementGrant && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                          Quality Grant
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.method}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {paymentCredits.length > 0 ? (
                        <span className="text-blue-600">{paymentCredits.length} credits</span>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/finance/tuition-credits/payments/${payment.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </Link>
                      {payment.status === PaymentStatus.COMPLETED && (
                        <Link
                          href={`/finance/tuition-credits/payments/${payment.id}/receipt`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Receipt
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Helper function to determine status color
function getStatusColor(status: PaymentStatus): string {
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