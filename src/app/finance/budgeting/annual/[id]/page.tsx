// src/app/finance/budgeting/annual/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { BudgetStatus, BudgetType } from '@/types/finance';
import BudgetItemList from '@/components/finance/budgeting/BudgetItemList';

interface BudgetDetailPageProps {
  params: {
    id: string;
  };
}

export default function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const budgetId = params.id;
  const router = useRouter();
  const {
    selectedBudget,
    budgetLoading,
    budgetError,
    fetchBudgetById,
    updateBudgetStatus,
  } = useFinanceStore();
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<BudgetStatus | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch budget on component mount
  useEffect(() => {
    fetchBudgetById(budgetId);
  }, [budgetId, fetchBudgetById]);
  
  // Status badges
  const getBudgetStatusBadge = (status: BudgetStatus) => {
    const statusClasses = {
      [BudgetStatus.DRAFT]: 'bg-gray-200 text-gray-800',
      [BudgetStatus.PENDING_APPROVAL]: 'bg-yellow-100 text-yellow-800',
      [BudgetStatus.APPROVED]: 'bg-green-100 text-green-800',
      [BudgetStatus.ACTIVE]: 'bg-blue-100 text-blue-800',
      [BudgetStatus.CLOSED]: 'bg-gray-100 text-gray-800',
      [BudgetStatus.REJECTED]: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Handle status change button click
  const handleStatusChangeClick = (status: BudgetStatus) => {
    setNewStatus(status);
    setShowStatusModal(true);
  };
  
  // Handle status change confirmation
  const handleStatusChangeConfirm = async () => {
    if (!newStatus) return;
    
    setIsSubmitting(true);
    
    try {
      await updateBudgetStatus(budgetId, newStatus, statusReason);
      setShowStatusModal(false);
      setStatusReason('');
    } catch (error) {
      console.error('Error updating budget status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get available status transitions
  const getAvailableStatusTransitions = (currentStatus: BudgetStatus): BudgetStatus[] => {
    switch (currentStatus) {
      case BudgetStatus.DRAFT:
        return [BudgetStatus.PENDING_APPROVAL];
      case BudgetStatus.PENDING_APPROVAL:
        return [BudgetStatus.APPROVED, BudgetStatus.REJECTED, BudgetStatus.DRAFT];
      case BudgetStatus.APPROVED:
        return [BudgetStatus.ACTIVE, BudgetStatus.DRAFT];
      case BudgetStatus.ACTIVE:
        return [BudgetStatus.CLOSED];
      case BudgetStatus.CLOSED:
        return [BudgetStatus.ACTIVE];
      case BudgetStatus.REJECTED:
        return [BudgetStatus.DRAFT];
      default:
        return [];
    }
  };
  
  // Loading state
  if (budgetLoading || !selectedBudget) {
    return <div className="text-center py-4">Loading budget...</div>;
  }
  
  // Error state
  if (budgetError) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {budgetError}</span>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/finance/budgeting')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Budgeting Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const availableStatusTransitions = getAvailableStatusTransitions(selectedBudget.status as BudgetStatus);
  const isEditable = selectedBudget.status === BudgetStatus.DRAFT;
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Budget header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{selectedBudget.name}</h1>
            <p className="text-sm text-gray-500">
              Fiscal Year: {selectedBudget.fiscalYear?.name || selectedBudget.fiscalYearId}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/finance/budgeting"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Budgets
            </Link>
            {isEditable && (
              <Link
                href={`/finance/budgeting/annual/${budgetId}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Budget
              </Link>
            )}
          </div>
        </div>
        
        {/* Budget details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Budget Details</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {selectedBudget.type === BudgetType.ANNUAL ? 'Annual Budget' : 
                 selectedBudget.type === BudgetType.PROGRAM ? 'Program Budget' :
                 selectedBudget.type === BudgetType.DEPARTMENT ? 'Department Budget' : 'Project Budget'}
              </p>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500">Status:</span>
              {getBudgetStatusBadge(selectedBudget.status as BudgetStatus)}
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedBudget.description || 'No description provided'}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Budget</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatCurrency(selectedBudget.totalAmount)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Budget Period</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {selectedBudget.periodType}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(selectedBudget.startDate)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(selectedBudget.endDate)}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(selectedBudget.createdAt)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(selectedBudget.updatedAt)}
                </dd>
              </div>
              {selectedBudget.notes && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {selectedBudget.notes}
                  </dd>
                </div>
              )}
              
              {/* Status transitions */}
              {availableStatusTransitions.length > 0 && (
                <div className="bg-gray-50 px-4 py-5 sm:px-6">
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    {availableStatusTransitions.map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChangeClick(status)}
                        className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                          ${status === BudgetStatus.APPROVED ? 'border-transparent text-white bg-green-600 hover:bg-green-700' : 
                            status === BudgetStatus.REJECTED ? 'border-transparent text-white bg-red-600 hover:bg-red-700' :
                            status === BudgetStatus.ACTIVE ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700' :
                            status === BudgetStatus.CLOSED ? 'border-transparent text-white bg-gray-600 hover:bg-gray-700' :
                            status === BudgetStatus.PENDING_APPROVAL ? 'border-transparent text-white bg-yellow-600 hover:bg-yellow-700' :
                            'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                      >
                        {status === BudgetStatus.APPROVED ? 'Approve Budget' :
                         status === BudgetStatus.REJECTED ? 'Reject Budget' :
                         status === BudgetStatus.PENDING_APPROVAL ? 'Submit for Approval' :
                         status === BudgetStatus.DRAFT ? 'Return to Draft' :
                         status === BudgetStatus.ACTIVE ? 'Activate Budget' :
                         status === BudgetStatus.CLOSED ? 'Close Budget' : 
                         `Change to ${status}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </dl>
          </div>
        </div>
        
        {/* Budget items */}
        <BudgetItemList budgetId={budgetId} editable={isEditable} />
        
        {/* Budget actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <Link
            href={`/finance/budgeting/variance?budgetId=${budgetId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Variance Analysis
          </Link>
          <Link
            href={`/finance/budgeting/revisions/new?budgetId=${budgetId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Revision
          </Link>
        </div>
      </div>
      
      {/* Status change modal */}
      {showStatusModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Change Budget Status
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to change the budget status from <strong>{selectedBudget.status}</strong> to <strong>{newStatus}</strong>?
                    </p>
                    <div className="mt-4">
                      <label htmlFor="status-reason" className="block text-sm font-medium text-gray-700 text-left">
                        Reason for Status Change
                      </label>
                      <textarea
                        id="status-reason"
                        name="status-reason"
                        rows={4}
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Please provide a reason for this status change..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleStatusChangeConfirm}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}