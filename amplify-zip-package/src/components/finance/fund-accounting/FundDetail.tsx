// src/components/finance/fund-accounting/FundDetail.tsx
import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { FundType } from '@/types/finance';

interface FundDetailProps {
  fundId: string;
  onBack: () => void;
}

const FundDetail: React.FC<FundDetailProps> = ({ fundId, onBack }) => {
  const { fetchFundById, selectedFund, fundsLoading, fundError } = useFinanceStore();
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (fundId) {
      fetchFundById(fundId);
    }
  }, [fundId, fetchFundById]);

  const getFundTypeLabel = (type: FundType) => {
    switch (type) {
      case FundType.GENERAL:
        return 'General';
      case FundType.RESTRICTED:
        return 'Restricted';
      case FundType.TEMPORARILY_RESTRICTED:
        return 'Temporarily Restricted';
      case FundType.PERMANENTLY_RESTRICTED:
        return 'Permanently Restricted';
      case FundType.BOARD_DESIGNATED:
        return 'Board Designated';
      default:
        return 'Unknown';
    }
  };

  if (fundsLoading) {
    return <div className="p-4">Loading fund details...</div>;
  }

  if (fundError) {
    return <div className="p-4 text-red-500">Error: {fundError}</div>;
  }

  if (!selectedFund) {
    return <div className="p-4">Fund not found</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{selectedFund.name}</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Back to Funds
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Fund Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{getFundTypeLabel(selectedFund.type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${selectedFund.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {selectedFund.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{new Date(selectedFund.createdAt).toLocaleDateString()}</span>
            </div>
            {selectedFund.startDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium">{new Date(selectedFund.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {selectedFund.endDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="font-medium">{new Date(selectedFund.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Balance:</span>
              <span className="font-medium text-xl">${selectedFund.fundBalance.toLocaleString()}</span>
            </div>
            {selectedFund.type !== FundType.GENERAL && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold mb-2">Restrictions</h4>
                <p className="text-sm text-gray-600">
                  {selectedFund.restrictionDetails || 'No specific restrictions defined'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Fund Description</h3>
        <p className="text-gray-700">{selectedFund.description}</p>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Activity Report</h3>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                // Would call getFundActivityReport with the selected dates
                alert('This would fetch the fund activity report for the selected date range');
              }}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundDetail;