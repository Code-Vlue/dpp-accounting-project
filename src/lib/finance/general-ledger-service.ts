// src/lib/finance/general-ledger-service.ts
import { 
  Transaction,
  TransactionEntry,
  TransactionType,
  TransactionStatus,
  JournalEntry,
  FiscalYear,
  FiscalPeriod,
  FiscalYearStatus,
  AccountBalance,
  AuditLogEntry,
  ApprovalStatus
} from '@/types/finance';
import { UserRole } from '@/types/auth';

// Mock data for development
const mockFiscalYears: FiscalYear[] = [
  {
    id: '1',
    name: 'FY 2024',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: FiscalYearStatus.OPEN,
    isCurrent: true,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-15')
  },
  {
    id: '2',
    name: 'FY 2023',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    status: FiscalYearStatus.CLOSED,
    isCurrent: false,
    createdAt: new Date('2022-12-15'),
    updatedAt: new Date('2024-01-15'),
    closingDate: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'FY 2025',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    status: FiscalYearStatus.PENDING,
    isCurrent: false,
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  }
];

const mockFiscalPeriods: FiscalPeriod[] = [
  {
    id: '1',
    fiscalYearId: '1',
    name: 'January 2024',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    status: FiscalYearStatus.CLOSED,
    periodNumber: 1,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: '2',
    fiscalYearId: '1',
    name: 'February 2024',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-29'),
    status: FiscalYearStatus.CLOSED,
    periodNumber: 2,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-03-05')
  },
  {
    id: '3',
    fiscalYearId: '1',
    name: 'March 2024',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-31'),
    status: FiscalYearStatus.CLOSED,
    periodNumber: 3,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-04-05')
  },
  {
    id: '4',
    fiscalYearId: '1',
    name: 'April 2024',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-04-30'),
    status: FiscalYearStatus.OPEN,
    periodNumber: 4,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-04-01')
  }
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: TransactionType.JOURNAL_ENTRY,
    date: new Date('2024-01-15'),
    description: 'Initial funding allocation',
    reference: 'JE-2024-001',
    amount: 500000,
    status: TransactionStatus.POSTED,
    fiscalYearId: '1',
    fiscalPeriodId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdById: 'user1',
    approvedById: 'user2',
    approvedAt: new Date('2024-01-15'),
    postedAt: new Date('2024-01-15'),
    entries: [
      {
        id: '1',
        transactionId: '1',
        accountId: '1', // Cash
        description: 'Initial funding',
        debitAmount: 500000,
        creditAmount: 0,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        transactionId: '1',
        accountId: '5', // Grant Revenue
        description: 'Initial funding',
        debitAmount: 0,
        creditAmount: 500000,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ]
  },
  {
    id: '2',
    type: TransactionType.JOURNAL_ENTRY,
    date: new Date('2024-02-10'),
    description: 'Tuition credit payment',
    reference: 'JE-2024-002',
    amount: 75000,
    status: TransactionStatus.POSTED,
    fiscalYearId: '1',
    fiscalPeriodId: '2',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    createdById: 'user1',
    approvedById: 'user2',
    approvedAt: new Date('2024-02-10'),
    postedAt: new Date('2024-02-10'),
    entries: [
      {
        id: '3',
        transactionId: '2',
        accountId: '6', // Tuition Credit Expense
        description: 'February tuition credits',
        debitAmount: 75000,
        creditAmount: 0,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: '4',
        transactionId: '2',
        accountId: '1', // Cash
        description: 'February tuition credits',
        debitAmount: 0,
        creditAmount: 75000,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
      }
    ]
  },
  {
    id: '3',
    type: TransactionType.ACCOUNTS_PAYABLE,
    date: new Date('2024-03-05'),
    description: 'Office supplies purchase',
    reference: 'AP-2024-001',
    amount: 1250,
    status: TransactionStatus.POSTED,
    fiscalYearId: '1',
    fiscalPeriodId: '3',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
    createdById: 'user1',
    approvedById: 'user2',
    approvedAt: new Date('2024-03-05'),
    postedAt: new Date('2024-03-05'),
    entries: [
      {
        id: '5',
        transactionId: '3',
        accountId: '8', // Office Supplies
        description: 'Office supplies purchase',
        debitAmount: 1250,
        creditAmount: 0,
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-05')
      },
      {
        id: '6',
        transactionId: '3',
        accountId: '3', // Accounts Payable
        description: 'Office supplies purchase',
        debitAmount: 0,
        creditAmount: 1250,
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-05')
      }
    ]
  },
  {
    id: '4',
    type: TransactionType.JOURNAL_ENTRY,
    date: new Date('2024-04-02'),
    description: 'April allocation adjustment',
    reference: 'JE-2024-003',
    amount: 15000,
    status: TransactionStatus.PENDING_APPROVAL,
    fiscalYearId: '1',
    fiscalPeriodId: '4',
    createdAt: new Date('2024-04-02'),
    updatedAt: new Date('2024-04-02'),
    createdById: 'user1',
    entries: [
      {
        id: '7',
        transactionId: '4',
        accountId: '1', // Cash
        description: 'April allocation adjustment',
        debitAmount: 15000,
        creditAmount: 0,
        createdAt: new Date('2024-04-02'),
        updatedAt: new Date('2024-04-02')
      },
      {
        id: '8',
        transactionId: '4',
        accountId: '5', // Grant Revenue
        description: 'April allocation adjustment',
        debitAmount: 0,
        creditAmount: 15000,
        createdAt: new Date('2024-04-02'),
        updatedAt: new Date('2024-04-02')
      }
    ]
  }
];

