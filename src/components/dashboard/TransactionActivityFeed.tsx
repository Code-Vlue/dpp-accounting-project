'use client';

// src/components/dashboard/TransactionActivityFeed.tsx
import { useState } from 'react';
import { format, subDays, subHours } from 'date-fns';

// Sample transaction data
const generateSampleTransactions = () => {
  const transactionTypes = [
    { type: 'payment', category: 'Accounts Payable', icon: '💸' },
    { type: 'deposit', category: 'Accounts Receivable', icon: '💰' },
    { type: 'transfer', category: 'Fund Transfer', icon: '🔄' },
    { type: 'invoice', category: 'Accounts Payable', icon: '📄' },
    { type: 'adjustment', category: 'Journal Entry', icon: '📝' },
    { type: 'tuition', category: 'Tuition Credits', icon: '🎓' },
  ];
  
  const organizations = [
    'Mile High Montessori',
    'Denver Preschool',
    'Rocky Mountain Academy',
    'Little Scholars Daycare',
    'Bright Horizons Learning',
    'Creative Kids Center',
    'Mountain View Preschool',
    'Sunshine Learning Academy',
  ];
  
  // Generate 12 transactions with recent dates
  return Array.from({ length: 12 }).map((_, i) => {
    const transactionInfo = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const amount = Math.floor(Math.random() * 10000) / 100 * (transactionInfo.type === 'payment' ? -1 : 1);
    const organization = organizations[Math.floor(Math.random() * organizations.length)];
    const timestamp = i < 3 
      ? subHours(new Date(), Math.floor(Math.random() * 12))
      : subDays(new Date(), Math.floor(Math.random() * 14));
    
    return {
      id: `tx-${Date.now()}-${i}`,
      type: transactionInfo.type,
      category: transactionInfo.category,
      icon: transactionInfo.icon,
      amount,
      organization,
      timestamp,
      status: Math.random() > 0.2 ? 'completed' : 'pending'
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Format date relative to now
const formatRelativeDate = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  }
};

interface TransactionActivityFeedProps {
  title?: string;
  maxItems?: number;
}

export default function TransactionActivityFeed({ 
  title = "Recent Transactions",
  maxItems = 5 
}: TransactionActivityFeedProps) {
  const [transactions] = useState(generateSampleTransactions);
  const [filter, setFilter] = useState<string | null>(null);
  
  // Filter transactions
  const filteredTransactions = filter 
    ? transactions.filter(tx => tx.type === filter)
    : transactions;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-dark-blue">
          {title}
        </h2>
        <div className="flex space-x-2 text-sm">
          <button 
            onClick={() => setFilter(null)}
            className={`px-2 py-1 rounded-md ${
              filter === null 
                ? 'bg-blue-100 text-primary-blue' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('payment')}
            className={`px-2 py-1 rounded-md ${
              filter === 'payment' 
                ? 'bg-blue-100 text-primary-blue' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Payments
          </button>
          <button 
            onClick={() => setFilter('deposit')}
            className={`px-2 py-1 rounded-md ${
              filter === 'deposit' 
                ? 'bg-blue-100 text-primary-blue' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Deposits
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredTransactions.slice(0, maxItems).map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">{transaction.icon}</div>
              <div>
                <p className="font-medium text-gray-800">
                  {transaction.organization}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.category} • {formatRelativeDate(transaction.timestamp)}
                </p>
              </div>
            </div>
            <div className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(transaction.amount)}
            </div>
          </div>
        ))}
      </div>
      
      {filteredTransactions.length > maxItems && (
        <div className="mt-4 text-center">
          <button className="text-primary-blue hover:text-blue-700 text-sm font-medium">
            View All Transactions
          </button>
        </div>
      )}
      
      {filteredTransactions.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>No transactions found</p>
        </div>
      )}
    </div>
  );
}