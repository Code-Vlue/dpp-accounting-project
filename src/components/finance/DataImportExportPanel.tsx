// src/components/finance/DataImportExportPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { 
  ImportTarget, 
  ExportTarget, 
  FileFormat, 
  ImportConfig,
  ExportConfig,
  ImportValidationResult,
  DataMapping
} from '@/types/finance';

interface DataImportExportPanelProps {
  defaultImportTarget?: ImportTarget;
  defaultExportTarget?: ExportTarget;
  onImportComplete?: () => void;
  onExportComplete?: () => void;
  showImport?: boolean;
  showExport?: boolean;
}

export default function DataImportExportPanel({
  defaultImportTarget = ImportTarget.PROVIDERS,
  defaultExportTarget = ExportTarget.PROVIDERS,
  onImportComplete,
  onExportComplete,
  showImport = true,
  showExport = true
}: DataImportExportPanelProps) {
  const { 
    validateImport,
    importData,
    exportData,
    getDataMappingForTarget,
    validateImportLoading,
    importDataLoading,
    exportDataLoading,
    validateImportError,
    importDataError,
    exportDataError,
  } = useFinanceStore();

  // Import state
  const [importTarget, setImportTarget] = useState<ImportTarget>(defaultImportTarget);
  const [importFormat, setImportFormat] = useState<FileFormat>(FileFormat.CSV);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState({
    skipHeader: true,
    dateFormat: 'YYYY-MM-DD',
    overwrite: false,
    validateOnly: false
  });
  const [mapping, setMapping] = useState<DataMapping>({});
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Export state
  const [exportTarget, setExportTarget] = useState<ExportTarget>(defaultExportTarget);
  const [exportFormat, setExportFormat] = useState<FileFormat>(FileFormat.CSV);
  const [exportOptions, setExportOptions] = useState({
    includeHeader: true,
    prettyPrint: true,
    dateFormat: 'YYYY-MM-DD'
  });
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportFilters, setExportFilters] = useState<Record<string, any>>({});

  // Load mapping for the selected import target
  useEffect(() => {
    const loadMapping = async () => {
      try {
        const targetMapping = await getDataMappingForTarget(importTarget);
        setMapping(targetMapping);
      } catch (error) {
        console.error('Error loading mapping:', error);
      }
    };

    loadMapping();
  }, [importTarget, getDataMappingForTarget]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      setValidationResult(null);
      setImportSuccess(false);
    }
  };

  // Handle import target change
  const handleImportTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setImportTarget(e.target.value as ImportTarget);
    setValidationResult(null);
    setImportSuccess(false);
  };

  // Handle export target change
  const handleExportTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExportTarget(e.target.value as ExportTarget);
    setExportSuccess(false);
  };

  // Handle option changes
  const handleImportOptionChange = (option: string, value: boolean | string) => {
    setImportOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleExportOptionChange = (option: string, value: boolean | string) => {
    setExportOptions(prev => ({ ...prev, [option]: value }));
  };

  // Validate import
  const handleValidateImport = async () => {
    if (!importFile) return;

    try {
      const config: ImportConfig = {
        target: importTarget,
        format: importFormat,
        mapping,
        options: importOptions
      };

      const result = await validateImport(importFile, config.target, config.format);
      setValidationResult(result);
    } catch (error) {
      console.error('Error validating import:', error);
    }
  };

  // Perform import
  const handleImport = async () => {
    if (!importFile) return;

    setImportSuccess(false);

    try {
      const config: ImportConfig = {
        target: importTarget,
        format: importFormat,
        mapping,
        options: importOptions
      };

      await importData(importFile, config);
      
      // Since importData doesn't return a result, we'll assume it was successful
      // if no error was thrown
      setImportSuccess(true);
      setImportFile(null);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  // Perform export
  const handleExport = async () => {
    setExportSuccess(false);

    try {
      const config: ExportConfig = {
        target: exportTarget,
        format: exportFormat,
        options: exportOptions,
        filters: exportFilters
      };

      try {
        await exportData(config);
        
        // Since exportData might automatically trigger a download via a link click in the store
        // we'll just assume it was successful if no error was thrown
        setExportSuccess(true);
        
        if (onExportComplete) {
          onExportComplete();
        }
      } catch (error) {
        // Error already handled in the store
        console.error('Error exporting data:', error);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {showImport && (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Import Data</h3>
              <p className="mt-1 text-sm text-gray-500">
                Import data from external files into the system.
              </p>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              {validateImportError && (
                <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{validateImportError}</span>
                </div>
              )}
              
              {importDataError && (
                <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{importDataError}</span>
                </div>
              )}
              
              {importSuccess && (
                <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">Data imported successfully!</span>
                </div>
              )}
              
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="import-target" className="block text-sm font-medium text-gray-700">
                    Import Target
                  </label>
                  <select
                    id="import-target"
                    value={importTarget}
                    onChange={handleImportTargetChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {Object.values(ImportTarget).map(target => (
                      <option key={target} value={target}>
                        {target.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="import-format" className="block text-sm font-medium text-gray-700">
                    File Format
                  </label>
                  <select
                    id="import-format"
                    value={importFormat}
                    onChange={(e) => setImportFormat(e.target.value as FileFormat)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={FileFormat.CSV}>CSV (Comma Separated Values)</option>
                    <option value={FileFormat.XLSX}>XLSX (Excel)</option>
                    <option value={FileFormat.JSON}>JSON (JavaScript Object Notation)</option>
                    {(importTarget === ImportTarget.BANK_TRANSACTIONS) && (
                      <>
                        <option value={FileFormat.OFX}>OFX (Open Financial Exchange)</option>
                        <option value={FileFormat.QFX}>QFX (Quicken Financial Exchange)</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="import-file" className="block text-sm font-medium text-gray-700">
                    Select File
                  </label>
                  <input
                    type="file"
                    id="import-file"
                    onChange={handleFileChange}
                    accept={
                      importFormat === FileFormat.CSV ? '.csv' : 
                      importFormat === FileFormat.XLSX ? '.xlsx,.xls' : 
                      importFormat === FileFormat.JSON ? '.json' :
                      importFormat === FileFormat.OFX ? '.ofx' :
                      importFormat === FileFormat.QFX ? '.qfx' : '*'
                    }
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    {importFile ? `Selected file: ${importFile.name}` : 'No file selected'}
                  </p>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700">Import Options</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="skip-header"
                            name="skip-header"
                            type="checkbox"
                            checked={importOptions.skipHeader}
                            onChange={(e) => handleImportOptionChange('skipHeader', e.target.checked)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="skip-header" className="font-medium text-gray-700">Skip header row</label>
                          <p className="text-gray-500">First row contains column headers</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="overwrite"
                            name="overwrite"
                            type="checkbox"
                            checked={importOptions.overwrite}
                            onChange={(e) => handleImportOptionChange('overwrite', e.target.checked)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="overwrite" className="font-medium text-gray-700">Overwrite existing</label>
                          <p className="text-gray-500">Update records if they already exist</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="validate-only"
                            name="validate-only"
                            type="checkbox"
                            checked={importOptions.validateOnly}
                            onChange={(e) => handleImportOptionChange('validateOnly', e.target.checked)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="validate-only" className="font-medium text-gray-700">Validate only</label>
                          <p className="text-gray-500">Check file without importing data</p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="date-format" className="block text-sm font-medium text-gray-700">
                    Date Format
                  </label>
                  <select
                    id="date-format"
                    value={importOptions.dateFormat}
                    onChange={(e) => handleImportOptionChange('dateFormat', e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2025-04-01)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 04/01/2025)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 01/04/2025)</option>
                  </select>
                </div>
                
                <div className="col-span-6 flex space-x-4">
                  <button
                    type="button"
                    onClick={handleValidateImport}
                    disabled={validateImportLoading || !importFile}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {validateImportLoading ? 'Validating...' : 'Validate'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={importDataLoading || !importFile}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {importDataLoading ? 'Importing...' : 'Import Data'}
                  </button>
                </div>
              </div>
              
              {/* Validation Results */}
              {validationResult && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900">Validation Results</h4>
                  
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700">
                        Status: <span className={validationResult.valid ? 'text-green-600' : 'text-red-600'}>
                          {validationResult.valid ? 'Valid' : 'Invalid'}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {validationResult.processedRows} of {validationResult.totalRows} rows processed
                      </p>
                    </div>
                    
                    {validationResult.errors.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-red-700">Errors ({validationResult.errors.length})</h5>
                        <ul className="mt-2 space-y-1 text-sm text-red-600 list-disc list-inside">
                          {validationResult.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>
                              Row {error.row}, {error.field}: {error.message}
                            </li>
                          ))}
                          {validationResult.errors.length > 5 && (
                            <li>...and {validationResult.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {validationResult.warnings.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-yellow-700">Warnings ({validationResult.warnings.length})</h5>
                        <ul className="mt-2 space-y-1 text-sm text-yellow-600 list-disc list-inside">
                          {validationResult.warnings.slice(0, 5).map((warning, index) => (
                            <li key={index}>
                              Row {warning.row}, {warning.field}: {warning.message}
                            </li>
                          ))}
                          {validationResult.warnings.length > 5 && (
                            <li>...and {validationResult.warnings.length - 5} more warnings</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {validationResult.sample && validationResult.sample.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700">Sample Data</h5>
                        <div className="mt-2 overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(validationResult.sample[0]).map(header => (
                                  <th 
                                    key={header}
                                    scope="col"
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {validationResult.sample.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {Object.values(row).map((cell, cellIndex) => (
                                    <td 
                                      key={cellIndex}
                                      className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
                                    >
                                      {String(cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {showExport && (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Export Data</h3>
              <p className="mt-1 text-sm text-gray-500">
                Export data from the system to external files.
              </p>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              {exportDataError && (
                <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{exportDataError}</span>
                </div>
              )}
              
              {exportSuccess && (
                <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">Data exported successfully!</span>
                </div>
              )}
              
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="export-target" className="block text-sm font-medium text-gray-700">
                    Export Target
                  </label>
                  <select
                    id="export-target"
                    value={exportTarget}
                    onChange={handleExportTargetChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {Object.values(ExportTarget).map(target => (
                      <option key={target} value={target}>
                        {target.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="export-format" className="block text-sm font-medium text-gray-700">
                    File Format
                  </label>
                  <select
                    id="export-format"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as FileFormat)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={FileFormat.CSV}>CSV (Comma Separated Values)</option>
                    <option value={FileFormat.XLSX}>XLSX (Excel)</option>
                    <option value={FileFormat.JSON}>JSON (JavaScript Object Notation)</option>
                  </select>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700">Export Options</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="include-header"
                            name="include-header"
                            type="checkbox"
                            checked={exportOptions.includeHeader}
                            onChange={(e) => handleExportOptionChange('includeHeader', e.target.checked)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="include-header" className="font-medium text-gray-700">Include header row</label>
                          <p className="text-gray-500">Add column headers as the first row</p>
                        </div>
                      </div>
                      
                      {exportFormat === FileFormat.JSON && (
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="pretty-print"
                              name="pretty-print"
                              type="checkbox"
                              checked={exportOptions.prettyPrint}
                              onChange={(e) => handleExportOptionChange('prettyPrint', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="pretty-print" className="font-medium text-gray-700">Pretty print</label>
                            <p className="text-gray-500">Format JSON with indentation</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </fieldset>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="export-date-format" className="block text-sm font-medium text-gray-700">
                    Date Format
                  </label>
                  <select
                    id="export-date-format"
                    value={exportOptions.dateFormat}
                    onChange={(e) => handleExportOptionChange('dateFormat', e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2025-04-01)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 04/01/2025)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 01/04/2025)</option>
                  </select>
                </div>
                
                {/* Additional filters could be added here based on export target */}
                
                <div className="col-span-6">
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={exportDataLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {exportDataLoading ? 'Exporting...' : 'Export Data'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}