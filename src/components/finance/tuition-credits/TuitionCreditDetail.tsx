// src/components/finance/tuition-credits/TuitionCreditDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCredit, TuitionCreditStatus, Provider } from '@/types/finance';

interface TuitionCreditDetailProps {
  creditId: string;
}

export default function TuitionCreditDetail({ creditId }: TuitionCreditDetailProps) {
  const router = useRouter();
  const { 
    selectedTuitionCredit, 
    tuitionCreditsLoading, 
    tuitionCreditsError, 
    providers,
    fetchTuitionCreditById,
    fetchProviders,
    approveTuitionCredit,
    rejectTuitionCredit,
    voidTuitionCredit
  } = useFinanceStore();
  
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [voidReason, setVoidReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTuitionCreditById(creditId);
    fetchProviders();
  }, [creditId, fetchTuitionCreditById, fetchProviders]);
  
  const handleApprove = async () => {
    setIsApproving(true);
    setActionError(null);
    
    try {
      await approveTuitionCredit(creditId);
      router.refresh();
    } catch (error: any) {
      setActionError(`Failed to approve tuition credit: ${error.message}`);
    } finally {
      setIsApproving(false);
    }
  };
  
  const handleReject = async () => {
    if (!rejectionReason) {
      setActionError('Please provide a reason for rejection.');
      return;
    }
    
    setIsRejecting(true);
    setActionError(null);
    
    try {
      await rejectTuitionCredit(creditId, rejectionReason);
      setShowRejectionModal(false);
      router.refresh();
    } catch (error: any) {
      setActionError(`Failed to reject tuition credit: ${error.message}`);
    } finally {
      setIsRejecting(false);
    }
  };
  
  const handleVoid = async () => {
    if (!voidReason) {
      setActionError('Please provide a reason for voiding.');
      return;
    }
    
    setIsVoiding(true);
    setActionError(null);
    
    try {
      await voidTuitionCredit(creditId, voidReason);
      setShowVoidModal(false);
      router.refresh();
    } catch (error: any) {
      setActionError(`Failed to void tuition credit: ${error.message}`);
    } finally {
      setIsVoiding(false);
    }
  };
  
  if (tuitionCreditsLoading) {
    return <div className="p-4 text-center">Loading tuition credit data...</div>;
  }
  
  if (tuitionCreditsError) {
    return <div className="p-4 text-center text-red-500">Error loading tuition credit: {tuitionCreditsError}</div>;
  }
  
  if (!selectedTuitionCredit) {
    return <div className="p-4 text-center text-amber-500">Tuition credit not found with ID: {creditId}</div>;
  }
  
  const credit = selectedTuitionCredit;
  const provider = providers.find(p => p.id === credit.providerId);
  
  return (
    <div className="space-y-6">
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {actionError}
        </div>
      )}
      
      <div className="flex flex-wrap justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tuition Credit for {credit.studentName}</h2>
          <div className="flex items-center mt-1 text-gray-600">
            <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${getCreditStatusColor(credit.creditStatus)}`}>
              {formatCreditStatus(credit.creditStatus)}
            </span>
            {credit.isAdjustment && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 mr-2">
                Adjustment
              </span>
            )}
            <span className="text-sm">ID: {credit.id.substring(0, 8)}</span>
          </div>
        </div>
        
        <div className="space-x-2 mt-2 md:mt-0">
          {credit.creditStatus === TuitionCreditStatus.DRAFT && (
            <Link 
              href={`/finance/tuition-credits/credits/${creditId}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
            >
              Edit Credit
            </Link>
          )}
          
          {credit.creditStatus === TuitionCreditStatus.PENDING_APPROVAL && (
            <>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700 disabled:bg-green-300"
              >
                {isApproving ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => setShowRejectionModal(true)}
                disabled={isRejecting}
                className="px-4 py-2 bg-red-600 text-white rounded shadow-sm hover:bg-red-700 disabled:bg-red-300"
              >
                Reject
              </button>
            </>
          )}
          
          {(credit.creditStatus === TuitionCreditStatus.APPROVED || credit.creditStatus === TuitionCreditStatus.PROCESSED) && (
            <Link 
              href={`/finance/tuition-credits/credits/${creditId}/adjustment`}
              className="px-4 py-2 bg-purple-600 text-white rounded shadow-sm hover:bg-purple-700"
            >
              Create Adjustment
            </Link>
          )}
          
          {credit.creditStatus !== TuitionCreditStatus.VOIDED && credit.creditStatus !== TuitionCreditStatus.PAID && (
            <button
              onClick={() => setShowVoidModal(true)}
              disabled={isVoiding}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-50 disabled:bg-gray-100"
            >
              Void Credit
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Credit Details</h3>
          </div>
          
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{credit.studentName}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{credit.studentId}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Provider</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {provider ? (
                    <Link
                      href={`/finance/tuition-credits/providers/${provider.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {provider.name}
                    </Link>
                  ) : (
                    `Provider ${credit.providerId.substring(0, 8)}`
                  )}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Credit Period</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDateRange(credit.creditPeriodStart, credit.creditPeriodEnd)}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Credit Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 font-bold">${credit.creditAmount.toLocaleString()}</dd>
              </div>
              
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">DPP Portion</dt>
                  <dd className="mt-1 text-sm text-gray-900">${credit.dppPortion.toLocaleString()}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Family Portion</dt>
                  <dd className="mt-1 text-sm text-gray-900">${credit.familyPortion.toLocaleString()}</dd>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{credit.description || 'No description provided'}</dd>
              </div>
              
              {credit.isAdjustment && (
                <>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Adjustment Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{credit.adjustmentNotes || 'No adjustment notes provided'}</dd>
                  </div>
                  
                  {credit.originalCreditId && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Original Credit</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <Link
                          href={`/finance/tuition-credits/credits/${credit.originalCreditId}`}
                          className="text-blue-600 hover:underline"
                        >
                          View Original Credit ({credit.originalCreditId.substring(0, 8)})
                        </Link>
                      </dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Status Information</h3>
          </div>
          
          <div className="p-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCreditStatusColor(credit.creditStatus)}`}>
                    {formatCreditStatus(credit.creditStatus)}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDateTime(credit.createdAt)}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDateTime(credit.updatedAt)}</dd>
              </div>
              
              {credit.approvalDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Approved</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDateTime(credit.approvalDate)}</dd>
                </div>
              )}
              
              {credit.rejectionReason && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                  <dd className="mt-1 text-sm text-gray-900">{credit.rejectionReason}</dd>
                </div>
              )}
              
              {credit.paymentBatchId && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Batch</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Link
                      href={`/finance/tuition-credits/batches/${credit.paymentBatchId}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Batch ({credit.paymentBatchId.substring(0, 8)})
                    </Link>
                  </dd>
                </div>
              )}
              
              {credit.paymentDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(credit.paymentDate)}</dd>
                </div>
              )}
              
              {credit.processingNotes && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Processing Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">{credit.processingNotes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
      
      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Reject Tuition Credit</h3>
            
            <div className="mb-4">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows={4}
                placeholder="Please provide a reason for rejection"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting || !rejectionReason}
                className="px-4 py-2 bg-red-600 text-white rounded shadow-sm hover:bg-red-700 disabled:bg-red-300"
              >
                {isRejecting ? 'Rejecting...' : 'Reject Credit'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Void Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Void Tuition Credit</h3>
            
            <div className="mb-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4">
                <p>Voiding a tuition credit cannot be undone. This action is permanent.</p>
              </div>
              
              <label htmlFor="voidReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Voiding *
              </label>
              <textarea
                id="voidReason"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows={4}
                placeholder="Please provide a reason for voiding this credit"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowVoidModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVoid}
                disabled={isVoiding || !voidReason}
                className="px-4 py-2 bg-red-600 text-white rounded shadow-sm hover:bg-red-700 disabled:bg-red-300"
              >
                {isVoiding ? 'Voiding...' : 'Void Credit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
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