const mockJournalEntries: JournalEntry[] = [
  {
    ...mockTransactions[0] as JournalEntry,
    reason: 'Initial funding allocation for fiscal year 2024',
    recurring: false,
    approvalStatus: ApprovalStatus.APPROVED
  },
  {
    ...mockTransactions[1] as JournalEntry,
    reason: 'February tuition credit payment to providers',
    recurring: true,
    recurringSchedule: 'MONTHLY',
    approvalStatus: ApprovalStatus.APPROVED
  },
  {
    ...mockTransactions[3] as JournalEntry,
    reason: 'Additional funding allocation for April programs',
    recurring: false,
    approvalStatus: ApprovalStatus.PENDING
  }
];

const mockAccountBalances: AccountBalance[] = [
  {
    accountId: '1', // Cash
    fiscalYearId: '1',
    fiscalPeriodId: '4',
    openingBalance: 500000,
    currentBalance: 439750, // 500000 - 75000 + 15000 (pending) - 250 (other expenses)
    closingBalance: 0, // Not closed yet
    lastUpdated: new Date('2024-04-02')
  },
  {
    accountId: '3', // Accounts Payable
    fiscalYearId: '1',
    fiscalPeriodId: '4',
    openingBalance: 0,
    currentBalance: 1250,
    closingBalance: 0, // Not closed yet
    lastUpdated: new Date('2024-03-05')
  },
  {
    accountId: '5', // Grant Revenue
    fiscalYearId: '1',
    fiscalPeriodId: '4',
    openingBalance: 0,
    currentBalance: 515000, // 500000 + 15000 (pending)
    closingBalance: 0, // Not closed yet
    lastUpdated: new Date('2024-04-02')
  },
  {
    accountId: '6', // Tuition Credit Expense
    fiscalYearId: '1',
    fiscalPeriodId: '4',
    openingBalance: 0,
    currentBalance: 75000,
    closingBalance: 0, // Not closed yet
    lastUpdated: new Date('2024-02-10')
  },
  {
    accountId: '8', // Office Supplies
    fiscalYearId: '1',
    fiscalPeriodId: '4',
    openingBalance: 0,
    currentBalance: 1250,
    closingBalance: 0, // Not closed yet
    lastUpdated: new Date('2024-03-05')
  }
];

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    action: 'CREATE',
    entityType: 'TRANSACTION',
    entityId: '1',
    userId: 'user1',
    timestamp: new Date('2024-01-15'),
    details: 'Created journal entry for initial funding allocation',
    ipAddress: '192.168.1.1'
  },
  {
    id: '2',
    action: 'APPROVE',
    entityType: 'TRANSACTION',
    entityId: '1',
    userId: 'user2',
    timestamp: new Date('2024-01-15'),
    details: 'Approved journal entry for initial funding allocation',
    ipAddress: '192.168.1.2'
  },
  {
    id: '3',
    action: 'POST',
    entityType: 'TRANSACTION',
    entityId: '1',
    userId: 'user2',
    timestamp: new Date('2024-01-15'),
    details: 'Posted journal entry to general ledger',
    ipAddress: '192.168.1.2'
  },
  {
    id: '4',
    action: 'CREATE',
    entityType: 'TRANSACTION',
    entityId: '2',
    userId: 'user1',
    timestamp: new Date('2024-02-10'),
    details: 'Created journal entry for tuition credit payment',
    ipAddress: '192.168.1.1'
  },
  {
    id: '5',
    action: 'CREATE',
    entityType: 'TRANSACTION',
    entityId: '4',
    userId: 'user1',
    timestamp: new Date('2024-04-02'),
    details: 'Created journal entry for April allocation adjustment',
    ipAddress: '192.168.1.1'
  }
];

