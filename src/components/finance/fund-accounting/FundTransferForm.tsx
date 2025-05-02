// src/components/finance/fund-accounting/FundTransferForm.tsx
import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';

interface FundTransferFormProps {
  userId: string;
  onComplete: () => void;
}

const FundTransferForm: React.FC<FundTransferFormProps> = ({ userId, onComplete }) => {
  const { 
    funds, 
    fetchFunds, 
    fundsLoading, 
    fundTransferDraft, 
    updateFundTransferDraft, 
    createFundTransfer,
    fundAccountingLoading,
    fundAccountingError
  } = useFinanceStore();

  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const { sourceId, destinationId, amount, description } = fundTransferDraft;

    // Validate form
    if (!sourceId) {
      setFormError('Please select a source fund');
      return;
    }

    if (!destinationId) {
      setFormError('Please select a destination fund');
      return;
    }

    if (sourceId === destinationId) {
      setFormError('Source and destination funds cannot be the same');
      return;
    }

    if (!amount || amount <= 0) {
      setFormError('Please enter a valid amount greater than zero');
      return;
    }

    if (!description.trim()) {
      setFormError('Please enter a description for this transfer');
      return;
    }

    try {
      await createFundTransfer(userId);
      onComplete();
    } catch (error) {
      console.error('Error creating fund transfer:', error);
      setFormError('Failed to create fund transfer');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Create Fund Transfer</h2>

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
        <div className="mb-4">
          <label htmlFor="sourceId" className="block text-sm font-medium text-gray-700 mb-1">
            Source Fund
          </label>
          <select
            id="sourceId"
            value={fundTransferDraft.sourceId}
            onChange={(e) => updateFundTransferDraft({ sourceId: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={fundsLoading || fundAccountingLoading}
          >
            <option value="">Select Source Fund</option>
            {funds.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name} (${fund.fundBalance.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="destinationId" className="block text-sm font-medium text-gray-700 mb-1">
            Destination Fund
          </label>
          <select
            id="destinationId"
            value={fundTransferDraft.destinationId}
            onChange={(e) => updateFundTransferDraft({ destinationId: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={fundsLoading || fundAccountingLoading}
          >
            <option value="">Select Destination Fund</option>
            {funds.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name} (${fund.fundBalance.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              value={fundTransferDraft.amount || ''}
              onChange={(e) => updateFundTransferDraft({ amount: parseFloat(e.target.value) || 0 })}
              className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              disabled={fundAccountingLoading}
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Transfer Date
          </label>
          <input
            type="date"
            id="date"
            value={fundTransferDraft.date.toISOString().split('T')[0]}
            onChange={(e) => updateFundTransferDraft({ date: new Date(e.target.value) })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={fundAccountingLoading}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={fundTransferDraft.description}
            onChange={(e) => updateFundTransferDraft({ description: e.target.value })}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter a description for this fund transfer"
            disabled={fundAccountingLoading}
          />
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={fundAccountingLoading}
          >
            {fundAccountingLoading ? 'Processing...' : 'Create Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FundTransferForm;