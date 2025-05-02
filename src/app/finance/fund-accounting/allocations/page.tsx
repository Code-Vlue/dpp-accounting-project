// src/app/finance/fund-accounting/allocations/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { FundAllocationForm } from '@/components/finance/fund-accounting';

const FundAllocationsPage: React.FC = () => {
  const { 
    fundAllocations, 
    fetchFundAllocations, 
    fundAccountingLoading, 
    fundAccountingError,
    funds,
    fetchFunds
  } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFundAllocations();
    fetchFunds();
  }, [fetchFundAllocations, fetchFunds]);

  const handleFormComplete = () => {
    setShowForm(false);
    fetchFundAllocations();
  };

  // Helper to get fund name from its ID
  const getFundName = (fundId: string | undefined) => {
    if (!fundId) return 'Unknown';
    const fund = funds.find(f => f.id === fundId);
    return fund ? fund.name : 'Unknown';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fund Allocations</h1>
        
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={showForm}
        >
          New Allocation
        </button>
      </div>

      {fundAccountingError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{fundAccountingError}</p>
        </div>
      )}

      {showForm ? (
        <FundAllocationForm userId="user-1" onComplete={handleFormComplete} />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Recent Fund Allocations</h3>
          </div>
          
          {fundAccountingLoading ? (
            <div className="p-4">Loading fund allocations...</div>
          ) : fundAllocations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No fund allocations found. Click "New Allocation" to create one.
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
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Funds
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
                  {fundAllocations.map((allocation) => {
                    // Get unique funds from entries
                    const fundIds = [...new Set(allocation.entries.map(e => e.fundId))];
                    
                    return (
                      <tr key={allocation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(allocation.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {allocation.reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {allocation.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {fundIds.map(fundId => getFundName(fundId)).join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${allocation.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            allocation.status === 'POSTED' ? 'bg-green-100 text-green-800' : 
                            allocation.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' : 
                            allocation.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {allocation.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FundAllocationsPage;