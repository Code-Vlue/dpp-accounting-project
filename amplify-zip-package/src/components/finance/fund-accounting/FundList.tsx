// src/components/finance/fund-accounting/FundList.tsx
import React, { useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { FundType } from '@/types/finance';

interface FundListProps {
  onSelectFund: (fundId: string) => void;
}

const FundList: React.FC<FundListProps> = ({ onSelectFund }) => {
  const { funds, fetchFunds, fundsLoading, fundError } = useFinanceStore();

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

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
    return <div className="p-4">Loading funds...</div>;
  }

  if (fundError) {
    return <div className="p-4 text-red-500">Error: {fundError}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fund Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {funds.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                No funds found
              </td>
            </tr>
          ) : (
            funds.map((fund) => (
              <tr key={fund.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {fund.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getFundTypeLabel(fund.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fund.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {fund.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${fund.fundBalance.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => onSelectFund(fund.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FundList;