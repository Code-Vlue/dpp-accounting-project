'use client';

import React, { useState } from 'react';
import DataImportExportPanel from '@/components/finance/DataImportExportPanel';
import { ImportTarget, ExportTarget } from '@/types/finance';

export default function DataImportExportPage() {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'scheduled' | 'bank'>('import');
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Data Import & Export</h1>
        
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { name: 'Import Data', value: 'import' },
              { name: 'Export Data', value: 'export' },
              { name: 'Scheduled Imports', value: 'scheduled' },
              { name: 'Bank Transactions', value: 'bank' },
            ].map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.value as any)}
                className={`${
                  activeTab === tab.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-6">
          {activeTab === 'import' && (
            <DataImportExportPanel 
              showImport={true}
              showExport={false}
              defaultImportTarget={ImportTarget.PROVIDERS}
            />
          )}
          
          {activeTab === 'export' && (
            <DataImportExportPanel 
              showImport={false}
              showExport={true}
              defaultExportTarget={ExportTarget.CHART_OF_ACCOUNTS}
            />
          )}
          
          {activeTab === 'scheduled' && (
            <ScheduledImportsPanel />
          )}
          
          {activeTab === 'bank' && (
            <BankTransactionsImportPanel />
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduledImportsPanel() {
  // Using _setImports prefix for unused variable
  const [imports, _setImports] = useState([
    {
      id: '1',
      name: 'Daily vendor import',
      source: 'https://api.external-system.com/vendors',
      schedule: 'Daily at 2:00 AM',
      lastRun: new Date('2025-04-28T02:00:00'),
      nextRun: new Date('2025-04-29T02:00:00'),
      status: 'ACTIVE'
    },
    {
      id: '2',
      name: 'Weekly bank transactions',
      source: 'https://banking-api.example.com/transactions',
      schedule: 'Every Monday at 6:00 AM',
      lastRun: new Date('2025-04-22T06:00:00'),
      nextRun: new Date('2025-04-29T06:00:00'),
      status: 'ACTIVE'
    }
  ]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Scheduled Imports</h2>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add New Scheduled Import
        </button>
      </div>
      
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Run
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Run
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {imports.map((importJob) => (
                    <tr key={importJob.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{importJob.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{importJob.source}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{importJob.schedule}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {importJob.lastRun.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {importJob.nextRun.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          importJob.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {importJob.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BankTransactionsImportPanel() {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState('OFX');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  
  // Mock bank accounts data
  const bankAccounts = [
    { id: 'account-1', name: 'Main Checking Account', number: '1234567890' },
    { id: 'account-2', name: 'Savings Account', number: '0987654321' },
    { id: 'account-3', name: 'Reserve Account', number: '1122334455' }
  ];
  
  const handleImport = () => {
    // In a real implementation, would call the actual import function
    console.log('Importing bank transactions:', {
      accountId: selectedAccount,
      file: importFile,
      format: importFormat,
      options: {
        dateFormat,
        allowDuplicates
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Import Bank Transactions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Import transactions from your bank accounts to reconcile with your accounting records.
            </p>
          </div>
          
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="bank-account" className="block text-sm font-medium text-gray-700">
                  Bank Account
                </label>
                <select
                  id="bank-account"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.number})
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
                  onChange={(e) => setImportFormat(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="OFX">OFX (Open Financial Exchange)</option>
                  <option value="QFX">QFX (Quicken Financial Exchange)</option>
                  <option value="CSV">CSV (Comma Separated Values)</option>
                </select>
              </div>
              
              <div className="col-span-6">
                <label htmlFor="import-file" className="block text-sm font-medium text-gray-700">
                  Select File
                </label>
                <input
                  type="file"
                  id="import-file"
                  onChange={(e) => e.target.files && setImportFile(e.target.files[0])}
                  accept={
                    importFormat === 'OFX' ? '.ofx' : 
                    importFormat === 'QFX' ? '.qfx' : 
                    importFormat === 'CSV' ? '.csv' : '*'
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {importFile ? `Selected file: ${importFile.name}` : 'No file selected'}
                </p>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="date-format" className="block text-sm font-medium text-gray-700">
                  Date Format
                </label>
                <select
                  id="date-format"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2025-04-01)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 04/01/2025)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 01/04/2025)</option>
                </select>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <div className="flex items-start mt-6">
                  <div className="flex items-center h-5">
                    <input
                      id="allow-duplicates"
                      name="allow-duplicates"
                      type="checkbox"
                      checked={allowDuplicates}
                      onChange={(e) => setAllowDuplicates(e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="allow-duplicates" className="font-medium text-gray-700">Allow duplicates</label>
                    <p className="text-gray-500">Import transactions even if they appear to be duplicates</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-6">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!selectedAccount || !importFile}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Import Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}