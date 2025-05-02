// src/lib/finance/bank-reconciliation-service.ts
import { 
  BankAccount, 
  BankAccountType, 
  BankAccountStatus,
  BankTransaction,
  BankReconciliation,
  BankStatementAdjustment,
  RecurringTransactionPattern,
  ReconciliationStatus,
  TransactionMatchStatus,
  Transaction,
  TransactionType,
  TransactionStatus,
  FiscalYear,
  FiscalPeriod,
  ChartOfAccount,
  AccountType,
  RecurrenceFrequency,
  ImportResult,
  ImportTarget,
  FileFormat
} from '@/types/finance';
import { generalLedgerService } from './general-ledger-service';
import { chartOfAccountsService } from './chart-of-accounts-service';

// Mock data for development
const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    accountId: '1', // References Cash in Chart of Accounts
    name: 'Operating Checking Account',
    description: 'Primary checking account for operations',
    accountNumber: '****4567',
    routingNumber: '123456789',
    bankName: 'First National Bank',
    type: BankAccountType.CHECKING,
    status: BankAccountStatus.ACTIVE,
    openingBalance: 500000,
    currentBalance: 439750,
    asOfDate: new Date('2024-04-02'),
    lastReconciliationDate: new Date('2024-03-31'),
    lastImportDate: new Date('2024-04-02'),
    defaultCategoryId: '6', // Default to operational expenses
    notes: 'Monthly fees apply if balance falls below $25,000',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-04-02'),
    allowManualReconciliation: true,
    allowAutomaticImport: true,
    isDefault: true
  },
  {
    id: '2',
    accountId: '10', // Another cash account in Chart of Accounts
    name: 'Savings Account',
    description: 'Reserve funds and interest-bearing account',
    accountNumber: '****7890',
    routingNumber: '123456789',
    bankName: 'First National Bank',
    type: BankAccountType.SAVINGS,
    status: BankAccountStatus.ACTIVE,
    openingBalance: 250000,
    currentBalance: 253500,
    asOfDate: new Date('2024-04-01'),
    lastReconciliationDate: new Date('2024-03-31'),
    defaultCategoryId: '5', // Default to income/revenue
    notes: 'Interest deposits on the 15th of each month',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-04-01'),
    allowManualReconciliation: true,
    allowAutomaticImport: false,
    isDefault: false
  }
];

const mockBankTransactions: BankTransaction[] = [
  {
    id: '1',
    bankAccountId: '1',
    transactionId: '1', // References a Transaction in the GL
    date: new Date('2024-01-15'),
    amount: 500000,
    description: 'Initial funding allocation',
    reference: 'TRANSFER',
    type: 'CREDIT',
    matchStatus: TransactionMatchStatus.MATCHED,
    matchedTransactionId: '1',
    matchConfidence: 100,
    importId: 'import-1',
    importedAt: new Date('2024-01-16'),
    statementDate: new Date('2024-01-31'),
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    isRecurring: false
  },
  {
    id: '2',
    bankAccountId: '1',
    transactionId: '2', // References a Transaction in the GL
    date: new Date('2024-02-10'),
    amount: -75000,
    description: 'Tuition credit payment - February',
    reference: 'ACH-234567',
    type: 'DEBIT',
    matchStatus: TransactionMatchStatus.MATCHED,
    matchedTransactionId: '2',
    matchConfidence: 100,
    importId: 'import-2',
    importedAt: new Date('2024-02-11'),
    statementDate: new Date('2024-02-28'),
    createdAt: new Date('2024-02-11'),
    updatedAt: new Date('2024-02-11'),
    isRecurring: true,
    recurringPatternId: '1'
  },
  {
    id: '3',
    bankAccountId: '1',
    transactionId: '3', // References a Transaction in the GL
    date: new Date('2024-03-05'),
    amount: -1250,
    description: 'Office Supplier Inc.',
    reference: 'CHECK-10001',
    checkNumber: '10001',
    type: 'DEBIT',
    matchStatus: TransactionMatchStatus.MATCHED,
    matchedTransactionId: '3',
    matchConfidence: 100,
    importId: 'import-3',
    importedAt: new Date('2024-03-06'),
    statementDate: new Date('2024-03-31'),
    createdAt: new Date('2024-03-06'),
    updatedAt: new Date('2024-03-06'),
    isRecurring: false
  },
  {
    id: '4',
    bankAccountId: '1',
    date: new Date('2024-04-02'),
    amount: 15000,
    description: 'Grant deposit - April allocation',
    reference: 'DEP-123456',
    type: 'CREDIT',
    matchStatus: TransactionMatchStatus.UNMATCHED,
    importId: 'import-4',
    importedAt: new Date('2024-04-03'),
    createdAt: new Date('2024-04-03'),
    updatedAt: new Date('2024-04-03'),
    isRecurring: false
  },
  {
    id: '5',
    bankAccountId: '1',
    date: new Date('2024-04-05'),
    amount: -250,
    description: 'Monthly bank fee',
    reference: 'FEE',
    type: 'DEBIT',
    matchStatus: TransactionMatchStatus.UNMATCHED,
    importId: 'import-4',
    importedAt: new Date('2024-04-05'),
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-04-05'),
    isRecurring: true,
    recurringPatternId: '2'
  }
];

