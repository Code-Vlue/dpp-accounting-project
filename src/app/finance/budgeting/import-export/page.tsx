// src/app/finance/budgeting/import-export/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';

export default function BudgetImportExportPage() {
  // Unused variable prefixed with underscore
  const _router = useRouter();
  const {
    budgets,
    // Unused variables prefixed with underscore
    budgetsLoading: _budgetsLoading,
    budgetError: _budgetError,
    exportBudget,
    importBudget,
    fetchBudgets
  } = useFinanceStore();
  
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState<string>('csv');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [exportError, setExportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  
  // Fetch budgets on component mount
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);
  
  // Handle export button click
  const handleExport = async () => {
    if (!selectedBudgetId) {
      setExportError('Please select a budget to export');
      return;
    }
    
    setIsExporting(true);
    setExportError('');
    
    try {
      await exportBudget(selectedBudgetId, exportFormat);
      // Success is handled by the actual download trigger in the store
    } catch (error) {
      console.error('Error exporting budget:', error);
      setExportError('Failed to export budget');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      setImportError('');
    }
  };
  
  // Handle import button click
  const handleImport = async () => {
    if (!importFile) {
      setImportError('Please select a file to import');
      return;
    }
    
    setIsImporting(true);
    setImportError('');
    setImportSuccess(false);
    
    try {
      await importBudget(importFile, importFormat);
      setImportSuccess(true);
      // Clear file input
      setImportFile(null);
      // Refresh budgets list
      fetchBudgets();
    } catch (error) {
      console.error('Error importing budget:', error);
      setImportError('Failed to import budget. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Budget Import/Export</h1>
            <p className="text-sm text-gray-500">
              Import and export budget data
            </p>
          </div>
          <Link
            href="/finance/budgeting"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Budgets
          </Link>
        </div>
        
        {/* Export section */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Export Budget</h3>
              <p className="mt-1 text-sm text-gray-500">
                Export budget data to a file for backup or external analysis.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              {exportError && (
                <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{exportError}</span>
                </div>
              )}
              
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="export-budget" className="block text-sm font-medium text-gray-700">
                    Select Budget
                  </label>
                  <select
                    id="export-budget"
                    value={selectedBudgetId}
                    onChange={(e) => setSelectedBudgetId(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Budget</option>
                    {budgets.map(budget => (
                      <option key={budget.id} value={budget.id}>
                        {budget.name} ({budget.fiscalYear?.name || budget.fiscalYearId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="export-format" className="block text-sm font-medium text-gray-700">
                    Export Format
                  </label>
                  <select
                    id="export-format"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="csv">CSV (Comma Separated Values)</option>
                    <option value="xlsx">XLSX (Excel)</option>
                    <option value="json">JSON (JavaScript Object Notation)</option>
                  </select>
                </div>
                
                <div className="col-span-6">
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting || !selectedBudgetId}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isExporting ? 'Exporting...' : 'Export Budget'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Import section */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Import Budget</h3>
              <p className="mt-1 text-sm text-gray-500">
                Import budget data from a file to create a new budget.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              {importError && (
                <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{importError}</span>
                </div>
              )}
              
              {importSuccess && (
                <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">Budget imported successfully!</span>
                </div>
              )}
              
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="import-file" className="block text-sm font-medium text-gray-700">
                    Select File
                  </label>
                  <input
                    type="file"
                    id="import-file"
                    onChange={handleFileChange}
                    accept={
                      importFormat === 'csv' ? '.csv' : 
                      importFormat === 'xlsx' ? '.xlsx,.xls' : 
                      importFormat === 'json' ? '.json' : '*'
                    }
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    {importFile ? `Selected file: ${importFile.name}` : 'No file selected'}
                  </p>
                </div>
                
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="import-format" className="block text-sm font-medium text-gray-700">
                    Import Format
                  </label>
                  <select
                    id="import-format"
                    value={importFormat}
                    onChange={(e) => setImportFormat(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="csv">CSV</option>
                    <option value="xlsx">XLSX</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                
                <div className="col-span-6">
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={isImporting || !importFile}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isImporting ? 'Importing...' : 'Import Budget'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}