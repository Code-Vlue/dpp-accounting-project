'use client';

// src/app/finance/reports/budget-vs-actual/page.tsx
import { useState, useEffect } from 'react';
import { financeService } from '@/lib/finance/finance-service';
import { FiscalYear } from '@/types/finance';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BudgetVsActualPage() {
  const [budgetReport, setBudgetReport] = useState<any>(null);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('PDF');

  // Mock departments for demo purposes
  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'admin', name: 'Administration' },
    { id: 'prog', name: 'Program Operations' },
    { id: 'fin', name: 'Finance' },
    { id: 'it', name: 'Information Technology' }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const years = await financeService.getAllFiscalYears();
        setFiscalYears(years);
        
        // Set default selected year to current fiscal year
        const currentYear = years.find(y => y.isCurrent);
        if (currentYear) {
          setSelectedYear(currentYear.id);
          
          // Load budget vs actual data
          const data = await financeService.getBudgetVsActualReport(currentYear.id);
          setBudgetReport(data);
        }
      } catch (error) {
        console.error('Error loading budget vs actual data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const handleYearChange = async (yearId: string) => {
    setSelectedYear(yearId);
    setBudgetReport(null);
    setLoading(true);
    
    try {
      const data = await financeService.getBudgetVsActualReport(yearId, selectedDepartment !== 'all' ? selectedDepartment : undefined);
      setBudgetReport(data);
    } catch (error) {
      console.error('Error loading budget vs actual data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = async (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setBudgetReport(null);
    setLoading(true);
    
    try {
      const data = await financeService.getBudgetVsActualReport(selectedYear, departmentId !== 'all' ? departmentId : undefined);
      setBudgetReport(data);
    } catch (error) {
      console.error('Error loading budget vs actual data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      const filePath = await financeService.generateReport(
        'BUDGET_VS_ACTUAL', 
        selectedYear, 
        undefined, 
        exportFormat
      );
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

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  const getYearName = (yearId: string) => {
    const year = fiscalYears.find(y => y.id === yearId);
    return year ? year.name : '';
  };

  const getVarianceClass = (variance: number) => {
    if (variance > 0) {
      return 'text-red-600'; // Over budget (negative)
    } else if (variance < 0) {
      return 'text-green-600'; // Under budget (positive)
    }
    return 'text-gray-600'; // On budget
  };

  const getVarianceSymbol = (variance: number) => {
    if (variance > 0) {
      return '+'; // Over budget
    } else if (variance < 0) {
      return ''; // Under budget (negative sign already included)
    }
    return ''; // On budget
  };

  // Chart data and options
  const chartData = budgetReport ? {
    labels: budgetReport.categories,
    datasets: [
      {
        label: 'Budget',
        data: budgetReport.budgetData,
        backgroundColor: 'rgba(0, 84, 184, 0.7)',
      },
      {
        label: 'Actual',
        data: budgetReport.actualData,
        backgroundColor: 'rgba(67, 176, 42, 0.7)',
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-blue border-t-transparent rounded-full mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-dark-blue">Loading Budget Report...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue">Budget vs. Actual</h1>
          <p className="text-gray-600">Compare budgeted amounts with actual spending</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
              disabled={!selectedYear}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
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
              disabled={!selectedYear || isGenerating}
              className={`px-4 py-2 rounded-md w-full flex items-center justify-center ${
                !selectedYear || isGenerating
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

      {budgetReport && (
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-dark-blue">Denver Preschool Program</h2>
              <h3 className="text-lg font-semibold text-gray-700">Budget vs. Actual Report</h3>
              <p className="text-gray-600">
                {getYearName(selectedYear)} - {selectedDepartment !== 'all' 
                  ? departments.find(d => d.id === selectedDepartment)?.name 
                  : 'All Departments'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500 font-medium">Total Budget</h4>
                <p className="text-xl font-bold text-primary-blue">{formatCurrency(budgetReport.totalBudget)}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500 font-medium">Total Actual</h4>
                <p className="text-xl font-bold text-success-green">{formatCurrency(budgetReport.totalActual)}</p>
              </div>
              
              <div className={`p-4 rounded-lg ${budgetReport.totalVariance > 0 ? 'bg-red-50' : budgetReport.totalVariance < 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                <h4 className="text-sm text-gray-500 font-medium">Variance</h4>
                <p className={`text-xl font-bold ${getVarianceClass(budgetReport.totalVariance)}`}>
                  {getVarianceSymbol(budgetReport.totalVariance)}
                  {formatCurrency(Math.abs(budgetReport.totalVariance))} 
                  ({formatPercentage(budgetReport.variancePercentage)})
                </p>
              </div>
            </div>
            
            <div className="h-72 mb-8">
              {chartData && <Bar options={chartOptions} data={chartData} />}
            </div>
            
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actual
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variance
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgetReport.categories.map((category: string, index: number) => {
                    const budget = budgetReport.budgetData[index];
                    const actual = budgetReport.actualData[index];
                    const variance = budgetReport.varianceData[index];
                    const percentVariance = (variance / budget) * 100;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {category}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(budget)}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(actual)}
                        </td>
                        <td className={`px-6 py-2 whitespace-nowrap text-sm text-right ${getVarianceClass(variance)}`}>
                          {getVarianceSymbol(variance)}
                          {formatCurrency(Math.abs(variance))}
                        </td>
                        <td className={`px-6 py-2 whitespace-nowrap text-sm text-right ${getVarianceClass(variance)}`}>
                          {formatPercentage(percentVariance)}
                        </td>
                      </tr>
                    );
                  })}
                  
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(budgetReport.totalBudget)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(budgetReport.totalActual)}
                    </td>
                    <td className={`px-6 py-3 whitespace-nowrap text-sm text-right ${getVarianceClass(budgetReport.totalVariance)}`}>
                      {getVarianceSymbol(budgetReport.totalVariance)}
                      {formatCurrency(Math.abs(budgetReport.totalVariance))}
                    </td>
                    <td className={`px-6 py-3 whitespace-nowrap text-sm text-right ${getVarianceClass(budgetReport.totalVariance)}`}>
                      {formatPercentage(budgetReport.variancePercentage)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}