const mockReconciliations: BankReconciliation[] = [
  {
    id: '1',
    bankAccountId: '1',
    name: 'January 2024 Reconciliation',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    startingBalance: 500000,
    endingBalance: 500000,
    statementBalance: 500000,
    adjustedStatementBalance: 500000,
    unreconciled: 0,
    status: ReconciliationStatus.COMPLETED,
    isAutoReconciled: false,
    lastActivity: new Date('2024-02-05'),
    createdById: 'user1',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    completedAt: new Date('2024-02-05'),
    completedById: 'user1',
    notes: 'Initial reconciliation after account setup'
  },
  {
    id: '2',
    bankAccountId: '1',
    name: 'February 2024 Reconciliation',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-29'),
    startingBalance: 500000,
    endingBalance: 425000,
    statementBalance: 425000,
    adjustedStatementBalance: 425000,
    unreconciled: 0,
    status: ReconciliationStatus.COMPLETED,
    isAutoReconciled: true,
    lastActivity: new Date('2024-03-05'),
    createdById: 'user1',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-05'),
    completedAt: new Date('2024-03-05'),
    completedById: 'user1'
  },
  {
    id: '3',
    bankAccountId: '1',
    name: 'March 2024 Reconciliation',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-31'),
    startingBalance: 425000,
    endingBalance: 423750,
    statementBalance: 423750,
    adjustedStatementBalance: 423750,
    unreconciled: 0,
    status: ReconciliationStatus.COMPLETED,
    isAutoReconciled: true,
    lastActivity: new Date('2024-04-03'),
    createdById: 'user1',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-03'),
    completedAt: new Date('2024-04-03'),
    completedById: 'user1'
  },
  {
    id: '4',
    bankAccountId: '1',
    name: 'April 2024 Reconciliation',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-04-30'),
    startingBalance: 423750,
    endingBalance: 0, // Not complete yet
    statementBalance: 0, // Not complete yet
    adjustedStatementBalance: 0, // Not complete yet
    unreconciled: 15250, // Unmatched transactions total
    status: ReconciliationStatus.IN_PROGRESS,
    isAutoReconciled: false,
    lastActivity: new Date('2024-04-05'),
    createdById: 'user1',
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-04-05')
  }
];

const mockStatementAdjustments: BankStatementAdjustment[] = [
  {
    id: '1',
    reconciliationId: '3',
    description: 'Outstanding check #10002',
    amount: 850,
    type: 'SUBTRACT',
    category: 'OUTSTANDING_CHECK',
    date: new Date('2024-03-29'),
    createdById: 'user1',
    createdAt: new Date('2024-04-03'),
    updatedAt: new Date('2024-04-03'),
    notes: 'Check issued but not cashed by end of statement period'
  }
];

const mockRecurringPatterns: RecurringTransactionPattern[] = [
  {
    id: '1',
    bankAccountId: '1',
    description: 'Monthly Tuition Credit Payments',
    matchPattern: 'Tuition credit payment',
    expectedAmount: 75000,
    expectedAmountTolerance: 5000,
    frequency: RecurrenceFrequency.MONTHLY,
    defaultAccountId: '6', // Tuition Credit Expense
    lastSeenAt: new Date('2024-03-10'),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-10'),
    isActive: true,
    notes: 'Monthly payments to providers. Amount varies based on enrollment.'
  },
  {
    id: '2',
    bankAccountId: '1',
    description: 'Monthly Bank Fee',
    matchPattern: 'Monthly bank fee',
    expectedAmount: 250,
    expectedAmountTolerance: 0,
    frequency: RecurrenceFrequency.MONTHLY,
    defaultAccountId: '9', // Bank Fees account
    lastSeenAt: new Date('2024-04-05'),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-04-05'),
    isActive: true,
    notes: 'Standard monthly maintenance fee. Should be constant amount.'
  }
];

// Class definition
class BankReconciliationService {
  private bankAccounts: BankAccount[] = mockBankAccounts;
  private bankTransactions: BankTransaction[] = mockBankTransactions;
  private reconciliations: BankReconciliation[] = mockReconciliations;
  private statementAdjustments: BankStatementAdjustment[] = mockStatementAdjustments;
  private recurringPatterns: RecurringTransactionPattern[] = mockRecurringPatterns;

  // Bank Account Methods
  async getAllBankAccounts(): Promise<BankAccount[]> {
    return [...this.bankAccounts];
  }

  async getBankAccountById(id: string): Promise<BankAccount | null> {
    const account = this.bankAccounts.find(a => a.id === id);
    return account || null;
  }

  async getBankAccountsByType(type: BankAccountType): Promise<BankAccount[]> {
    return this.bankAccounts.filter(a => a.type === type);
  }

  async getBankAccountsByStatus(status: BankAccountStatus): Promise<BankAccount[]> {
    return this.bankAccounts.filter(a => a.status === status);
  }

  async getDefaultBankAccount(): Promise<BankAccount | null> {
    const defaultAccount = this.bankAccounts.find(a => a.isDefault);
    return defaultAccount || null;
  }

