'use client';

// src/components/dashboard/DataExportPanel.tsx
import { useState } from 'react';

// Export format types
type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

// Data modules that can be exported
const dataModules = [
  { id: 'transactions', name: 'Transactions', description: 'All financial transactions' },
  { id: 'accounts', name: 'Chart of Accounts', description: 'Full chart of accounts structure' },
  { id: 'budgets', name: 'Budget Data', description: 'Budget allocations and actuals' },
  { id: 'providers', name: 'Provider Information', description: 'Provider details and payments' },
  { id: 'tuition-credits', name: 'Tuition Credits', description: 'Tuition credit processing data' },
  { id: 'journal-entries', name: 'Journal Entries', description: 'General ledger journal entries' },
  { id: 'assets', name: 'Asset Register', description: 'Fixed assets and depreciation' },
];

// Mock export function for demonstration
const mockExportData = (
  moduleId: string,
  format: ExportFormat,
  dateRange: { start: Date, end: Date }
): Promise<void> => {
  console.log(`Exporting ${moduleId} data in ${format} format`, dateRange);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1500);
  });
};

interface DataExportPanelProps {
  className?: string;
}

export default function DataExportPanel({ className = '' }: DataExportPanelProps) {
  const [selectedModule, setSelectedModule] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    end: new Date()
  });
  const [isExporting, setIsExporting] = useState(false);
  
  // Handle export action
  const handleExport = async () => {
    if (!selectedModule) return;
    
    setIsExporting(true);
    try {
      await mockExportData(selectedModule, exportFormat, dateRange);
      
      // Show success message (in a real implementation, this would trigger a download)
      alert(`Your ${selectedModule} data has been exported successfully as a ${exportFormat.toUpperCase()} file.`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Format date for input field
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-dark-blue mb-4">
        Data Export
      </h2>
      
      <div className="space-y-4">
        {/* Module selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Data to Export
          </label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="">Select data module...</option>
            {dataModules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.name}
              </option>
            ))}
          </select>
          {selectedModule && (
            <p className="mt-1 text-sm text-gray-500">
              {dataModules.find(m => m.id === selectedModule)?.description}
            </p>
          )}
        </div>
        
        {/* Format selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Export Format
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="excel"
                checked={exportFormat === 'excel'}
                onChange={() => setExportFormat('excel')}
                className="text-primary-blue focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2">Excel</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={() => setExportFormat('csv')}
                className="text-primary-blue focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2">CSV</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="pdf"
                checked={exportFormat === 'pdf'}
                onChange={() => setExportFormat('pdf')}
                className="text-primary-blue focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2">PDF</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="json"
                checked={exportFormat === 'json'}
                onChange={() => setExportFormat('json')}
                className="text-primary-blue focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2">JSON</span>
            </label>
          </div>
        </div>
        
        {/* Date range selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={formatDateForInput(dateRange.start)}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  start: new Date(e.target.value)
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={formatDateForInput(dateRange.end)}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  end: new Date(e.target.value)
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>
        
        {/* Quick date selectors */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDateRange({
              start: new Date(new Date().getFullYear(), 0, 1),
              end: new Date()
            })}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
          >
            This Year
          </button>
          <button
            onClick={() => setDateRange({
              start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
              end: new Date()
            })}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange({
              start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              end: new Date()
            })}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
          >
            This Month
          </button>
          <button
            onClick={() => {
              const lastQuarterStart = new Date();
              const quarter = Math.floor(lastQuarterStart.getMonth() / 3);
              lastQuarterStart.setMonth(quarter * 3);
              lastQuarterStart.setDate(1);
              
              setDateRange({
                start: lastQuarterStart,
                end: new Date()
              });
            }}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
          >
            This Quarter
          </button>
        </div>
        
        {/* Export button */}
        <div className="mt-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleExport}
            disabled={!selectedModule || isExporting}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              !selectedModule || isExporting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-blue text-white hover:bg-blue-700'
            }`}
          >
            {isExporting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              `Export ${exportFormat.toUpperCase()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}