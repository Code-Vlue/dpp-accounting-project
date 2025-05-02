'use client';

// src/app/finance/reports/balance-sheet/page.tsx
import { useState, useEffect } from 'react';
import { financeService } from '@/lib/finance/finance-service';
import { FiscalYear, FiscalPeriod } from '@/types/finance';
import Link from 'next/link';

export default function BalanceSheetPage() {
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [fiscalPeriods, setFiscalPeriods] = useState<FiscalPeriod[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('PDF');

  useEffect(() => {
    async function loadData() {
      try {
        const years = await financeService.getAllFiscalYears();
        setFiscalYears(years);
        
        // Set default selected year to current fiscal year
        const currentYear = years.find(y => y.isCurrent);
        if (currentYear) {
          setSelectedYear(currentYear.id);
          
          // Load periods for the current fiscal year
          const periods = await financeService.getFiscalPeriodsByFiscalYear(currentYear.id);
          setFiscalPeriods(periods);
          
          // Set default selected period to latest period
          if (periods.length > 0) {
            // Sort by period number and get the latest
            const latestPeriod = [...periods].sort((a, b) => b.periodNumber - a.periodNumber)[0];
            setSelectedPeriod(latestPeriod.id);
            
            // Load balance sheet data
            const data = await financeService.getBalanceSheet(currentYear.id, latestPeriod.id);
            setBalanceSheet(data);
          }
        }
      } catch (error) {
        console.error('Error loading balance sheet data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const handleYearChange = async (yearId: string) => {
    setSelectedYear(yearId);
    setSelectedPeriod('');
    setBalanceSheet(null);
    setLoading(true);
    
    try {
      const periods = await financeService.getFiscalPeriodsByFiscalYear(yearId);
      setFiscalPeriods(periods);
      
      if (periods.length > 0) {
        // Sort by period number and get the latest
        const latestPeriod = [...periods].sort((a, b) => b.periodNumber - a.periodNumber)[0];
        setSelectedPeriod(latestPeriod.id);
        
        // Load balance sheet data
        const data = await financeService.getBalanceSheet(yearId, latestPeriod.id);
        setBalanceSheet(data);
      }
    } catch (error) {
      console.error('Error loading balance sheet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = async (periodId: string) => {
    setSelectedPeriod(periodId);
    setBalanceSheet(null);
    setLoading(true);
    
    try {
      const data = await financeService.getBalanceSheet(selectedYear, periodId);
      setBalanceSheet(data);
    } catch (error) {
      console.error('Error loading balance sheet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      const filePath = await financeService.generateReport('BALANCE_SHEET', selectedYear, selectedPeriod, exportFormat);
      alert(`Report generated successfully. File available at: ${filePath}`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getPeriodName = (periodId: string) => {
    const period = fiscalPeriods.find(p => p.id === periodId);
    return period ? period.name : '';
  };

  const getYearName = (yearId: string) => {
    const year = fiscalYears.find(y => y.id === yearId);
    return year ? year.name : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-blue border-t-transparent rounded-full mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-dark-blue">Loading Balance Sheet...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue">Balance Sheet</h1>
          <p className="text-gray-600">View and generate balance sheet reports</p>
        </div>
        <div>
          <Link href="/finance/reports" className="text-primary-blue hover:text-blue-700 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
            </svg>
            Back to Reports
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
            >
              <option value="">Select Fiscal Year</option>
              {fiscalYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
              disabled={!selectedYear || fiscalPeriods.length === 0}
            >
              <option value="">Select Period</option>
              {fiscalPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'PDF' | 'EXCEL' | 'CSV')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
            >
              <option value="PDF">PDF</option>
              <option value="EXCEL">Excel</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={!selectedYear || !selectedPeriod || isGenerating}
              className={`px-4 py-2 rounded-md w-full flex items-center justify-center ${
                !selectedYear || !selectedPeriod || isGenerating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-blue text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Export Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {balanceSheet && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-dark-blue">Denver Preschool Program</h2>
            <h3 className="text-lg font-semibold text-gray-700">Balance Sheet</h3>
            <p className="text-gray-600">
              {getYearName(selectedYear)} - {getPeriodName(selectedPeriod)}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-dark-blue mb-3">Assets</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {balanceSheet.assets.map((asset: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {asset.subtype.split('_').map((word: string) => 
                        word.charAt(0) + word.slice(1).toLowerCase()
                      ).join(' ')}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(asset.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                    Total Assets
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(balanceSheet.totalAssets)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-dark-blue mb-3">Liabilities</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {balanceSheet.liabilities.map((liability: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {liability.subtype.split('_').map((word: string) => 
                        word.charAt(0) + word.slice(1).toLowerCase()
                      ).join(' ')}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(liability.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                    Total Liabilities
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(balanceSheet.totalLiabilities)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-dark-blue mb-3">Equity</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {balanceSheet.equity.map((equity: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                      {equity.subtype.split('_').map((word: string) => 
                        word.charAt(0) + word.slice(1).toLowerCase()
                      ).join(' ')}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(equity.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                    Total Equity
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(balanceSheet.totalEquity)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t-2 border-gray-200 pt-4">
            <table className="min-w-full">
              <tbody>
                <tr className="bg-gray-50 font-bold">
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                    Total Liabilities and Equity
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(balanceSheet.totalLiabilities + balanceSheet.totalEquity)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}