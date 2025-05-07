// src/components/finance/fund-accounting/FundBalanceSheets.tsx
import React, { useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { FundType } from '@/types/finance';

const FundBalanceSheets: React.FC = () => {
  const { 
    fundBalanceSheets, 
    getFundBalanceSheets, 
    fundAccountingLoading, 
    fundAccountingError,
    fiscalPeriods,
    currentFiscalPeriod,
    fetchCurrentFiscalPeriod
  } = useFinanceStore();

  useEffect(() => {
    fetchCurrentFiscalPeriod();
  }, [fetchCurrentFiscalPeriod]);

  useEffect(() => {
    if (currentFiscalPeriod) {
      getFundBalanceSheets(currentFiscalPeriod.id);
    }
  }, [currentFiscalPeriod, getFundBalanceSheets]);

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

  if (fundAccountingLoading) {
    return <div className="p-4">Loading fund balance sheets...</div>;
  }

  if (fundAccountingError) {
    return <div className="p-4 text-red-500">Error: {fundAccountingError}</div>;
  }

  // Calculate totals
  const totalAssets = fundBalanceSheets.reduce((sum, sheet) => sum + sheet.assets, 0);
  const totalLiabilities = fundBalanceSheets.reduce((sum, sheet) => sum + sheet.liabilities, 0);
  const totalFundBalances = fundBalanceSheets.reduce((sum, sheet) => sum + sheet.fundBalance, 0);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold">Fund Balance Sheets</h3>
        {currentFiscalPeriod && (
          <p className="text-sm text-gray-600">
            Period: {new Date(currentFiscalPeriod.startDate).toLocaleDateString()} to {new Date(currentFiscalPeriod.endDate).toLocaleDateString()}
          </p>
        )}
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
                Assets
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liabilities
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fund Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fundBalanceSheets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No fund balance data available
                </td>
              </tr>
            ) : (
              fundBalanceSheets.map((sheet) => (
                <tr key={sheet.fundId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sheet.fundName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getFundTypeLabel(sheet.fundType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${sheet.assets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${sheet.liabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${sheet.fundBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={2} className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Totals:
              </td>
              <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                ${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                ${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                ${totalFundBalances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default FundBalanceSheets;