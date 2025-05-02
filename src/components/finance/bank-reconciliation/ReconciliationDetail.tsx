// /workspace/DPP-Project/src/components/finance/bank-reconciliation/ReconciliationDetail.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { BankReconciliation, BankAccount, BankTransaction } from '@/types/finance';
import TransactionList from './TransactionList';
import TransactionMatchingPanel from './TransactionMatchingPanel';

interface ReconciliationDetailProps {
  reconciliationId: string;
}

export default function ReconciliationDetail({ reconciliationId }: ReconciliationDetailProps) {
  const router = useRouter();
  const { 
    getBankReconciliation, 
    getBankAccount, 
    getBankTransactions,
    completeReconciliation,
    cancelReconciliation
  } = useFinanceStore();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [reconciliation, setReconciliation] = useState<BankReconciliation | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [unreconciledTransactions, setUnreconciledTransactions] = useState<BankTransaction[]>([]);
  const [showMatchingPanel, setShowMatchingPanel] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reconciliationData = await getBankReconciliation(reconciliationId);
        setReconciliation(reconciliationData);
        
        if (reconciliationData) {
          const accountData = await getBankAccount(reconciliationData.bankAccountId);
          setBankAccount(accountData);
          
          const transactions = await getBankTransactions({
            bankAccountId: reconciliationData.bankAccountId,
            startDate: reconciliationData.statementDate,
            endDate: reconciliationData.statementEndingDate,
            reconciled: false
          });
          setUnreconciledTransactions(transactions);
        }
      } catch (err) {
        setError('Failed to load reconciliation data');
        console.error('Error loading reconciliation data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [reconciliationId, getBankReconciliation, getBankAccount, getBankTransactions]);
  
  const handleCompleteReconciliation = async () => {
    if (!reconciliation) return;
    
    try {
      setIsLoading(true);
      await completeReconciliation(reconciliationId);
      router.push(`/finance/banking/accounts/${reconciliation.bankAccountId}`);
    } catch (err) {
      setError('Failed to complete reconciliation');
      console.error('Error completing reconciliation:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelReconciliation = async () => {
    if (!reconciliation) return;
    
    try {
      setIsLoading(true);
      await cancelReconciliation(reconciliationId);
      router.push(`/finance/banking/accounts/${reconciliation.bankAccountId}`);
    } catch (err) {
      setError('Failed to cancel reconciliation');
      console.error('Error canceling reconciliation:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTransactionSelect = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setShowMatchingPanel(true);
  };
  
  const handleMatchingComplete = () => {
    setShowMatchingPanel(false);
    setSelectedTransaction(null);
    // Refresh unreconciled transactions
    if (reconciliation) {
      getBankTransactions({
        bankAccountId: reconciliation.bankAccountId,
        startDate: reconciliation.statementDate,
        endDate: reconciliation.statementEndingDate,
        reconciled: false
      }).then(setUnreconciledTransactions);
    }
  };
  
  if (isLoading && !reconciliation) {
    return <div className="p-4">Loading reconciliation data...</div>;
  }
  
  if (!reconciliation || !bankAccount) {
    return (
      <div className="p-4 text-red-500">
        {error || 'Reconciliation or bank account not found'}
      </div>
    );
  }
  
  const difference = bankAccount.currentBalance - reconciliation.statementBalance;
  const isReconciled = reconciliation.status === 'completed';
  const canComplete = difference === 0 && unreconciledTransactions.length === 0;
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Reconciliation: {bankAccount.accountName}
        </h2>
        <div className="flex space-x-2">
          {!isReconciled && (
            <>
              <button
                onClick={handleCancelReconciliation}
                className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50"
                disabled={isLoading}
              >
                Cancel Reconciliation
              </button>
              <button
                onClick={handleCompleteReconciliation}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={isLoading || !canComplete}
              >
                Complete Reconciliation
              </button>
            </>
          )}
          {isReconciled && (
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded">
              Reconciled on {new Date(reconciliation.completedDate || '').toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-medium mb-2">Statement Details</h3>
          <p>Statement Date: {new Date(reconciliation.statementDate).toLocaleDateString()}</p>
          <p>Statement Ending Date: {new Date(reconciliation.statementEndingDate).toLocaleDateString()}</p>
          <p className="font-semibold">Statement Balance: ${reconciliation.statementBalance.toFixed(2)}</p>
        </div>
        
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-medium mb-2">Book Balance</h3>
          <p>Current Balance: ${bankAccount.currentBalance.toFixed(2)}</p>
          <p>Last Reconciled: {bankAccount.lastReconciliationDate 
            ? new Date(bankAccount.lastReconciliationDate).toLocaleDateString() 
            : 'Never'}</p>
          <p className="font-semibold mt-2">Difference: ${Math.abs(difference).toFixed(2)}
            <span className={difference === 0 ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
              {difference === 0 ? '✓' : difference > 0 ? '(Book > Bank)' : '(Bank > Book)'}
            </span>
          </p>
        </div>
        
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-medium mb-2">Reconciliation Status</h3>
          <p>Status: 
            <span className={`ml-2 font-semibold ${
              reconciliation.status === 'completed' ? 'text-green-600' : 
              reconciliation.status === 'in_progress' ? 'text-blue-600' : 'text-yellow-600'
            }`}>
              {reconciliation.status === 'completed' ? 'Completed' : 
               reconciliation.status === 'in_progress' ? 'In Progress' : 'Draft'}
            </span>
          </p>
          <p>Unreconciled Transactions: {unreconciledTransactions.length}</p>
          {!isReconciled && !canComplete && (
            <p className="text-red-600 mt-2">
              {difference !== 0 
                ? 'Balance difference must be zero to complete reconciliation'
                : 'All transactions must be reconciled to complete'}
            </p>
          )}
        </div>
      </div>
      
      {showMatchingPanel && selectedTransaction && (
        <div className="mb-6">
          <TransactionMatchingPanel 
            transaction={selectedTransaction}
            reconciliationId={reconciliationId}
            onComplete={handleMatchingComplete}
            onCancel={() => setShowMatchingPanel(false)}
          />
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Unreconciled Transactions</h3>
        {unreconciledTransactions.length > 0 ? (
          <TransactionList 
            transactions={unreconciledTransactions}
            onSelect={handleTransactionSelect}
            showReconcileButton={!isReconciled}
          />
        ) : (
          <div className="p-4 bg-gray-50 rounded text-center">
            {isReconciled 
              ? 'All transactions have been reconciled.'
              : 'No unreconciled transactions for this period.'}
          </div>
        )}
      </div>
      
      {reconciliation.notes && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Notes</h3>
          <div className="p-3 bg-yellow-50 rounded">
            {reconciliation.notes}
          </div>
        </div>
      )}
    </div>
  );
}
