// src/lib/finance/fund-accounting-service.ts
import { 
  Fund, 
  FundType, 
  Transaction,
  TransactionEntry,
  TransactionType,
  TransactionStatus,
  ChartOfAccount,
  AccountType,
  FiscalYear,
  FiscalPeriod
} from '@/types/finance';

// Mock data for development purposes
let mockFunds: Fund[] = [
  {
    id: 'fund-001',
    name: 'General Fund',
    description: 'Primary operating fund for the organization',
    type: FundType.GENERAL,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    fundBalance: 1250000
  },
  {
    id: 'fund-002',
    name: 'Provider Support Fund',
    description: 'Restricted fund for provider quality improvement grants',
    type: FundType.RESTRICTED,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    startDate: new Date('2023-01-01'),
    endDate: new Date('2025-12-31'),
    restrictionDetails: 'Use limited to provider quality improvement initiatives',
    fundBalance: 450000
  },
  {
    id: 'fund-003',
    name: 'Tuition Credits Fund',
    description: 'Restricted fund for tuition credit payments',
    type: FundType.RESTRICTED,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    startDate: new Date('2023-01-01'),
    restrictionDetails: 'Use limited to tuition credit payments to providers',
    fundBalance: 3500000
  },
  {
    id: 'fund-004',
    name: 'Endowment Fund',
    description: 'Permanently restricted endowment fund',
    type: FundType.PERMANENTLY_RESTRICTED,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    restrictionDetails: 'Principal must remain intact, only earnings may be used',
    fundBalance: 250000
  },
  {
    id: 'fund-005',
    name: 'Capital Improvements',
    description: 'Board designated fund for capital improvements',
    type: FundType.BOARD_DESIGNATED,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    fundBalance: 175000
  }
];

// Mock inter-fund transfers for development
let mockFundTransfers: Transaction[] = [
  {
    id: 'trans-001',
    type: TransactionType.JOURNAL_ENTRY,
    date: new Date('2023-03-15'),
    description: 'Transfer from General Fund to Provider Support Fund',
    reference: 'IFT-23-001',
    amount: 50000,
    status: TransactionStatus.POSTED,
    fiscalYearId: 'fy-2023',
    fiscalPeriodId: 'fp-2023-03',
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-03-15'),
    createdById: 'user-001',
    approvedById: 'user-002',
    approvedAt: new Date('2023-03-15'),
    postedAt: new Date('2023-03-15'),
    entries: [
      {
        id: 'entry-001',
        transactionId: 'trans-001',
        accountId: 'acct-transfer-out',
        fundId: 'fund-001',
        description: 'Transfer to Provider Support Fund',
        debitAmount: 50000,
        creditAmount: 0,
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date('2023-03-15')
      },
      {
        id: 'entry-002',
        transactionId: 'trans-001',
        accountId: 'acct-transfer-in',
        fundId: 'fund-002',
        description: 'Transfer from General Fund',
        debitAmount: 0,
        creditAmount: 50000,
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date('2023-03-15')
      }
    ]
  }
];

// Mock fund allocations for development
let mockFundAllocations: Transaction[] = [
  {
    id: 'alloc-001',
    type: TransactionType.JOURNAL_ENTRY,
    date: new Date('2023-04-01'),
    description: 'Expense allocation between funds',
    reference: 'ALLOC-23-001',
    amount: 25000,
    status: TransactionStatus.POSTED,
    fiscalYearId: 'fy-2023',
    fiscalPeriodId: 'fp-2023-04',
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2023-04-01'),
    createdById: 'user-001',
    approvedById: 'user-002',
    approvedAt: new Date('2023-04-01'),
    postedAt: new Date('2023-04-01'),
    entries: [
      {
        id: 'allocentry-001',
        transactionId: 'alloc-001',
        accountId: 'acct-salary-expense',
        fundId: 'fund-001',
        description: 'Salary expense allocation to General Fund',
        debitAmount: 15000,
        creditAmount: 0,
        createdAt: new Date('2023-04-01'),
        updatedAt: new Date('2023-04-01')
      },
      {
        id: 'allocentry-002',
        transactionId: 'alloc-001',
        accountId: 'acct-salary-expense',
        fundId: 'fund-002',
        description: 'Salary expense allocation to Provider Support Fund',
        debitAmount: 10000,
        creditAmount: 0,
        createdAt: new Date('2023-04-01'),
        updatedAt: new Date('2023-04-01')
      },
      {
        id: 'allocentry-003',
        transactionId: 'alloc-001',
        accountId: 'acct-salary-clearing',
        fundId: 'fund-001',
        description: 'Salary clearing entry',
        debitAmount: 0,
        creditAmount: 25000,
        createdAt: new Date('2023-04-01'),
        updatedAt: new Date('2023-04-01')
      }
    ]
  }
];

