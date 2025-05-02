// /workspace/DPP-Project/src/app/finance/banking/reconciliations/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { BankReconciliation, ReconciliationStatus } from '@/types/finance';

export default function ReconciliationsPage() {
  const router = useRouter();
  const { getBankReconciliations } = useFinanceStore();
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const fetchReconciliations = async () => {
      try {
        const data = await getBankReconciliations();
        setReconciliations(data);
      } catch (err) {
        setError('Failed to load reconciliations');
        console.error('Error loading reconciliations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReconciliations();
  }, [getBankReconciliations]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Reconciliations</h1>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Reconciliations</h1>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statement Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reconciliations.length > 0 ? (
              reconciliations.map((reconciliation) => (
                <tr key={reconciliation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {/* Use a derived value for bank account name */}
                      Bank Account {reconciliation.bankAccountId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(reconciliation.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reconciliation.status === ReconciliationStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                      reconciliation.status === ReconciliationStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reconciliation.status === ReconciliationStatus.COMPLETED ? 'Completed' :
                       reconciliation.status === ReconciliationStatus.IN_PROGRESS ? 'In Progress' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${reconciliation.statementBalance.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/finance/banking/reconciliations/${reconciliation.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No reconciliations found. Create one by selecting an account to reconcile.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6">
        <button
          onClick={() => router.push('/finance/banking/accounts')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Select Account to Reconcile
        </button>
      </div>
    </div>
  );
}
