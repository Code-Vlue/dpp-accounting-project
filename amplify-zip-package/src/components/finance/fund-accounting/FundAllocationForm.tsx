// src/components/finance/fund-accounting/FundAllocationForm.tsx
import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';

interface FundAllocationFormProps {
  userId: string;
  onComplete: () => void;
}

const FundAllocationForm: React.FC<FundAllocationFormProps> = ({ userId, onComplete }) => {
  const { 
    funds,
    accounts, 
    fetchFunds,
    fetchAccounts,
    fundsLoading, 
    accountsLoading,
    fundAllocationDraft, 
    updateFundAllocationDraft,
    addFundAllocationEntry,
    updateFundAllocationEntry,
    removeFundAllocationEntry,
    createFundAllocation,
    fundAccountingLoading,
    fundAccountingError
  } = useFinanceStore();

  const [formError, setFormError] = useState<string>('');
  const [isBalanced, setIsBalanced] = useState<boolean>(false);

  useEffect(() => {
    fetchFunds();
    fetchAccounts();
  }, [fetchFunds, fetchAccounts]);

  useEffect(() => {
    // Check if entries are balanced (total debits = total credits)
    const totalDebits = fundAllocationDraft.entries.reduce(
      (sum, entry) => sum + (entry.debitAmount || 0), 
      0
    );
    
    const totalCredits = fundAllocationDraft.entries.reduce(
      (sum, entry) => sum + (entry.creditAmount || 0), 
      0
    );
    
    setIsBalanced(Math.abs(totalDebits - totalCredits) < 0.01);
  }, [fundAllocationDraft.entries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const { description, entries } = fundAllocationDraft;

    // Validate form
    if (!description.trim()) {
      setFormError('Please enter a description for this allocation');
      return;
    }

    if (entries.length < 2) {
      setFormError('At least two entries are required for a fund allocation');
      return;
    }

    // Check if all entries have required fields
    const invalidEntry = entries.find(
      entry => !entry.accountId || (!entry.debitAmount && !entry.creditAmount) || !entry.fundId
    );
    
    if (invalidEntry) {
      setFormError('All entries must have an account, fund, and either a debit or credit amount');
      return;
    }

    if (!isBalanced) {
      setFormError('Entries must be balanced (total debits must equal total credits)');
      return;
    }

    try {
      await createFundAllocation(userId);
      onComplete();
    } catch (error) {
      console.error('Error creating fund allocation:', error);
      setFormError('Failed to create fund allocation');
    }
  };

  const calculateTotals = () => {
    const totalDebits = fundAllocationDraft.entries.reduce(
      (sum, entry) => sum + (entry.debitAmount || 0), 
      0
    );
    
    const totalCredits = fundAllocationDraft.entries.reduce(
      (sum, entry) => sum + (entry.creditAmount || 0), 
      0
    );
    
    return { totalDebits, totalCredits, difference: totalDebits - totalCredits };
  };

  const { totalDebits, totalCredits, difference } = calculateTotals();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Create Fund Allocation</h2>

      {formError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{formError}</p>
        </div>
      )}

      {fundAccountingError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{fundAccountingError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={fundAllocationDraft.description}
              onChange={(e) => updateFundAllocationDraft({ description: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter a description"
              disabled={fundAccountingLoading}
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Allocation Date
            </label>
            <input
              type="date"
              id="date"
              value={fundAllocationDraft.date.toISOString().split('T')[0]}
              onChange={(e) => updateFundAllocationDraft({ date: new Date(e.target.value) })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={fundAccountingLoading}
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Allocation Entries</h3>
            <button
              type="button"
              onClick={addFundAllocationEntry}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={fundAccountingLoading}
            >
              Add Entry
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fund
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debit
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fundAllocationDraft.entries.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <select
                        value={entry.accountId}
                        onChange={(e) => updateFundAllocationEntry(index, { accountId: e.target.value })}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                        disabled={accountsLoading || fundAccountingLoading}
                      >
                        <option value="">Select Account</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.accountNumber} - {account.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <select
                        value={entry.fundId}
                        onChange={(e) => updateFundAllocationEntry(index, { fundId: e.target.value })}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                        disabled={fundsLoading || fundAccountingLoading}
                      >
                        <option value="">Select Fund</option>
                        {funds.map((fund) => (
                          <option key={fund.id} value={fund.id}>
                            {fund.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="text"
                        value={entry.description}
                        onChange={(e) => updateFundAllocationEntry(index, { description: e.target.value })}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                        placeholder="Description"
                        disabled={fundAccountingLoading}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        value={entry.debitAmount || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          updateFundAllocationEntry(index, { 
                            debitAmount: value,
                            creditAmount: value > 0 ? 0 : entry.creditAmount // Clear credit if debit is entered
                          });
                        }}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs text-right"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={fundAccountingLoading || entry.creditAmount > 0}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        value={entry.creditAmount || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          updateFundAllocationEntry(index, { 
                            creditAmount: value,
                            debitAmount: value > 0 ? 0 : entry.debitAmount // Clear debit if credit is entered
                          });
                        }}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs text-right"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={fundAccountingLoading || entry.debitAmount > 0}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => removeFundAllocationEntry(index)}
                        className="text-red-600 hover:text-red-900"
                        disabled={fundAccountingLoading || fundAllocationDraft.entries.length <= 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-medium">
                    Totals:
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    ${totalDebits.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    ${totalCredits.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-medium">
                    Difference:
                  </td>
                  <td colSpan={2} className={`px-3 py-2 text-right font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    ${difference.toFixed(2)}
                    {isBalanced && <span className="ml-2 text-xs">✓</span>}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onComplete}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={fundAccountingLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isBalanced ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            disabled={fundAccountingLoading || !isBalanced}
          >
            {fundAccountingLoading ? 'Processing...' : 'Create Allocation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FundAllocationForm;