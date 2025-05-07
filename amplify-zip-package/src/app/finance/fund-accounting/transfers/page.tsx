// src/app/finance/fund-accounting/transfers/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { FundTransferForm } from '@/components/finance/fund-accounting';

const FundTransfersPage: React.FC = () => {
  const { 
    fundTransfers, 
    fetchFundTransfers, 
    fundAccountingLoading, 
    fundAccountingError 
  } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFundTransfers();
  }, [fetchFundTransfers]);

  const handleFormComplete = () => {
    setShowForm(false);
    fetchFundTransfers();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fund Transfers</h1>
        
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={showForm}
        >
          New Transfer
        </button>
      </div>

      {fundAccountingError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{fundAccountingError}</p>
        </div>
      )}

      {showForm ? (
        <FundTransferForm userId="user-1" onComplete={handleFormComplete} />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Recent Fund Transfers</h3>
          </div>
          
          {fundAccountingLoading ? (
            <div className="p-4">Loading fund transfers...</div>
          ) : fundTransfers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No fund transfers found. Click "New Transfer" to create one.
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
                      From
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
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
                  {fundTransfers.map((transfer) => {
                    // Find source and destination funds from entries
                    const sourceEntry = transfer.entries.find(e => e.debitAmount > 0);
                    const destEntry = transfer.entries.find(e => e.creditAmount > 0);
                    
                    return (
                      <tr key={transfer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transfer.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transfer.reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transfer.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sourceEntry?.fundId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {destEntry?.fundId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${transfer.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transfer.status === 'POSTED' ? 'bg-green-100 text-green-800' : 
                            transfer.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' : 
                            transfer.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {transfer.status}
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

export default FundTransfersPage;