  async createBankAccount(accountData: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> {
    // Verify the GL account exists
    const glAccount = await chartOfAccountsService.getAccountById(accountData.accountId);
    if (!glAccount) {
      throw new Error('Referenced GL account does not exist');
    }

    // Make sure the account is a cash/bank account
    if (!glAccount.isCashAccount && !glAccount.isBankAccount) {
      throw new Error('Referenced GL account must be a cash or bank account');
    }

    // Create the bank account
    const newAccount: BankAccount = {
      ...accountData,
      id: (this.bankAccounts.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.bankAccounts.push(newAccount);
    return newAccount;
  }

  async updateBankAccount(id: string, accountData: Partial<BankAccount>): Promise<BankAccount | null> {
    const index = this.bankAccounts.findIndex(a => a.id === id);
    if (index === -1) return null;

    // If this account is being set as default, unset any existing default
    if (accountData.isDefault) {
      const currentDefaultIndex = this.bankAccounts.findIndex(a => a.isDefault);
      if (currentDefaultIndex !== -1 && currentDefaultIndex !== index) {
        this.bankAccounts[currentDefaultIndex] = {
          ...this.bankAccounts[currentDefaultIndex],
          isDefault: false,
          updatedAt: new Date()
        };
      }
    }

    // Update the account
    this.bankAccounts[index] = {
      ...this.bankAccounts[index],
      ...accountData,
      updatedAt: new Date()
    };

    return this.bankAccounts[index];
  }

  // Bank Transaction Methods
  async getAllBankTransactions(): Promise<BankTransaction[]> {
    return [...this.bankTransactions];
  }

  async getBankTransactionById(id: string): Promise<BankTransaction | null> {
    const transaction = this.bankTransactions.find(t => t.id === id);
    return transaction || null;
  }

  async getBankTransactionsByAccount(bankAccountId: string): Promise<BankTransaction[]> {
    return this.bankTransactions.filter(t => t.bankAccountId === bankAccountId);
  }

  async getBankTransactionsByMatchStatus(bankAccountId: string, status: TransactionMatchStatus): Promise<BankTransaction[]> {
    return this.bankTransactions.filter(t => t.bankAccountId === bankAccountId && t.matchStatus === status);
  }

  async getRecentBankTransactions(bankAccountId: string, count: number = 10): Promise<BankTransaction[]> {
    const transactions = this.bankTransactions
      .filter(t => t.bankAccountId === bankAccountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
    
    return transactions;
  }

  async getReconciliationTransactions(reconciliationId: string): Promise<BankTransaction[]> {
    return this.bankTransactions.filter(t => t.reconciliationId === reconciliationId);
  }

  async createBankTransaction(transactionData: Omit<BankTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankTransaction> {
    // Verify the bank account exists
    const bankAccount = await this.getBankAccountById(transactionData.bankAccountId);
    if (!bankAccount) {
      throw new Error('Referenced bank account does not exist');
    }

    // Create the transaction
    const newTransaction: BankTransaction = {
      ...transactionData,
      id: (this.bankTransactions.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.bankTransactions.push(newTransaction);

    // Update the bank account balance
    await this.updateBankAccountBalance(bankAccount.id);

    return newTransaction;
  }

  async updateBankTransaction(id: string, transactionData: Partial<BankTransaction>): Promise<BankTransaction | null> {
    const index = this.bankTransactions.findIndex(t => t.id === id);
    if (index === -1) return null;

    // Update the transaction
    this.bankTransactions[index] = {
      ...this.bankTransactions[index],
      ...transactionData,
      updatedAt: new Date()
    };

    // If the transaction was matched or unmatched, update bank account balance
    if (transactionData.matchStatus) {
      await this.updateBankAccountBalance(this.bankTransactions[index].bankAccountId);
    }

    return this.bankTransactions[index];
  }

  async deleteBankTransaction(id: string): Promise<boolean> {
    const index = this.bankTransactions.findIndex(t => t.id === id);
    if (index === -1) return false;

    // Store the account ID before removing the transaction
    const bankAccountId = this.bankTransactions[index].bankAccountId;

    // Remove the transaction
    this.bankTransactions.splice(index, 1);

    // Update the bank account balance
    await this.updateBankAccountBalance(bankAccountId);

    return true;
  }

  // Reconciliation Methods
  async getAllReconciliations(): Promise<BankReconciliation[]> {
    return [...this.reconciliations];
  }

  async getReconciliationById(id: string): Promise<BankReconciliation | null> {
    const reconciliation = this.reconciliations.find(r => r.id === id);
    return reconciliation || null;
  }

  async getReconciliationsByAccount(bankAccountId: string): Promise<BankReconciliation[]> {
    return this.reconciliations.filter(r => r.bankAccountId === bankAccountId);
  }

  async getReconciliationsByStatus(status: ReconciliationStatus): Promise<BankReconciliation[]> {
    return this.reconciliations.filter(r => r.status === status);
  }

  async getCurrentReconciliation(bankAccountId: string): Promise<BankReconciliation | null> {
    const currentReconciliation = this.reconciliations.find(
      r => r.bankAccountId === bankAccountId && 
      (r.status === ReconciliationStatus.IN_PROGRESS || r.status === ReconciliationStatus.NOT_STARTED)
    );
    
    return currentReconciliation || null;
  }

  async getLastCompletedReconciliation(bankAccountId: string): Promise<BankReconciliation | null> {
    const completedReconciliations = this.reconciliations
      .filter(r => r.bankAccountId === bankAccountId && r.status === ReconciliationStatus.COMPLETED)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
    
    return completedReconciliations.length > 0 ? completedReconciliations[0] : null;
  }

  async createReconciliation(
    reconciliationData: Omit<BankReconciliation, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'unreconciled' | 'adjustedStatementBalance'>
  ): Promise<BankReconciliation> {
    // Verify the bank account exists
    const bankAccount = await this.getBankAccountById(reconciliationData.bankAccountId);
    if (!bankAccount) {
      throw new Error('Referenced bank account does not exist');
    }

    // Check if there's already an in-progress reconciliation
    const currentReconciliation = await this.getCurrentReconciliation(reconciliationData.bankAccountId);
    if (currentReconciliation) {
      throw new Error('An in-progress reconciliation already exists for this account');
    }

    // Calculate unreconciled transactions amount
    const unreconciledTransactions = await this.getBankTransactionsByMatchStatus(
      reconciliationData.bankAccountId,
      TransactionMatchStatus.UNMATCHED
    );
    
    const unreconciledAmount = unreconciledTransactions.reduce((sum, t) => {
      // Convert to absolute value and add based on transaction type
      return t.type === 'CREDIT' ? sum + t.amount : sum - t.amount;
    }, 0);

    // Create the reconciliation
    const newReconciliation: BankReconciliation = {
      ...reconciliationData,
      id: (this.reconciliations.length + 1).toString(),
      adjustedStatementBalance: reconciliationData.statementBalance, // Initial value, will be updated with adjustments
      unreconciled: unreconciledAmount,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reconciliations.push(newReconciliation);
    
    // Update bank transactions with the reconciliation ID
    const transactionPeriod = await this.getBankTransactionsInPeriod(
      reconciliationData.bankAccountId,
      reconciliationData.startDate,
      reconciliationData.endDate
    );
    
    for (const transaction of transactionPeriod) {
      await this.updateBankTransaction(transaction.id, {
        reconciliationId: newReconciliation.id
      });
    }

    return newReconciliation;
  }

  async updateReconciliation(id: string, reconciliationData: Partial<BankReconciliation>): Promise<BankReconciliation | null> {
    const index = this.reconciliations.findIndex(r => r.id === id);
    if (index === -1) return null;

    // Update the reconciliation
    this.reconciliations[index] = {
      ...this.reconciliations[index],
      ...reconciliationData,
      lastActivity: new Date(),
      updatedAt: new Date()
    };

    return this.reconciliations[index];
  }

  async completeReconciliation(id: string, userId: string): Promise<BankReconciliation | null> {
    const index = this.reconciliations.findIndex(r => r.id === id);
    if (index === -1) return null;

    const reconciliation = this.reconciliations[index];
    
    // Check if there are any unmatched transactions
    const unreconciledTransactions = await this.getBankTransactionsByMatchStatus(
      reconciliation.bankAccountId,
      TransactionMatchStatus.UNMATCHED
    );
    
    if (unreconciledTransactions.length > 0 && reconciliation.unreconciled !== 0) {
      throw new Error('Cannot complete reconciliation with unmatched transactions');
    }
    
    // Update the reconciliation status
    this.reconciliations[index] = {
      ...reconciliation,
      status: ReconciliationStatus.COMPLETED,
      completedAt: new Date(),
      completedById: userId,
      lastActivity: new Date(),
      updatedAt: new Date()
    };

    // Update the bank account's last reconciliation date
    const bankAccount = await this.getBankAccountById(reconciliation.bankAccountId);
    if (bankAccount) {
      await this.updateBankAccount(bankAccount.id, {
        lastReconciliationDate: new Date(),
        currentBalance: reconciliation.endingBalance,
        asOfDate: reconciliation.endDate
      });
    }

    return this.reconciliations[index];
  }

  async abandonnReconciliation(id: string): Promise<BankReconciliation | null> {
    const index = this.reconciliations.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    // Update the reconciliation status
    this.reconciliations[index] = {
      ...this.reconciliations[index],
      status: ReconciliationStatus.ABANDONED,
      lastActivity: new Date(),
      updatedAt: new Date()
    };
    
    // Remove reconciliation ID from bank transactions
    const transactionsWithRecId = this.bankTransactions.filter(t => t.reconciliationId === id);
    for (const transaction of transactionsWithRecId) {
      transaction.reconciliationId = undefined;
      transaction.updatedAt = new Date();
    }

    return this.reconciliations[index];
  }

  // Statement Adjustment Methods
  async getStatementAdjustmentsByReconciliation(reconciliationId: string): Promise<BankStatementAdjustment[]> {
    return this.statementAdjustments.filter(a => a.reconciliationId === reconciliationId);
  }

  async createStatementAdjustment(adjustmentData: Omit<BankStatementAdjustment, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankStatementAdjustment> {
    // Verify the reconciliation exists
    const reconciliation = await this.getReconciliationById(adjustmentData.reconciliationId);
    if (!reconciliation) {
      throw new Error('Referenced reconciliation does not exist');
    }

    // Create the adjustment
    const newAdjustment: BankStatementAdjustment = {
      ...adjustmentData,
      id: (this.statementAdjustments.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.statementAdjustments.push(newAdjustment);

    // Update the reconciliation's adjusted statement balance
    const adjustmentAmount = adjustmentData.type === 'ADD' ? adjustmentData.amount : -adjustmentData.amount;
    await this.updateReconciliation(reconciliation.id, {
      adjustedStatementBalance: reconciliation.adjustedStatementBalance + adjustmentAmount
    });

    return newAdjustment;
  }

  async updateStatementAdjustment(id: string, adjustmentData: Partial<BankStatementAdjustment>): Promise<BankStatementAdjustment | null> {
    const index = this.statementAdjustments.findIndex(a => a.id === id);
    if (index === -1) return null;

    const originalAdjustment = this.statementAdjustments[index];
    const reconciliation = await this.getReconciliationById(originalAdjustment.reconciliationId);
    if (!reconciliation) return null;

    // Calculate the change in adjustment amount if applicable
    let adjustmentDifference = 0;
    if (adjustmentData.amount !== undefined || adjustmentData.type !== undefined) {
      const oldAdjustmentAmount = originalAdjustment.type === 'ADD' ? 
        originalAdjustment.amount : -originalAdjustment.amount;
      
      const newAmount = adjustmentData.amount !== undefined ? 
        adjustmentData.amount : originalAdjustment.amount;
      
      const newType = adjustmentData.type !== undefined ? 
        adjustmentData.type : originalAdjustment.type;
      
      const newAdjustmentAmount = newType === 'ADD' ? newAmount : -newAmount;
      adjustmentDifference = newAdjustmentAmount - oldAdjustmentAmount;
    }

    // Update the adjustment
    this.statementAdjustments[index] = {
      ...originalAdjustment,
      ...adjustmentData,
      updatedAt: new Date()
    };

    // If the amount or type changed, update the reconciliation's adjusted statement balance
    if (adjustmentDifference !== 0) {
      await this.updateReconciliation(reconciliation.id, {
        adjustedStatementBalance: reconciliation.adjustedStatementBalance + adjustmentDifference
      });
    }

    return this.statementAdjustments[index];
  }

  async deleteStatementAdjustment(id: string): Promise<boolean> {
    const index = this.statementAdjustments.findIndex(a => a.id === id);
    if (index === -1) return false;

    const adjustment = this.statementAdjustments[index];
    const reconciliation = await this.getReconciliationById(adjustment.reconciliationId);
    if (!reconciliation) return false;

    // Calculate the adjustment amount to remove
    const adjustmentAmount = adjustment.type === 'ADD' ? adjustment.amount : -adjustment.amount;

    // Remove the adjustment
    this.statementAdjustments.splice(index, 1);

    // Update the reconciliation's adjusted statement balance
    await this.updateReconciliation(reconciliation.id, {
      adjustedStatementBalance: reconciliation.adjustedStatementBalance - adjustmentAmount
    });

    return true;
  }

  // Recurring Pattern Methods
  async getAllRecurringPatterns(): Promise<RecurringTransactionPattern[]> {
    return [...this.recurringPatterns];
  }

  async getRecurringPatternById(id: string): Promise<RecurringTransactionPattern | null> {
    const pattern = this.recurringPatterns.find(p => p.id === id);
    return pattern || null;
  }

  async getRecurringPatternsByAccount(bankAccountId: string): Promise<RecurringTransactionPattern[]> {
    return this.recurringPatterns.filter(p => p.bankAccountId === bankAccountId);
  }

  async createRecurringPattern(patternData: Omit<RecurringTransactionPattern, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringTransactionPattern> {
    // Verify the bank account exists
    const bankAccount = await this.getBankAccountById(patternData.bankAccountId);
    if (!bankAccount) {
      throw new Error('Referenced bank account does not exist');
    }

    // Create the pattern
    const newPattern: RecurringTransactionPattern = {
      ...patternData,
      id: (this.recurringPatterns.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.recurringPatterns.push(newPattern);
    return newPattern;
  }

  async updateRecurringPattern(id: string, patternData: Partial<RecurringTransactionPattern>): Promise<RecurringTransactionPattern | null> {
    const index = this.recurringPatterns.findIndex(p => p.id === id);
    if (index === -1) return null;

    // Update the pattern
    this.recurringPatterns[index] = {
      ...this.recurringPatterns[index],
      ...patternData,
      updatedAt: new Date()
    };

    return this.recurringPatterns[index];
  }

  async deleteRecurringPattern(id: string): Promise<boolean> {
    const index = this.recurringPatterns.findIndex(p => p.id === id);
    if (index === -1) return false;

    // Remove the pattern
    this.recurringPatterns.splice(index, 1);
    return true;
  }

  // Transaction Matching Methods
  async matchTransactions(bankAccountId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    threshold?: number; // Match confidence threshold (0-100)
  }): Promise<{
    totalTransactions: number;
    matchedTransactions: number;
    potentialMatches: number;
    unmatchedTransactions: number;
  }> {
    // Get all unmatched bank transactions for the account and date range
    const transactions = await this.getBankTransactionsInPeriod(
      bankAccountId,
      options?.startDate,
      options?.endDate,
      TransactionMatchStatus.UNMATCHED
    );

    // Get all general ledger transactions for the account
    const bankAccount = await this.getBankAccountById(bankAccountId);
    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    const glTransactions = await generalLedgerService.getTransactionsByAccount(bankAccount.accountId);

    // Define matching thresholds
    const threshold = options?.threshold || 80; // Default to 80% confidence
    let matchedCount = 0;
    let potentialMatchCount = 0;

    // Match transactions based on amount, date, and description similarity
    for (const bankTx of transactions) {
      // Skip transactions that are already matched
      if (bankTx.matchStatus !== TransactionMatchStatus.UNMATCHED) continue;

      // Find potential matches in GL transactions
      const potentialMatches = glTransactions.filter(glTx => {
        // Match by amount (convert bank transaction amount to a positive value for comparison)
        const bankAmount = Math.abs(bankTx.amount);
        const glAmount = glTx.amount;
        
        // Find the corresponding entry that affects the bank account
        const relevantEntry = glTx.entries.find(entry => entry.accountId === bankAccount.accountId);
        if (!relevantEntry) return false;
        
        // Compare based on debit or credit
        let amountMatches = false;
        if (bankTx.type === 'CREDIT' && relevantEntry.creditAmount === 0) {
          amountMatches = relevantEntry.debitAmount === bankAmount;
        } else if (bankTx.type === 'DEBIT' && relevantEntry.debitAmount === 0) {
          amountMatches = relevantEntry.creditAmount === bankAmount;
        }
        
        if (!amountMatches) return false;
        
        // Match by date (within 3 days)
        const bankDate = new Date(bankTx.date).getTime();
        const glDate = new Date(glTx.date).getTime();
        const dayDifference = Math.abs(bankDate - glDate) / (1000 * 60 * 60 * 24);
        if (dayDifference > 3) return false;
        
        // Match by reference or check number if available
        if (bankTx.reference && glTx.reference) {
          return bankTx.reference.includes(glTx.reference) || glTx.reference.includes(bankTx.reference);
        }
        
        return true;
      });

      if (potentialMatches.length === 1) {
        // Single match with high confidence
        await this.updateBankTransaction(bankTx.id, {
          matchStatus: TransactionMatchStatus.MATCHED,
          matchedTransactionId: potentialMatches[0].id,
          transactionId: potentialMatches[0].id,
          matchConfidence: 100,
          updatedAt: new Date()
        });
        matchedCount++;
      } else if (potentialMatches.length > 1) {
        // Multiple potential matches, set for review
        await this.updateBankTransaction(bankTx.id, {
          matchStatus: TransactionMatchStatus.NEEDS_REVIEW,
          matchConfidence: 70,
          updatedAt: new Date()
        });
        potentialMatchCount++;
      }
    }

    // Recalculate unreconciled amount for any in-progress reconciliations
    const currentReconciliation = await this.getCurrentReconciliation(bankAccountId);
    if (currentReconciliation) {
      await this.updateUnreconciledAmount(currentReconciliation.id);
    }

    // Return the matching results
    return {
      totalTransactions: transactions.length,
      matchedTransactions: matchedCount,
      potentialMatches: potentialMatchCount,
      unmatchedTransactions: transactions.length - matchedCount - potentialMatchCount
    };
  }

  async manuallyMatchTransaction(
    bankTransactionId: string,
    glTransactionId: string
  ): Promise<BankTransaction | null> {
    // Get the bank transaction
    const bankTransaction = await this.getBankTransactionById(bankTransactionId);
    if (!bankTransaction) {
      throw new Error('Bank transaction not found');
    }

    // Get the GL transaction
    const glTransaction = await generalLedgerService.getTransactionById(glTransactionId);
    if (!glTransaction) {
      throw new Error('GL transaction not found');
    }

    // Update the bank transaction with the match
    const updatedTransaction = await this.updateBankTransaction(bankTransactionId, {
      matchStatus: TransactionMatchStatus.MANUALLY_MATCHED,
      matchedTransactionId: glTransactionId,
      transactionId: glTransactionId,
      updatedAt: new Date()
    });

    // Recalculate unreconciled amount for any in-progress reconciliations
    if (bankTransaction.reconciliationId) {
      await this.updateUnreconciledAmount(bankTransaction.reconciliationId);
    }

    return updatedTransaction;
  }

  async excludeTransaction(
    bankTransactionId: string,
    reason?: string
  ): Promise<BankTransaction | null> {
    // Get the bank transaction
    const bankTransaction = await this.getBankTransactionById(bankTransactionId);
    if (!bankTransaction) {
      throw new Error('Bank transaction not found');
    }

    // Update the bank transaction to excluded status
    const updatedTransaction = await this.updateBankTransaction(bankTransactionId, {
      matchStatus: TransactionMatchStatus.EXCLUDED,
      notes: reason ? `${bankTransaction.notes || ''}\nExcluded: ${reason}`.trim() : bankTransaction.notes,
      updatedAt: new Date()
    });

    // Recalculate unreconciled amount for any in-progress reconciliations
    if (bankTransaction.reconciliationId) {
      await this.updateUnreconciledAmount(bankTransaction.reconciliationId);
    }

    return updatedTransaction;
  }

  async resetTransactionMatch(bankTransactionId: string): Promise<BankTransaction | null> {
    // Get the bank transaction
    const bankTransaction = await this.getBankTransactionById(bankTransactionId);
    if (!bankTransaction) {
      throw new Error('Bank transaction not found');
    }

    // Update the bank transaction to unmatched status
    const updatedTransaction = await this.updateBankTransaction(bankTransactionId, {
      matchStatus: TransactionMatchStatus.UNMATCHED,
      matchedTransactionId: undefined,
      transactionId: undefined,
      matchConfidence: undefined,
      updatedAt: new Date()
    });

    // Recalculate unreconciled amount for any in-progress reconciliations
    if (bankTransaction.reconciliationId) {
      await this.updateUnreconciledAmount(bankTransaction.reconciliationId);
    }

    return updatedTransaction;
  }

  // Transaction Import Methods
  async importBankTransactions(
    file: File,
    bankAccountId: string,
    format: FileFormat,
    options?: {
      dateFormat?: string;
      allowDuplicates?: boolean;
      defaultCategoryId?: string;
    }
  ): Promise<ImportResult> {
    // Verify the bank account exists
    const bankAccount = await this.getBankAccountById(bankAccountId);
    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    // In a real implementation, this would parse the file format (CSV, OFX, QFX, etc.)
    // and import the transactions. For this mock implementation, we'll generate
    // some sample data.

    // Mock import result
    const importResult: ImportResult = {
      success: true,
      target: ImportTarget.BANK_TRANSACTIONS,
      totalRows: 5,
      processedRows: 5,
      createdCount: 5,
      updatedCount: 0,
      skippedCount: 0,
      errors: [],
      warnings: [],
      importId: `import-${Date.now()}`,
      importedAt: new Date(),
      importedById: 'user1'
    };

    // Update the bank account with the latest import date
    await this.updateBankAccount(bankAccountId, {
      lastImportDate: new Date()
    });

    // Generate some new transactions for the account
    for (let i = 0; i < 5; i++) {
      const isCredit = Math.random() > 0.5;
      const amount = isCredit ? Math.random() * 1000 + 100 : -(Math.random() * 1000 + 100);
      const roundedAmount = Math.round(amount * 100) / 100;
      
      const newTransaction: Omit<BankTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
        bankAccountId,
        date: new Date(),
        amount: roundedAmount,
        description: isCredit ? 'Imported deposit' : 'Imported payment',
        reference: isCredit ? `DEP-${Math.floor(Math.random() * 10000)}` : `PAY-${Math.floor(Math.random() * 10000)}`,
        type: isCredit ? 'CREDIT' : 'DEBIT',
        matchStatus: TransactionMatchStatus.UNMATCHED,
        importId: importResult.importId,
        importedAt: importResult.importedAt
      };
      
      await this.createBankTransaction(newTransaction);
    }

    // Match the imported transactions
    await this.matchTransactions(bankAccountId);

    // Recalculate unreconciled amount for any in-progress reconciliations
    const currentReconciliation = await this.getCurrentReconciliation(bankAccountId);
    if (currentReconciliation) {
      await this.updateUnreconciledAmount(currentReconciliation.id);
    }

    return importResult;
  }

  // Reconciliation Reports
  async getReconciliationSummary(reconciliationId: string): Promise<{
    reconciliation: BankReconciliation | null;
    bankAccount: BankAccount | null;
    transactions: {
      matched: number;
      unmatched: number;
      excluded: number;
      needsReview: number;
      total: number;
    };
    adjustments: {
      count: number;
      totalAmount: number;
    };
    balance: {
      startingBalance: number;
      endingBalance: number;
      statementBalance: number;
      adjustedBalance: number;
      unreconciledAmount: number;
      isBalanced: boolean;
    };
  }> {
    const reconciliation = await this.getReconciliationById(reconciliationId);
    if (!reconciliation) {
      return {
        reconciliation: null,
        bankAccount: null,
        transactions: { matched: 0, unmatched: 0, excluded: 0, needsReview: 0, total: 0 },
        adjustments: { count: 0, totalAmount: 0 },
        balance: { 
          startingBalance: 0, 
          endingBalance: 0, 
          statementBalance: 0, 
          adjustedBalance: 0, 
          unreconciledAmount: 0,
          isBalanced: false
        }
      };
    }

    const bankAccount = await this.getBankAccountById(reconciliation.bankAccountId);
    const transactions = await this.getReconciliationTransactions(reconciliationId);
    const adjustments = await this.getStatementAdjustmentsByReconciliation(reconciliationId);

    // Calculate transaction counts by status
    const matchedCount = transactions.filter(t => 
      t.matchStatus === TransactionMatchStatus.MATCHED || 
      t.matchStatus === TransactionMatchStatus.MANUALLY_MATCHED
    ).length;
    
    const unmatchedCount = transactions.filter(t => 
      t.matchStatus === TransactionMatchStatus.UNMATCHED
    ).length;
    
    const excludedCount = transactions.filter(t => 
      t.matchStatus === TransactionMatchStatus.EXCLUDED
    ).length;
    
    const needsReviewCount = transactions.filter(t => 
      t.matchStatus === TransactionMatchStatus.NEEDS_REVIEW
    ).length;

    // Calculate adjustments total
    const adjustmentsTotal = adjustments.reduce((total, adjustment) => {
      return adjustment.type === 'ADD' ? 
        total + adjustment.amount : 
        total - adjustment.amount;
    }, 0);

    // Calculate if reconciliation is balanced
    const isBalanced = reconciliation.adjustedStatementBalance === reconciliation.endingBalance;

    return {
      reconciliation,
      bankAccount,
      transactions: {
        matched: matchedCount,
        unmatched: unmatchedCount,
        excluded: excludedCount,
        needsReview: needsReviewCount,
        total: transactions.length
      },
      adjustments: {
        count: adjustments.length,
        totalAmount: adjustmentsTotal
      },
      balance: {
        startingBalance: reconciliation.startingBalance,
        endingBalance: reconciliation.endingBalance,
        statementBalance: reconciliation.statementBalance,
        adjustedBalance: reconciliation.adjustedStatementBalance,
        unreconciledAmount: reconciliation.unreconciled,
        isBalanced
      }
    };
  }

  async getBankAccountSummary(bankAccountId: string): Promise<{
    bankAccount: BankAccount | null;
    lastReconciliation: BankReconciliation | null;
    currentReconciliation: BankReconciliation | null;
    recentTransactions: BankTransaction[];
    transactionCounts: {
      matched: number;
      unmatched: number;
      total: number;
    };
    unreconciledPeriod: {
      startDate: Date | null;
      endDate: Date | null;
      dayCount: number;
    };
  }> {
    const bankAccount = await this.getBankAccountById(bankAccountId);
    if (!bankAccount) {
      return {
        bankAccount: null,
        lastReconciliation: null,
        currentReconciliation: null,
        recentTransactions: [],
        transactionCounts: { matched: 0, unmatched: 0, total: 0 },
        unreconciledPeriod: { startDate: null, endDate: null, dayCount: 0 }
      };
    }

    const lastReconciliation = await this.getLastCompletedReconciliation(bankAccountId);
    const currentReconciliation = await this.getCurrentReconciliation(bankAccountId);
    const recentTransactions = await this.getRecentBankTransactions(bankAccountId, 5);
    
    // Get transaction counts
    const allTransactions = await this.getBankTransactionsByAccount(bankAccountId);
    const matchedCount = allTransactions.filter(t => 
      t.matchStatus === TransactionMatchStatus.MATCHED || 
      t.matchStatus === TransactionMatchStatus.MANUALLY_MATCHED
    ).length;
    
    const unmatchedCount = allTransactions.filter(t => 
      t.matchStatus === TransactionMatchStatus.UNMATCHED
    ).length;

    // Calculate unreconciled period
    let startDate = null;
    if (lastReconciliation) {
      // Day after last reconciliation end date
      startDate = new Date(lastReconciliation.endDate);
      startDate.setDate(startDate.getDate() + 1);
    }
    
    const endDate = new Date(); // Current date
    const dayCount = startDate ? 
      Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 
      0;

    return {
      bankAccount,
      lastReconciliation,
      currentReconciliation,
      recentTransactions,
      transactionCounts: {
        matched: matchedCount,
        unmatched: unmatchedCount,
        total: allTransactions.length
      },
      unreconciledPeriod: {
        startDate,
        endDate,
        dayCount
      }
    };
  }

  // Helper methods
  private async getBankTransactionsInPeriod(
    bankAccountId: string,
    startDate?: Date,
    endDate?: Date,
    matchStatus?: TransactionMatchStatus
  ): Promise<BankTransaction[]> {
    let transactions = this.bankTransactions.filter(t => t.bankAccountId === bankAccountId);
    
    if (startDate) {
      transactions = transactions.filter(t => new Date(t.date) >= new Date(startDate));
    }
    
    if (endDate) {
      transactions = transactions.filter(t => new Date(t.date) <= new Date(endDate));
    }
    
    if (matchStatus) {
      transactions = transactions.filter(t => t.matchStatus === matchStatus);
    }
    
    return transactions;
  }

  private async updateBankAccountBalance(bankAccountId: string): Promise<void> {
    const bankAccount = await this.getBankAccountById(bankAccountId);
    if (!bankAccount) return;

    // Calculate new balance based on matched transactions
    const matchedTransactions = await this.getBankTransactionsByAccount(bankAccountId);
    
    let balance = bankAccount.openingBalance;
    for (const transaction of matchedTransactions) {
      if (transaction.matchStatus !== TransactionMatchStatus.EXCLUDED) {
        balance += transaction.amount;
      }
    }

    // Update the bank account
    await this.updateBankAccount(bankAccountId, {
      currentBalance: balance,
      asOfDate: new Date()
    });
  }

  private async updateUnreconciledAmount(reconciliationId: string): Promise<void> {
    const reconciliation = await this.getReconciliationById(reconciliationId);
    if (!reconciliation) return;

    // Get all unmatched transactions for this reconciliation
    const transactions = await this.getReconciliationTransactions(reconciliationId);
    const unmatchedTransactions = transactions.filter(t => 
      t.matchStatus === TransactionMatchStatus.UNMATCHED || 
      t.matchStatus === TransactionMatchStatus.NEEDS_REVIEW
    );
    
    let unreconciledAmount = 0;
    for (const transaction of unmatchedTransactions) {
      unreconciledAmount += transaction.amount;
    }

    // Update the reconciliation
    await this.updateReconciliation(reconciliationId, {
      unreconciled: unreconciledAmount
    });
  }
}

// Export singleton instance
export const bankReconciliationService = new BankReconciliationService();