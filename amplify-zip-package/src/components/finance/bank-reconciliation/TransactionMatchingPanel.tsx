// /workspace/DPP-Project/src/components/finance/bank-reconciliation/TransactionMatchingPanel.tsx
import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { BankTransaction, Transaction } from '@/types/finance';

interface TransactionMatchingPanelProps {
  transaction: BankTransaction;
  reconciliationId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function TransactionMatchingPanel({
  transaction,
  reconciliationId,
  onComplete,
  onCancel
}: TransactionMatchingPanelProps) {
  const { 
    findMatchCandidates, 
    matchTransaction, 
    createAdjustmentEntry,
    markAsReconciled
  } = useFinanceStore();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [matchCandidates, setMatchCandidates] = useState<Transaction[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [adjustmentDescription, setAdjustmentDescription] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'expense' | 'revenue'>('expense');
  const [adjustmentAccount, setAdjustmentAccount] = useState<string>('');
  
  useEffect(() => {
    const loadMatchCandidates = async () => {
      setIsLoading(true);
      try {
        const candidates = await findMatchCandidates(transaction.id);
        setMatchCandidates(candidates);
      } catch (err) {
        setError('Failed to load match candidates');
        console.error('Error loading match candidates:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMatchCandidates();
  }, [transaction.id, findMatchCandidates]);
  
  const handleMatchSelect = (matchId: string) => {
    setSelectedMatch(matchId);
  };
  
  const handleConfirmMatch = async () => {
    if (!selectedMatch) return;
    
    setIsLoading(true);
    try {
      await matchTransaction(transaction.id, selectedMatch);
      onComplete();
    } catch (err) {
      setError('Failed to match transaction');
      console.error('Error matching transaction:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateAdjustment = async () => {
    if (!adjustmentDescription || !adjustmentAccount) {
      setError('Please provide a description and account for the adjustment');
      return;
    }
    
    setIsLoading(true);
    try {
      await createAdjustmentEntry({
        transactionId: transaction.id,
        reconciliationId,
        description: adjustmentDescription,
        accountId: adjustmentAccount,
        type: adjustmentType,
        amount: Math.abs(transaction.amount)
      });
      onComplete();
    } catch (err) {
      setError('Failed to create adjustment entry');
      console.error('Error creating adjustment:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkAsReconciled = async () => {
    setIsLoading(true);
    try {
      await markAsReconciled(transaction.id);
      onComplete();
    } catch (err) {
      setError('Failed to mark transaction as reconciled');
      console.error('Error marking transaction:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 bg-white border rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Match Transaction</h3>
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <h4 className="font-medium mb-1">Bank Transaction</h4>
        <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
        <p>Description: {transaction.description}</p>
        <p className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
          Amount: ${Math.abs(transaction.amount).toFixed(2)} {transaction.amount < 0 ? 'Debit' : 'Credit'}
        </p>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-3">Matching Options</h4>
        
        <div className="mb-4">
          <div className="border-b pb-2 mb-2">
            <h5 className="font-medium text-sm">Option 1: Match to existing transaction</h5>
          </div>
          
          {isLoading ? (
            <p>Loading potential matches...</p>
          ) : matchCandidates.length > 0 ? (
            <div className="max-h-40 overflow-y-auto mb-2">
              {matchCandidates.map((match) => (
                <div 
                  key={match.id}
                  className={`p-2 mb-1 rounded cursor-pointer ${selectedMatch === match.id ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'}`}
                  onClick={() => handleMatchSelect(match.id)}
                >
                  <p className="text-sm font-medium">{match.description}</p>
                  <div className="flex justify-between text-xs">
                    <span>{new Date(match.date).toLocaleDateString()}</span>
                    <span className={match.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                      ${Math.abs(match.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-gray-500 mb-2">No potential matches found.</p>
          )}
          
          <button
            onClick={handleConfirmMatch}
            disabled={isLoading || !selectedMatch}
            className={`px-3 py-1 text-sm rounded ${selectedMatch ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            Confirm Match
          </button>
        </div>
        
        <div className="mb-4">
          <div className="border-b pb-2 mb-2">
            <h5 className="font-medium text-sm">Option 2: Create adjustment entry</h5>
          </div>
          
          <div className="space-y-2 mb-2">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={adjustmentDescription}
                onChange={(e) => setAdjustmentDescription(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="Describe the adjustment"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Type
              </label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as 'expense' | 'revenue')}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="expense">Expense</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Account
              </label>
              <input
                type="text"
                value={adjustmentAccount}
                onChange={(e) => setAdjustmentAccount(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="Account ID"
              />
            </div>
          </div>
          
          <button
            onClick={handleCreateAdjustment}
            disabled={isLoading || !adjustmentDescription || !adjustmentAccount}
            className={`px-3 py-1 text-sm rounded ${adjustmentDescription && adjustmentAccount ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            Create Adjustment
          </button>
        </div>
        
        <div>
          <div className="border-b pb-2 mb-2">
            <h5 className="font-medium text-sm">Option 3: Mark as reconciled</h5>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            Use this option when the transaction is correct but has no matching entry 
            (e.g., bank fees already accounted for in your books)
          </p>
          
          <button
            onClick={handleMarkAsReconciled}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Mark as Reconciled
          </button>
        </div>
      </div>
    </div>
  );
}
