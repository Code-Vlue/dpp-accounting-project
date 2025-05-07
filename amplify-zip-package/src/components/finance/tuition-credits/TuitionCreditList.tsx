// src/components/finance/tuition-credits/TuitionCreditList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCredit, TuitionCreditStatus } from '@/types/finance';

interface TuitionCreditListProps {
  searchTerm?: string;
  providerId?: string;
  status?: TuitionCreditStatus;
  startDate?: Date;
  endDate?: Date;
  // Required props
  credits: TuitionCredit[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  showProvider?: boolean;
  showStatus?: boolean;
  providers?: any[]; // Using any[] for now, should be properly typed
}

export default function TuitionCreditList({ 
  searchTerm = '', 
  providerId, 
  status, 
  startDate,
  endDate,
  credits: propCredits,
  onView,
  onEdit,
  showProvider = true,
  showStatus = true,
  providers = []
}: TuitionCreditListProps) {
  const { tuitionCredits, tuitionCreditsLoading, tuitionCreditsError, fetchTuitionCredits } = useFinanceStore();
  const [filteredCredits, setFilteredCredits] = useState<TuitionCredit[]>([]);
  
  useEffect(() => {
    // Only fetch if we're not given credits as props
    if (!propCredits) {
      fetchTuitionCredits();
    }
  }, [fetchTuitionCredits, propCredits]);
  
  useEffect(() => {
    // Start with either the provided credits or the ones from the store
    let filtered = propCredits ? [...propCredits] : [...tuitionCredits];
    
    // Filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(credit => 
        credit.studentName.toLowerCase().includes(term) || 
        credit.studentId.toLowerCase().includes(term) ||
        credit.description.toLowerCase().includes(term)
      );
    }
    
    // Filter by provider if provided
    if (providerId) {
      filtered = filtered.filter(credit => credit.providerId === providerId);
    }
    
    // Filter by status if provided
    if (status) {
      filtered = filtered.filter(credit => credit.creditStatus === status);
    }
    
    // Filter by date range if provided
    if (startDate) {
      filtered = filtered.filter(credit => new Date(credit.creditPeriodStart) >= startDate);
    }
    
    if (endDate) {
      filtered = filtered.filter(credit => new Date(credit.creditPeriodEnd) <= endDate);
    }
    
    setFilteredCredits(filtered);
  }, [propCredits, tuitionCredits, searchTerm, providerId, status, startDate, endDate]);
  
  // Only show loading/error states if we're not given credits via props
  if (!propCredits && tuitionCreditsLoading) {
    return <div className="p-4 text-center">Loading tuition credits...</div>;
  }
  
  if (!propCredits && tuitionCreditsError) {
    return <div className="p-4 text-center text-red-500">Error loading tuition credits: {tuitionCreditsError}</div>;
  }
  
  if (filteredCredits.length === 0) {
    return <div className="p-4 text-center">No tuition credits found.</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Student</th>
            <th className="py-2 px-4 border-b text-left">Provider</th>
            <th className="py-2 px-4 border-b text-left">Period</th>
            <th className="py-2 px-4 border-b text-left">Credit Amount</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCredits.map((credit) => (
            <tr key={credit.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{credit.studentName}</div>
                <div className="text-sm text-gray-500">ID: {credit.studentId}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{getProviderName(credit.providerId)}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{formatDateRange(credit.creditPeriodStart, credit.creditPeriodEnd)}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">${credit.creditAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  DPP: ${credit.dppPortion.toLocaleString()} | Family: ${credit.familyPortion.toLocaleString()}
                </div>
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getCreditStatusColor(credit.creditStatus)}`}>
                  {formatCreditStatus(credit.creditStatus)}
                </span>
                {credit.isAdjustment && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    Adjustment
                  </span>
                )}
              </td>
              <td className="py-2 px-4 border-b">
                <div className="flex space-x-2">
                  {onView ? (
                    <button 
                      onClick={() => onView(credit.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  ) : (
                    <Link 
                      href={`/finance/tuition-credits/credits/${credit.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  )}
                  
                  {credit.creditStatus === TuitionCreditStatus.DRAFT && (
                    onEdit ? (
                      <button 
                        onClick={() => onEdit(credit.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Edit
                      </button>
                    ) : (
                      <Link 
                        href={`/finance/tuition-credits/credits/${credit.id}/edit`}
                        className="text-green-600 hover:text-green-800"
                      >
                        Edit
                      </Link>
                    )
                  )}
                  
                  {credit.creditStatus === TuitionCreditStatus.PENDING_APPROVAL && (
                    <Link 
                      href={`/finance/tuition-credits/credits/${credit.id}/approve`}
                      className="text-amber-600 hover:text-amber-800"
                    >
                      Approve
                    </Link>
                  )}
                  
                  {(credit.creditStatus === TuitionCreditStatus.APPROVED || 
                    credit.creditStatus === TuitionCreditStatus.PROCESSED) && (
                    <Link 
                      href={`/finance/tuition-credits/credits/${credit.id}/adjustment`}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Adjust
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

// Helper functions
function getProviderName(providerId: string): string {
  // This would be replaced with a lookup from the store in a real implementation
  return `Provider ${providerId.substring(0, 5)}...`;
}

function formatDateRange(startDate: Date, endDate: Date): string {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${start} - ${end}`;
}

function formatCreditStatus(status: TuitionCreditStatus): string {
  switch (status) {
    case TuitionCreditStatus.DRAFT:
      return 'Draft';
    case TuitionCreditStatus.PENDING_APPROVAL:
      return 'Pending Approval';
    case TuitionCreditStatus.APPROVED:
      return 'Approved';
    case TuitionCreditStatus.PROCESSED:
      return 'Processed';
    case TuitionCreditStatus.PAID:
      return 'Paid';
    case TuitionCreditStatus.REJECTED:
      return 'Rejected';
    case TuitionCreditStatus.VOIDED:
      return 'Voided';
    default:
      return status;
  }
}

function getCreditStatusColor(status: TuitionCreditStatus): string {
  switch (status) {
    case TuitionCreditStatus.DRAFT:
      return 'bg-gray-100 text-gray-800';
    case TuitionCreditStatus.PENDING_APPROVAL:
      return 'bg-yellow-100 text-yellow-800';
    case TuitionCreditStatus.APPROVED:
      return 'bg-blue-100 text-blue-800';
    case TuitionCreditStatus.PROCESSED:
      return 'bg-indigo-100 text-indigo-800';
    case TuitionCreditStatus.PAID:
      return 'bg-green-100 text-green-800';
    case TuitionCreditStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case TuitionCreditStatus.VOIDED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}