// src/components/finance/fund-accounting/FundRestrictionReport.tsx
import React, { useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { FundType } from '@/types/finance';

const FundRestrictionReport: React.FC = () => {
  const { 
    fundRestrictionReport, 
    getFundRestrictionReport, 
    fundAccountingLoading, 
    fundAccountingError 
  } = useFinanceStore();

  useEffect(() => {
    getFundRestrictionReport();
  }, [getFundRestrictionReport]);

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
  
  // Format currency with $ sign and 2 decimal places
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  if (fundAccountingLoading) {
    return <div className="p-4">Loading fund restriction report...</div>;
  }

  if (fundAccountingError) {
    return <div className="p-4 text-red-500">Error: {fundAccountingError}</div>;
  }

  // Calculate totals by type
  const totalByType = fundRestrictionReport.reduce((acc, fund) => {
    const type = fund.fundType;
    if (!acc[type]) acc[type] = 0;
    acc[type] += fund.balance;
    return acc;
  }, {} as Record<FundType, number>);

  // Calculate grand total
  const grandTotal = fundRestrictionReport.reduce((sum, fund) => sum + fund.balance, 0);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold">Fund Restriction Report</h3>
        <p className="text-sm text-gray-600">
          As of {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fund
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restriction Period
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restriction Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fundRestrictionReport.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No fund restriction data available
                </td>
              </tr>
            ) : (
              fundRestrictionReport.map((fund) => (
                <tr key={fund.fundId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fund.fundName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getFundTypeLabel(fund.fundType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(fund.balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fund.startDate && fund.endDate ? (
                      <>
                        {new Date(fund.startDate).toLocaleDateString()} to {new Date(fund.endDate).toLocaleDateString()}
                      </>
                    ) : fund.startDate ? (
                      <>From {new Date(fund.startDate).toLocaleDateString()}</>
                    ) : fund.endDate ? (
                      <>Until {new Date(fund.endDate).toLocaleDateString()}</>
                    ) : (
                      fund.type === FundType.GENERAL ? 'N/A' : 'No specific period'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {fund.restrictionDetails || (fund.type === FundType.GENERAL ? 'N/A' : 'No specific restrictions')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <h4 className="text-sm font-semibold mb-2">Summary by Fund Type</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(totalByType).map(([type, amount]) => (
            <div key={type} className="bg-white p-3 rounded border">
              <p className="text-xs text-gray-500">{getFundTypeLabel(type as FundType)}</p>
              <p className="text-lg font-semibold">{formatCurrency(Number(amount))}</p>
            </div>
          ))}
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-xs text-blue-700">Total All Funds</p>
            <p className="text-lg font-semibold">{formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundRestrictionReport;