// /workspace/DPP-Project/src/components/finance/bank-reconciliation/ReconciliationForm.tsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { BankAccount, BankReconciliation, BankTransaction } from '@/types/finance';

interface ReconciliationFormProps {
  bankAccountId: string;
  reconciliationId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReconciliationForm({
  bankAccountId,
  reconciliationId,
  onSuccess,
  onCancel
}: ReconciliationFormProps) {
  const router = useRouter();
  const { getBankAccount, getBankReconciliation, createBankReconciliation, updateBankReconciliation, getBankTransactions } = useFinanceStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState<Partial<BankReconciliation>>({
    bankAccountId: bankAccountId,
    statementDate: new Date().toISOString().split('T')[0],
    statementBalance: 0,
    statementEndingDate: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'in_progress'
  });
  const [unreconciled, setUnreconciled] = useState<BankTransaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const account = await getBankAccount(bankAccountId);
        setBankAccount(account);
        
        // Fetch unreconciled transactions
        const transactions = await getBankTransactions({
          bankAccountId,
          reconciled: false
        });
        setUnreconciled(transactions);
        
        if (reconciliationId) {
          const reconciliation = await getBankReconciliation(reconciliationId);
          if (reconciliation) {
            setFormData({
              ...reconciliation,
              statementDate: reconciliation.statementDate.split('T')[0],
              statementEndingDate: reconciliation.statementEndingDate.split('T')[0]
            });
          }
        }
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error loading reconciliation data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [bankAccountId, reconciliationId, getBankAccount, getBankReconciliation, getBankTransactions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (reconciliationId) {
        await updateBankReconciliation(reconciliationId, formData as BankReconciliation);
      } else {
        await createBankReconciliation(formData as BankReconciliation);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/finance/banking/reconciliations/${reconciliationId || 'new'}`);
      }
    } catch (err) {
      setError('Failed to save reconciliation. Please try again.');
      console.error('Error saving reconciliation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !bankAccount) {
    return <div className="p-4">Loading...</div>;
  }

  if (!bankAccount) {
    return <div className="p-4 text-red-500">Bank account not found</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {reconciliationId ? 'Edit Reconciliation' : 'New Reconciliation'}
      </h2>
      
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <h3 className="font-medium">Account: {bankAccount.accountName}</h3>
        <p>Account Number: {bankAccount.accountNumber.replace(/(?<=^.{4}).*(?=.{4}$)/, '******')}</p>
        <p>Current Book Balance: ${bankAccount.currentBalance.toFixed(2)}</p>
        <p>Last Reconciled: {bankAccount.lastReconciliationDate ? new Date(bankAccount.lastReconciliationDate).toLocaleDateString() : 'Never'}</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statement Date
            </label>
            <input
              type="date"
              name="statementDate"
              value={formData.statementDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statement Ending Date
            </label>
            <input
              type="date"
              name="statementEndingDate"
              value={formData.statementEndingDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statement Ending Balance
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2">$</span>
            <input
              type="number"
              name="statementBalance"
              value={formData.statementBalance || ''}
              onChange={handleNumberChange}
              className="w-full p-2 pl-6 border rounded"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        
        <div className="mb-4 p-3 bg-yellow-50 rounded">
          <h3 className="font-medium mb-2">Unreconciled Transactions</h3>
          <p>
            There are <span className="font-semibold">{unreconciled.length}</span> unreconciled
            transactions for this account.
          </p>
        </div>
        
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
            {isLoading ? 'Saving...' : reconciliationId ? 'Update' : 'Start Reconciliation'}
          </button>
        </div>
      </form>
    </div>
  );
}