// Service for General Ledger management
class GeneralLedgerService {
  private transactions: Transaction[] = mockTransactions;
  private journalEntries: JournalEntry[] = mockJournalEntries;
  private fiscalYears: FiscalYear[] = mockFiscalYears;
  private fiscalPeriods: FiscalPeriod[] = mockFiscalPeriods;
  private accountBalances: AccountBalance[] = mockAccountBalances;
  private auditLogs: AuditLogEntry[] = mockAuditLogs;

  // Get all transactions
  async getAllTransactions(): Promise<Transaction[]> {
    return Promise.resolve([...this.transactions]);
  }

  // Get transaction by ID
  async getTransactionById(id: string): Promise<Transaction | null> {
    const transaction = this.transactions.find(t => t.id === id);
    return Promise.resolve(transaction || null);
  }

  // Get transactions by fiscal year
  async getTransactionsByFiscalYear(fiscalYearId: string): Promise<Transaction[]> {
    const filteredTransactions = this.transactions.filter(t => t.fiscalYearId === fiscalYearId);
    return Promise.resolve(filteredTransactions);
  }

  // Get transactions by fiscal period
  async getTransactionsByFiscalPeriod(fiscalPeriodId: string): Promise<Transaction[]> {
    const filteredTransactions = this.transactions.filter(t => t.fiscalPeriodId === fiscalPeriodId);
    return Promise.resolve(filteredTransactions);
  }

