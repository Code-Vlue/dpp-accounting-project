'use client';

// src/components/finance/reports/CustomReportBuilder.tsx
import { useState, useEffect } from 'react';
import { financeService } from '@/lib/finance/finance-service';
import { FiscalYear, FinancialReportConfig } from '@/types/finance';

interface CustomReportBuilderProps {
  reportId?: string;
  onSubmit: (reportConfig: Omit<FinancialReportConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export default function CustomReportBuilder({ 
  reportId,
  onSubmit,
  onCancel
}: CustomReportBuilderProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('SUMMARY');
  const [includeBalanceSheet, setIncludeBalanceSheet] = useState(true);
  const [includeIncomeStatement, setIncludeIncomeStatement] = useState(true);
  const [includeBudgetComparison, setIncludeBudgetComparison] = useState(false);
  const [includeFunctionalExpenses, setIncludeFunctionalExpenses] = useState(false);
  const [frequency, setFrequency] = useState('MONTHLY');
  const [scheduledDelivery, setScheduledDelivery] = useState(false);
  const [deliveryEmails, setDeliveryEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load fiscal years
        const years = await financeService.getAllFiscalYears();
        setFiscalYears(years);
        
        // Set default to current fiscal year
        const currentYear = years.find(y => y.isCurrent);
        if (currentYear) {
          setSelectedFiscalYear(currentYear.id);
        }
        
        // If in edit mode (reportId provided), load existing report config
        if (reportId) {
          setEditMode(true);
          const report = await financeService.getFinancialReportConfig(reportId);
          
          if (report) {
            setName(report.name);
            setType(report.type);
            
            // Set parameters based on report type
            if (report.parameters) {
              setFrequency(report.parameters.frequency || 'MONTHLY');
              setIncludeBalanceSheet(report.parameters.includeBalanceSheet || false);
              setIncludeIncomeStatement(report.parameters.includeIncomeStatement || false);
              setIncludeBudgetComparison(report.parameters.includeBudgetComparison || false);
              setIncludeFunctionalExpenses(report.parameters.includeFunctionalExpenses || false);
            }
            
            setScheduledDelivery(report.scheduledDelivery || false);
            setDeliveryEmails(report.deliveryEmails?.join(', ') || '');
          }
        }
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [reportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Parse email addresses
      const emails = deliveryEmails.split(',').map(email => email.trim()).filter(email => email);
      
      // Create report config object
      const reportConfig: Omit<FinancialReportConfig, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        type,
        createdById: 'user1', // In a real app, this would be the current user's ID
        parameters: {
          frequency,
          fiscalYearId: selectedFiscalYear,
          includeBalanceSheet,
          includeIncomeStatement,
          includeBudgetComparison,
          includeFunctionalExpenses
        },
        scheduledDelivery,
        deliverySchedule: getDeliverySchedule(frequency),
        deliveryEmails: emails
      };
      
      await onSubmit(reportConfig);
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Error saving report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDeliverySchedule = (freq: string): string => {
    // Generate cron expression based on frequency
    switch (freq) {
      case 'DAILY':
        return '0 8 * * *'; // 8 AM every day
      case 'WEEKLY':
        return '0 8 * * 1'; // 8 AM every Monday
      case 'MONTHLY':
        return '0 8 1 * *'; // 8 AM on the 1st of every month
      case 'QUARTERLY':
        return '0 8 1 1,4,7,10 *'; // 8 AM on Jan 1, Apr 1, Jul 1, Oct 1
      case 'ANNUALLY':
        return '0 8 1 1 *'; // 8 AM on January 1
      default:
        return '0 8 1 * *'; // Default to monthly
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-blue border-t-transparent rounded-full mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-dark-blue">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-dark-blue mb-4">
          {editMode ? 'Edit Report Configuration' : 'Create New Report'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 mb-1">
              Report Name *
            </label>
            <input
              id="reportName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
              placeholder="Monthly Financial Summary"
            />
          </div>
          
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
              Report Type *
            </label>
            <select
              id="reportType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
            >
              <option value="SUMMARY">Financial Summary</option>
              <option value="BUDGET">Budget Analysis</option>
              <option value="TRANSACTION">Transaction Report</option>
              <option value="CUSTOM">Custom Report</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="fiscalYear" className="block text-sm font-medium text-gray-700 mb-1">
              Fiscal Year *
            </label>
            <select
              id="fiscalYear"
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(e.target.value)}
              required
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
          
          <div className="pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Include in Report:</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="balanceSheet"
                  type="checkbox"
                  checked={includeBalanceSheet}
                  onChange={(e) => setIncludeBalanceSheet(e.target.checked)}
                  className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                />
                <label htmlFor="balanceSheet" className="ml-2 block text-sm text-gray-700">
                  Balance Sheet
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="incomeStatement"
                  type="checkbox"
                  checked={includeIncomeStatement}
                  onChange={(e) => setIncludeIncomeStatement(e.target.checked)}
                  className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                />
                <label htmlFor="incomeStatement" className="ml-2 block text-sm text-gray-700">
                  Income Statement
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="budgetComparison"
                  type="checkbox"
                  checked={includeBudgetComparison}
                  onChange={(e) => setIncludeBudgetComparison(e.target.checked)}
                  className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                />
                <label htmlFor="budgetComparison" className="ml-2 block text-sm text-gray-700">
                  Budget vs. Actual Comparison
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="functionalExpenses"
                  type="checkbox"
                  checked={includeFunctionalExpenses}
                  onChange={(e) => setIncludeFunctionalExpenses(e.target.checked)}
                  className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                />
                <label htmlFor="functionalExpenses" className="ml-2 block text-sm text-gray-700">
                  Statement of Functional Expenses
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-dark-blue mb-4">
          Delivery Settings
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Report Frequency
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="ANNUALLY">Annually</option>
            </select>
          </div>
          
          <div className="flex items-center pt-2">
            <input
              id="scheduledDelivery"
              type="checkbox"
              checked={scheduledDelivery}
              onChange={(e) => setScheduledDelivery(e.target.checked)}
              className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
            />
            <label htmlFor="scheduledDelivery" className="ml-2 block text-sm text-gray-700">
              Enable scheduled delivery
            </label>
          </div>
          
          {scheduledDelivery && (
            <div>
              <label htmlFor="deliveryEmails" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Email Addresses (comma separated)
              </label>
              <textarea
                id="deliveryEmails"
                value={deliveryEmails}
                onChange={(e) => setDeliveryEmails(e.target.value)}
                required={scheduledDelivery}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue h-24"
                placeholder="finance@example.com, director@example.com"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-blue hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save Report'
          )}
        </button>
      </div>
    </form>
  );
}