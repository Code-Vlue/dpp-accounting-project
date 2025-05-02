// src/app/finance/fund-accounting/page.tsx
'use client';

import React, { useState } from 'react';
import { FundList, FundDetail, FundBalanceSheets, FundRestrictionReport } from '@/components/finance/fund-accounting';

// Prefixing unused enum values with underscore
enum ViewMode {
  FUNDS = 'FUNDS',
  FUND_DETAIL = 'FUND_DETAIL',
  BALANCE_SHEETS = 'BALANCE_SHEETS',
  RESTRICTION_REPORT = 'RESTRICTION_REPORT'
}

const FundAccountingPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.FUNDS);
  const [selectedFundId, setSelectedFundId] = useState<string>('');

  const handleSelectFund = (fundId: string) => {
    setSelectedFundId(fundId);
    setViewMode(ViewMode.FUND_DETAIL);
  };

  const handleBack = () => {
    setViewMode(ViewMode.FUNDS);
    setSelectedFundId('');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fund Accounting</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode(ViewMode.FUNDS)}
            className={`px-4 py-2 text-sm rounded-md ${viewMode === ViewMode.FUNDS ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Funds
          </button>
          <button
            onClick={() => setViewMode(ViewMode.BALANCE_SHEETS)}
            className={`px-4 py-2 text-sm rounded-md ${viewMode === ViewMode.BALANCE_SHEETS ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Balance Sheets
          </button>
          <button
            onClick={() => setViewMode(ViewMode.RESTRICTION_REPORT)}
            className={`px-4 py-2 text-sm rounded-md ${viewMode === ViewMode.RESTRICTION_REPORT ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Restriction Report
          </button>
        </div>
      </div>

      {viewMode === ViewMode.FUNDS && (
        <FundList onSelectFund={handleSelectFund} />
      )}

      {viewMode === ViewMode.FUND_DETAIL && selectedFundId && (
        <FundDetail fundId={selectedFundId} onBack={handleBack} />
      )}

      {viewMode === ViewMode.BALANCE_SHEETS && (
        <FundBalanceSheets />
      )}

      {viewMode === ViewMode.RESTRICTION_REPORT && (
        <FundRestrictionReport />
      )}
    </div>
  );
};

export default FundAccountingPage;