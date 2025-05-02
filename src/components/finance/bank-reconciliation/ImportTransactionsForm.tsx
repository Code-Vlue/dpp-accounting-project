// /workspace/DPP-Project/src/components/finance/bank-reconciliation/ImportTransactionsForm.tsx
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { BankAccount } from '@/types/finance';

interface ImportTransactionsFormProps {
  bankAccountId: string;
  bankAccount?: BankAccount;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ImportTransactionsForm({
  bankAccountId,
  bankAccount,
  onSuccess,
  onCancel
}: ImportTransactionsFormProps) {
  const router = useRouter();
  const { importBankTransactions, getBankAccount } = useFinanceStore();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [fileType, setFileType] = useState<string>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [dateFormat, setDateFormat] = useState<string>('MM/DD/YYYY');
  const [accountInfo, setAccountInfo] = useState<BankAccount | null>(null);
  
  useState(() => {
    if (!bankAccount) {
      getBankAccount(bankAccountId).then(setAccountInfo).catch(console.error);
    } else {
      setAccountInfo(bankAccount);
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to import');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real application, we would read the file and parse its contents
      // Here we're simulating the file upload with the file metadata
      const result = await importBankTransactions({
        bankAccountId,
        fileType,
        fileName: file.name,
        fileSize: file.size,
        dateFormat
      });
      
      setSuccess(`Successfully imported ${result.importedCount} transactions.`);
      
      if (onSuccess) {
        setTimeout(onSuccess, 1500); // Give time to see success message
      } else {
        setTimeout(() => {
          router.push(`/finance/banking/accounts/${bankAccountId}`);
        }, 1500);
      }
    } catch (err) {
      setError('Failed to import transactions. Please check file format and try again.');
      console.error('Error importing transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Import Transactions</h2>
      
      {accountInfo && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <h3 className="font-medium">Account: {accountInfo.accountName}</h3>
          <p>Account Number: {accountInfo.accountNumber.replace(/(?<=^.{4}).*(?=.{4}$)/, '******')}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Type
          </label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          >
            <option value="csv">CSV</option>
            <option value="ofx">OFX</option>
            <option value="qfx">QFX</option>
            <option value="qbo">QBO</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction File
          </label>
          <input
            type="file"
            accept=".csv,.ofx,.qfx,.qbo"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
          {fileType === 'csv' && (
            <p className="mt-1 text-sm text-gray-500">
              CSV files should have columns for date, description, and amount.
            </p>
          )}
        </div>
        
        {fileType === 'csv' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </form>
    </div>
  );
}