  // Get transactions by type
  async getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
    const filteredTransactions = this.transactions.filter(t => t.type === type);
    return Promise.resolve(filteredTransactions);
  }

  // Get transactions by status
  async getTransactionsByStatus(status: TransactionStatus): Promise<Transaction[]> {
    const filteredTransactions = this.transactions.filter(t => t.status === status);
    return Promise.resolve(filteredTransactions);
  }

  // Get transactions by account
  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    const filteredTransactions = this.transactions.filter(t => 
      t.entries.some(entry => entry.accountId === accountId)
    );
    return Promise.resolve(filteredTransactions);
  }

  // Create a new transaction
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: (this.transactions.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.transactions.push(newTransaction);
    this.createAuditLog('CREATE', 'TRANSACTION', newTransaction.id, newTransaction.createdById, 'Created transaction');
    
    return Promise.resolve(newTransaction);
  }

  // Update a transaction
  async updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<Transaction | null> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return Promise.resolve(null);
    
    // Store previous state for audit log
    const previousState = JSON.stringify(this.transactions[index]);
    
    this.transactions[index] = {
      ...this.transactions[index],
      ...transactionData,
      updatedAt: new Date()
    };
    
    const newState = JSON.stringify(this.transactions[index]);
    this.createAuditLog('UPDATE', 'TRANSACTION', id, transactionData.createdById || this.transactions[index].createdById, 'Updated transaction', undefined, previousState, newState);
    
    return Promise.resolve(this.transactions[index]);
  }

  // Approve a transaction
  async approveTransaction(id: string, approverId: string): Promise<Transaction | null> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.transactions[index] = {
      ...this.transactions[index],
      status: TransactionStatus.APPROVED,
      approvedById: approverId,
      approvedAt: new Date(),
      updatedAt: new Date()
    };
    
    this.createAuditLog('APPROVE', 'TRANSACTION', id, approverId, 'Approved transaction');
    
    return Promise.resolve(this.transactions[index]);
  }

  // Post a transaction
  async postTransaction(id: string): Promise<Transaction | null> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return Promise.resolve(null);
    
    if (this.transactions[index].status !== TransactionStatus.APPROVED) {
      throw new Error('Transaction must be approved before posting');
    }
    
    this.transactions[index] = {
      ...this.transactions[index],
      status: TransactionStatus.POSTED,
      postedAt: new Date(),
      updatedAt: new Date()
    };
    
    // Update account balances
    for (const entry of this.transactions[index].entries) {
      await this.updateAccountBalance(
        entry.accountId,
        this.transactions[index].fiscalYearId,
        this.transactions[index].fiscalPeriodId,
        entry.debitAmount - entry.creditAmount
      );
    }
    
    this.createAuditLog('POST', 'TRANSACTION', id, this.transactions[index].approvedById || '', 'Posted transaction to general ledger');
    
    return Promise.resolve(this.transactions[index]);
  }

  // Void a transaction
  async voidTransaction(id: string, voidedById: string, voidReason: string): Promise<Transaction | null> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return Promise.resolve(null);
    
    // Cannot void a transaction that isn't posted
    if (this.transactions[index].status !== TransactionStatus.POSTED) {
      throw new Error('Only posted transactions can be voided');
    }
    
    this.transactions[index] = {
      ...this.transactions[index],
      status: TransactionStatus.VOIDED,
      voidedById,
      voidedAt: new Date(),
      voidReason,
      updatedAt: new Date()
    };
    
    // Reverse the impact on account balances
    for (const entry of this.transactions[index].entries) {
      await this.updateAccountBalance(
        entry.accountId,
        this.transactions[index].fiscalYearId,
        this.transactions[index].fiscalPeriodId,
        -(entry.debitAmount - entry.creditAmount)
      );
    }
    
    this.createAuditLog('VOID', 'TRANSACTION', id, voidedById, `Voided transaction: ${voidReason}`);
    
    return Promise.resolve(this.transactions[index]);
  }

  // Get all fiscal years
  async getAllFiscalYears(): Promise<FiscalYear[]> {
    return Promise.resolve([...this.fiscalYears]);
  }

  // Get current fiscal year
  async getCurrentFiscalYear(): Promise<FiscalYear | null> {
    const currentFiscalYear = this.fiscalYears.find(fy => fy.isCurrent);
    return Promise.resolve(currentFiscalYear || null);
  }

  // Get fiscal year by ID
  async getFiscalYearById(id: string): Promise<FiscalYear | null> {
    const fiscalYear = this.fiscalYears.find(fy => fy.id === id);
    return Promise.resolve(fiscalYear || null);
  }

  // Create a new fiscal year
  async createFiscalYear(fiscalYear: Omit<FiscalYear, 'id' | 'createdAt' | 'updatedAt'>): Promise<FiscalYear> {
    const newFiscalYear: FiscalYear = {
      ...fiscalYear,
      id: (this.fiscalYears.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.fiscalYears.push(newFiscalYear);
    return Promise.resolve(newFiscalYear);
  }

  // Close a fiscal year
  async closeFiscalYear(id: string): Promise<FiscalYear | null> {
    const index = this.fiscalYears.findIndex(fy => fy.id === id);
    if (index === -1) return Promise.resolve(null);
    
    // Check if all periods are closed
    const periods = await this.getFiscalPeriodsByFiscalYear(id);
    const allPeriodsClosed = periods.every(p => p.status === FiscalYearStatus.CLOSED);
    
    if (!allPeriodsClosed) {
      throw new Error('Cannot close fiscal year until all periods are closed');
    }
    
    this.fiscalYears[index] = {
      ...this.fiscalYears[index],
      status: FiscalYearStatus.CLOSED,
      isCurrent: false,
      closingDate: new Date(),
      updatedAt: new Date()
    };
    
    // If this was the current fiscal year, set the next one as current
    if (this.fiscalYears[index].isCurrent) {
      const nextFiscalYearIndex = this.fiscalYears.findIndex(fy => 
        new Date(fy.startDate) > new Date(this.fiscalYears[index].endDate) && 
        fy.status === FiscalYearStatus.PENDING
      );
      
      if (nextFiscalYearIndex !== -1) {
        this.fiscalYears[nextFiscalYearIndex] = {
          ...this.fiscalYears[nextFiscalYearIndex],
          status: FiscalYearStatus.OPEN,
          isCurrent: true,
          updatedAt: new Date()
        };
      }
    }
    
    return Promise.resolve(this.fiscalYears[index]);
  }

  // Get all fiscal periods
  async getAllFiscalPeriods(): Promise<FiscalPeriod[]> {
    return Promise.resolve([...this.fiscalPeriods]);
  }

  // Get fiscal periods by fiscal year
  async getFiscalPeriodsByFiscalYear(fiscalYearId: string): Promise<FiscalPeriod[]> {
    const filteredPeriods = this.fiscalPeriods.filter(fp => fp.fiscalYearId === fiscalYearId);
    return Promise.resolve(filteredPeriods);
  }

  // Get current fiscal period
  async getCurrentFiscalPeriod(): Promise<FiscalPeriod | null> {
    const currentFiscalYear = await this.getCurrentFiscalYear();
    if (!currentFiscalYear) return Promise.resolve(null);
    
    const currentDate = new Date();
    const currentPeriod = this.fiscalPeriods.find(fp => 
      fp.fiscalYearId === currentFiscalYear.id &&
      new Date(fp.startDate) <= currentDate &&
      new Date(fp.endDate) >= currentDate
    );
    
    return Promise.resolve(currentPeriod || null);
  }

  // Close a fiscal period
  async closeFiscalPeriod(id: string): Promise<FiscalPeriod | null> {
    const index = this.fiscalPeriods.findIndex(fp => fp.id === id);
    if (index === -1) return Promise.resolve(null);
    
    // Check if there are any pending transactions in this period
    const pendingTransactions = await this.getTransactionsByFiscalPeriod(id);
    const hasPendingTransactions = pendingTransactions.some(t => 
      t.status === TransactionStatus.DRAFT || 
      t.status === TransactionStatus.PENDING_APPROVAL
    );
    
    if (hasPendingTransactions) {
      throw new Error('Cannot close fiscal period with pending transactions');
    }
    
    this.fiscalPeriods[index] = {
      ...this.fiscalPeriods[index],
      status: FiscalYearStatus.CLOSED,
      updatedAt: new Date()
    };
    
    // Update account balances to set closing balance
    const accountBalances = this.accountBalances.filter(ab => 
      ab.fiscalPeriodId === id
    );
    
    for (const balance of accountBalances) {
      const balanceIndex = this.accountBalances.findIndex(ab => 
        ab.accountId === balance.accountId && 
        ab.fiscalYearId === balance.fiscalYearId && 
        ab.fiscalPeriodId === balance.fiscalPeriodId
      );
      
      if (balanceIndex !== -1) {
        this.accountBalances[balanceIndex] = {
          ...this.accountBalances[balanceIndex],
          closingBalance: this.accountBalances[balanceIndex].currentBalance,
          lastUpdated: new Date()
        };
      }
    }
    
    return Promise.resolve(this.fiscalPeriods[index]);
  }

  // Get account balance
  async getAccountBalance(accountId: string, fiscalYearId: string, fiscalPeriodId: string): Promise<AccountBalance | null> {
    const balance = this.accountBalances.find(ab => 
      ab.accountId === accountId && 
      ab.fiscalYearId === fiscalYearId && 
      ab.fiscalPeriodId === fiscalPeriodId
    );
    
    return Promise.resolve(balance || null);
  }

  // Get account balances for a fiscal period
  async getAccountBalancesByFiscalPeriod(fiscalPeriodId: string): Promise<AccountBalance[]> {
    const balances = this.accountBalances.filter(ab => ab.fiscalPeriodId === fiscalPeriodId);
    return Promise.resolve(balances);
  }

  // Update account balance (internal method)
  private async updateAccountBalance(
    accountId: string, 
    fiscalYearId: string, 
    fiscalPeriodId: string, 
    changeAmount: number
  ): Promise<void> {
    const balanceIndex = this.accountBalances.findIndex(ab => 
      ab.accountId === accountId && 
      ab.fiscalYearId === fiscalYearId && 
      ab.fiscalPeriodId === fiscalPeriodId
    );
    
    if (balanceIndex !== -1) {
      // Update existing balance
      this.accountBalances[balanceIndex] = {
        ...this.accountBalances[balanceIndex],
        currentBalance: this.accountBalances[balanceIndex].currentBalance + changeAmount,
        lastUpdated: new Date()
      };
    } else {
      // Create new balance record
      this.accountBalances.push({
        accountId,
        fiscalYearId,
        fiscalPeriodId,
        openingBalance: 0,
        currentBalance: changeAmount,
        closingBalance: 0,
        lastUpdated: new Date()
      });
    }
  }

  // Get all audit logs
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    return Promise.resolve([...this.auditLogs]);
  }

  // Get audit logs by entity
  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    const logs = this.auditLogs.filter(log => 
      log.entityType === entityType && log.entityId === entityId
    );
    return Promise.resolve(logs);
  }

  // Create a new audit log entry (internal method)
  private createAuditLog(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    details: string,
    ipAddress?: string,
    previousState?: string,
    newState?: string
  ): void {
    const newLog: AuditLogEntry = {
      id: (this.auditLogs.length + 1).toString(),
      action,
      entityType,
      entityId,
      userId,
      timestamp: new Date(),
      details,
      ipAddress,
      previousState,
      newState
    };
    
    this.auditLogs.push(newLog);
  }

  // Check if user has permission for an action (to be integrated with auth system)
  async hasPermission(userId: string, action: string, userRole: UserRole): Promise<boolean> {
    // Example permission check logic - would be integrated with auth system
    switch (action) {
      case 'CREATE_TRANSACTION':
        return userRole === UserRole.ACCOUNTANT || userRole === UserRole.ADMIN;
      case 'APPROVE_TRANSACTION':
        return userRole === UserRole.MANAGER || userRole === UserRole.ADMIN;
      case 'POST_TRANSACTION':
        return userRole === UserRole.ACCOUNTANT || userRole === UserRole.ADMIN;
      case 'VOID_TRANSACTION':
        return userRole === UserRole.ADMIN;
      case 'CLOSE_FISCAL_PERIOD':
        return userRole === UserRole.ACCOUNTANT || userRole === UserRole.ADMIN;
      case 'CLOSE_FISCAL_YEAR':
        return userRole === UserRole.ADMIN;
      default:
        return false;
    }
  }
}

// Create and export singleton instance
export const generalLedgerService = new GeneralLedgerService();