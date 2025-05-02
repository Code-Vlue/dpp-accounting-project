// src/components/finance/budgeting/BudgetImportExport.tsx
'use client';

import React from 'react';
import { useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';

interface BudgetImportExportProps {
  onImportComplete?: () => void;
}

export default function BudgetImportExport({ onImportComplete }: BudgetImportExportProps) {
  const { 
    exportBudget,
    importBudget,
    budgets,
    exportLoading,
    importLoading,
    exportError,
    importError
  } = useFinanceStore();
  
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState<string>('csv');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  
  // Handle export button click
  const handleExport = async () => {
    if (!selectedBudgetId) {
      return;
    }
    
    try {
      await exportBudget(selectedBudgetId, exportFormat);
      // Success is handled by the actual download trigger in the store
    } catch (error) {
      console.error('Error exporting budget:', error);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  // Handle import button click
  const handleImport = async () => {
    if (!importFile) {
      return;
    }
    
    setImportSuccess(false);
    
    try {
      await importBudget(importFile, importFormat);
      setImportSuccess(true);
      // Clear file input
      setImportFile(null);
      
      // Call the onImportComplete callback if provided
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Error importing budget:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Export section */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
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
                  disabled={exportLoading || !selectedBudgetId}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {exportLoading ? 'Exporting...' : 'Export Budget'}
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
                  disabled={importLoading || !importFile}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {importLoading ? 'Importing...' : 'Import Budget'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}