// Fund Accounting Service Implementation
class FundAccountingService {
  // Fund management methods
  async getAllFunds(): Promise<Fund[]> {
    return Promise.resolve(mockFunds);
  }

  async getFundById(id: string): Promise<Fund | null> {
    const fund = mockFunds.find(f => f.id === id);
    return Promise.resolve(fund || null);
  }

  async getFundsByType(type: FundType): Promise<Fund[]> {
    const funds = mockFunds.filter(f => f.type === type);
    return Promise.resolve(funds);
  }

  async createFund(fund: Omit<Fund, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fund> {
    const newFund: Fund = {
      ...fund,
      id: `fund-${mockFunds.length + 1}`.padStart(9, '0'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockFunds.push(newFund);
    return Promise.resolve(newFund);
  }

  async updateFund(id: string, fundData: Partial<Fund>): Promise<Fund | null> {
    const index = mockFunds.findIndex(f => f.id === id);
    if (index === -1) return Promise.resolve(null);
    
    mockFunds[index] = {
      ...mockFunds[index],
      ...fundData,
      updatedAt: new Date()
    };
    
    return Promise.resolve(mockFunds[index]);
  }

  // Fund transfer methods
  async createFundTransfer(
    sourceId: string,
    destinationId: string,
    amount: number,
    description: string,
    date: Date,
    userId: string,
    fiscalYearId: string,
    fiscalPeriodId: string
  ): Promise<Transaction> {
    // In a real implementation, this would validate funds, create journal entries, etc.
    const newTransfer: Transaction = {
      id: `trans-${mockFundTransfers.length + 1}`.padStart(9, '0'),
      type: TransactionType.JOURNAL_ENTRY,
      date,
      description,
      reference: `IFT-${new Date().getFullYear().toString().substring(2)}-${mockFundTransfers.length + 1}`.padStart(9, '0'),
      amount,
      status: TransactionStatus.DRAFT,
      fiscalYearId,
      fiscalPeriodId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: userId,
      entries: [
        {
          id: `entry-${Date.now()}-1`,
          transactionId: '',
          accountId: 'acct-transfer-out',
          fundId: sourceId,
          description: `Transfer to fund ${destinationId}`,
          debitAmount: amount,
          creditAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `entry-${Date.now()}-2`,
          transactionId: '',
          accountId: 'acct-transfer-in',
          fundId: destinationId,
          description: `Transfer from fund ${sourceId}`,
          debitAmount: 0,
          creditAmount: amount,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    };
    
    // Update transaction ID in entries
    newTransfer.entries = newTransfer.entries.map(e => ({
      ...e,
      transactionId: newTransfer.id
    }));
    
    mockFundTransfers.push(newTransfer);
    return Promise.resolve(newTransfer);
  }

  async getFundTransfers(fundId?: string): Promise<Transaction[]> {
    if (!fundId) {
      return Promise.resolve(mockFundTransfers);
    }
    
    const transfers = mockFundTransfers.filter(t => 
      t.entries.some(e => e.fundId === fundId)
    );
    
    return Promise.resolve(transfers);
  }

  // Fund allocation methods
  async createFundAllocation(
    entries: {
      accountId: string;
      fundId: string;
      description: string;
      debitAmount: number;
      creditAmount: number;
    }[],
    description: string,
    date: Date,
    userId: string,
    fiscalYearId: string,
    fiscalPeriodId: string
  ): Promise<Transaction> {
    // Validate balanced transaction in a real implementation
    const totalDebits = entries.reduce((sum, entry) => sum + entry.debitAmount, 0);
    const totalCredits = entries.reduce((sum, entry) => sum + entry.creditAmount, 0);
    
    if (totalDebits !== totalCredits) {
      throw new Error("Fund allocation entries must balance (total debits must equal total credits)");
    }
    
    const newAllocation: Transaction = {
      id: `alloc-${mockFundAllocations.length + 1}`.padStart(9, '0'),
      type: TransactionType.JOURNAL_ENTRY,
      date,
      description,
      reference: `ALLOC-${new Date().getFullYear().toString().substring(2)}-${mockFundAllocations.length + 1}`.padStart(9, '0'),
      amount: totalDebits, // Total transaction amount
      status: TransactionStatus.DRAFT,
      fiscalYearId,
      fiscalPeriodId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: userId,
      entries: entries.map((entry, index) => ({
        id: `allocentry-${Date.now()}-${index}`,
        transactionId: '',
        accountId: entry.accountId,
        fundId: entry.fundId,
        description: entry.description,
        debitAmount: entry.debitAmount,
        creditAmount: entry.creditAmount,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    };
    
    // Update transaction ID in entries
    newAllocation.entries = newAllocation.entries.map(e => ({
      ...e,
      transactionId: newAllocation.id
    }));
    
    mockFundAllocations.push(newAllocation);
    return Promise.resolve(newAllocation);
  }

  async getFundAllocations(fundId?: string): Promise<Transaction[]> {
    if (!fundId) {
      return Promise.resolve(mockFundAllocations);
    }
    
    const allocations = mockFundAllocations.filter(a => 
      a.entries.some(e => e.fundId === fundId)
    );
    
    return Promise.resolve(allocations);
  }

  // Fund balance methods
  async getFundBalance(fundId: string): Promise<number> {
    const fund = await this.getFundById(fundId);
    return Promise.resolve(fund?.fundBalance || 0);
  }

  async getFundBalanceByPeriod(fundId: string, fiscalPeriodId: string): Promise<number> {
    // In a real implementation, this would calculate the balance based on transactions
    // for the specified fiscal period
    const fund = await this.getFundById(fundId);
    // Simulate different balances per period for demo purposes
    const randomFactor = parseFloat(fiscalPeriodId.split('-')[2]) / 12;
    return Promise.resolve((fund?.fundBalance || 0) * randomFactor);
  }

  // Fund reporting methods
  async getFundBalanceSheets(fiscalPeriodId?: string): Promise<{
    fundId: string;
    fundName: string;
    fundType: FundType;
    assets: number;
    liabilities: number;
    fundBalance: number;
  }[]> {
    const funds = await this.getAllFunds();
    
    return Promise.resolve(funds.map(fund => ({
      fundId: fund.id,
      fundName: fund.name,
      fundType: fund.type,
      assets: fund.fundBalance * 1.2, // Simulated assets calculation
      liabilities: fund.fundBalance * 0.2, // Simulated liabilities calculation
      fundBalance: fund.fundBalance
    })));
  }

  async getFundActivityReport(fundId: string, startDate: Date, endDate: Date): Promise<{
    fundDetails: Fund | null;
    beginningBalance: number;
    totalInflows: number;
    totalOutflows: number;
    endingBalance: number;
    transactions: Transaction[];
  }> {
    const fund = await this.getFundById(fundId);
    
    // Get all transactions related to this fund
    const allTransfers = await this.getFundTransfers(fundId);
    const allAllocations = await this.getFundAllocations(fundId);
    
    // Combine and filter by date range
    const allTransactions = [...allTransfers, ...allAllocations].filter(
      t => t.date >= startDate && t.date <= endDate
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate inflows and outflows
    let totalInflows = 0;
    let totalOutflows = 0;
    
    allTransactions.forEach(transaction => {
      transaction.entries.forEach(entry => {
        if (entry.fundId === fundId) {
          if (entry.creditAmount > 0) {
            totalInflows += entry.creditAmount;
          }
          if (entry.debitAmount > 0) {
            totalOutflows += entry.debitAmount;
          }
        }
      });
    });
    
    // Simulate beginning balance (would be calculated from actual data in real implementation)
    const beginningBalance = (fund?.fundBalance || 0) - (totalInflows - totalOutflows);
    
    return Promise.resolve({
      fundDetails: fund,
      beginningBalance,
      totalInflows,
      totalOutflows,
      endingBalance: beginningBalance + totalInflows - totalOutflows,
      transactions: allTransactions
    });
  }

  async getFundRestrictionReport(): Promise<{
    fundId: string;
    fundName: string;
    fundType: FundType;
    isRestricted: boolean;
    restrictionDetails: string | undefined;
    balance: number;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }[]> {
    const funds = await this.getAllFunds();
    
    return Promise.resolve(funds.map(fund => ({
      fundId: fund.id,
      fundName: fund.name,
      fundType: fund.type,
      isRestricted: fund.type !== FundType.GENERAL,
      restrictionDetails: fund.restrictionDetails,
      balance: fund.fundBalance,
      startDate: fund.startDate,
      endDate: fund.endDate
    })));
  }

  // Fund reconciliation methods
  async reconcileFund(fundId: string, asOfDate: Date): Promise<{
    fundId: string;
    asOfDate: Date;
    generalLedgerBalance: number;
    calculatedBalance: number;
    isReconciled: boolean;
    discrepancy: number;
  }> {
    const fund = await this.getFundById(fundId);
    const balance = fund?.fundBalance || 0;
    
    // In a real implementation, this would perform detailed reconciliation
    // For demonstration, we'll just add a small random discrepancy sometimes
    const randomDiscrepancy = Math.random() > 0.7 ? (Math.random() * 100 - 50) : 0;
    const calculatedBalance = balance + randomDiscrepancy;
    
    return Promise.resolve({
      fundId,
      asOfDate,
      generalLedgerBalance: balance,
      calculatedBalance,
      isReconciled: randomDiscrepancy === 0,
      discrepancy: randomDiscrepancy
    });
  }
}

// Create and export singleton instance
export const fundAccountingService = new FundAccountingService();