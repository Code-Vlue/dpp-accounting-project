// src/lib/finance/finance-service.ts
import { chartOfAccountsService } from './chart-of-accounts-service';
import { generalLedgerService } from './general-ledger-service';
import { accountsPayableService } from './accounts-payable-service';
import { accountsReceivableService } from './accounts-receivable-service';
import { budgetService } from './budget-service';
import { fundAccountingService } from './fund-accounting-service';
import { tuitionCreditService } from './tuition-credit-service';
import { dataImportExportService } from './data-import-export-service';
import { bankReconciliationService } from './bank-reconciliation-service';
import { 
  AccountType, 
  AccountSubType, 
  ChartOfAccount, 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
  FiscalYear, 
  FiscalPeriod,
  AccountBalance,
  FundType,
  Fund,
  FinancialReportConfig,
  Vendor,
  VendorType,
  Bill,
  RecurringBill,
  Payment,
  PaymentMethod,
  PaymentStatus,
  TaxDocument,
  Customer,
  CustomerType,
  Invoice,
  InvoiceStatus,
  RecurringInvoice,
  ReceivablePayment,
  Receipt,
  RevenueCategory,
  Budget,
  BudgetItem,
  BudgetStatus,
  BudgetType,
  BudgetPeriodType,
  BudgetRevision,
  BudgetTemplate,
  BudgetVarianceReport,
  Department,
  Program,
  Project,
  Provider,
  ProviderType,
  ProviderStatus,
  ProviderQualityRating,
  TuitionCredit,
  TuitionCreditStatus,
  TuitionCreditBatch,
  ProviderPayment,
  ProviderPaymentBatch,
  PaymentPriority,
  ImportResult,
  ExportResult,
  ImportConfig,
  ExportConfig,
  ImportTarget,
  ExportTarget,
  ImportValidationResult,
  DataMapping,
  BankAccount,
  BankAccountType,
  BankAccountStatus,
  BankTransaction,
  BankReconciliation,
  BankStatementAdjustment,
  RecurringTransactionPattern,
  ReconciliationStatus,
  TransactionMatchStatus,
  FileFormat
} from '@/types/finance';

// Combined finance service that integrates chart of accounts and general ledger
class FinanceService {
  // Chart of Accounts methods
  async getAllAccounts(): Promise<ChartOfAccount[]> {
    return chartOfAccountsService.getAllAccounts();
  }

  async getAccountsByType(type: AccountType): Promise<ChartOfAccount[]> {
    return chartOfAccountsService.getAccountsByType(type);
  }

  async getAccountById(id: string): Promise<ChartOfAccount | null> {
    return chartOfAccountsService.getAccountById(id);
  }

  async createAccount(account: Omit<ChartOfAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChartOfAccount> {
    return chartOfAccountsService.createAccount(account);
  }

  async updateAccount(id: string, accountData: Partial<ChartOfAccount>): Promise<ChartOfAccount | null> {
    return chartOfAccountsService.updateAccount(id, accountData);
  }

  async getAllFunds(): Promise<Fund[]> {
    return fundAccountingService.getAllFunds();
  }

  async getFundById(id: string): Promise<Fund | null> {
    return fundAccountingService.getFundById(id);
  }
  
  async getFundsByType(type: FundType): Promise<Fund[]> {
    return fundAccountingService.getFundsByType(type);
  }
  
  async createFund(fund: Omit<Fund, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fund> {
    return fundAccountingService.createFund(fund);
  }
  
  async updateFund(id: string, fundData: Partial<Fund>): Promise<Fund | null> {
    return fundAccountingService.updateFund(id, fundData);
  }
  
  // Fund Accounting methods
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
    return fundAccountingService.createFundTransfer(
      sourceId,
      destinationId,
      amount,
      description,
      date,
      userId,
      fiscalYearId,
      fiscalPeriodId
    );
  }
  
  async getFundTransfers(fundId?: string): Promise<Transaction[]> {
    return fundAccountingService.getFundTransfers(fundId);
  }
  
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
    return fundAccountingService.createFundAllocation(
      entries,
      description,
      date,
      userId,
      fiscalYearId,
      fiscalPeriodId
    );
  }
  
  async getFundAllocations(fundId?: string): Promise<Transaction[]> {
    return fundAccountingService.getFundAllocations(fundId);
  }
  
  async getFundBalance(fundId: string): Promise<number> {
    return fundAccountingService.getFundBalance(fundId);
  }
  
  async getFundBalanceByPeriod(fundId: string, fiscalPeriodId: string): Promise<number> {
    return fundAccountingService.getFundBalanceByPeriod(fundId, fiscalPeriodId);
  }
  
  async getFundBalanceSheets(fiscalPeriodId?: string): Promise<{
    fundId: string;
    fundName: string;
    fundType: FundType;
    assets: number;
    liabilities: number;
    fundBalance: number;
  }[]> {
    return fundAccountingService.getFundBalanceSheets(fiscalPeriodId);
  }
  
  async getFundActivityReport(fundId: string, startDate: Date, endDate: Date): Promise<{
    fundDetails: Fund | null;
    beginningBalance: number;
    totalInflows: number;
    totalOutflows: number;
    endingBalance: number;
    transactions: Transaction[];
  }> {
    return fundAccountingService.getFundActivityReport(fundId, startDate, endDate);
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
    return fundAccountingService.getFundRestrictionReport();
  }
  
  async reconcileFund(fundId: string, asOfDate: Date): Promise<{
    fundId: string;
    asOfDate: Date;
    generalLedgerBalance: number;
    calculatedBalance: number;
    isReconciled: boolean;
    discrepancy: number;
  }> {
    return fundAccountingService.reconcileFund(fundId, asOfDate);
  }

  // General Ledger methods
  async getAllTransactions(): Promise<Transaction[]> {
    return generalLedgerService.getAllTransactions();
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    return generalLedgerService.getTransactionById(id);
  }

  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    return generalLedgerService.getTransactionsByAccount(accountId);
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    return generalLedgerService.createTransaction(transaction);
  }

  async approveTransaction(id: string, approverId: string): Promise<Transaction | null> {
    return generalLedgerService.approveTransaction(id, approverId);
  }

  async postTransaction(id: string): Promise<Transaction | null> {
    return generalLedgerService.postTransaction(id);
  }

  async getAllFiscalYears(): Promise<FiscalYear[]> {
    return generalLedgerService.getAllFiscalYears();
  }

  async getCurrentFiscalYear(): Promise<FiscalYear | null> {
    return generalLedgerService.getCurrentFiscalYear();
  }

  async getCurrentFiscalPeriod(): Promise<FiscalPeriod | null> {
    return generalLedgerService.getCurrentFiscalPeriod();
  }

  async getAccountBalance(accountId: string, fiscalYearId: string, fiscalPeriodId: string): Promise<AccountBalance | null> {
    return generalLedgerService.getAccountBalance(accountId, fiscalYearId, fiscalPeriodId);
  }

  // Integrated methods
  async getAccountWithTransactions(accountId: string): Promise<{ account: ChartOfAccount | null, transactions: Transaction[] }> {
    const [account, transactions] = await Promise.all([
      this.getAccountById(accountId),
      this.getTransactionsByAccount(accountId)
    ]);
    
    return { account, transactions };
  }

  async getAccountBalanceSummary(accountId: string): Promise<{
    account: ChartOfAccount | null,
    currentBalance: number,
    recentTransactions: Transaction[]
  }> {
    const account = await this.getAccountById(accountId);
    if (!account) {
      return { account: null, currentBalance: 0, recentTransactions: [] };
    }

    const currentFiscalPeriod = await this.getCurrentFiscalPeriod();
    if (!currentFiscalPeriod) {
      return { account, currentBalance: 0, recentTransactions: [] };
    }

    const balance = await this.getAccountBalance(
      accountId, 
      currentFiscalPeriod.fiscalYearId, 
      currentFiscalPeriod.id
    );

    const transactions = await this.getTransactionsByAccount(accountId);
    const recentTransactions = transactions
      .filter(t => t.status === TransactionStatus.POSTED)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      account,
      currentBalance: balance?.currentBalance || 0,
      recentTransactions
    };
  }

  async getTrialBalance(fiscalPeriodId: string): Promise<{
    accountId: string,
    accountNumber: string,
    accountName: string,
    type: AccountType,
    debitBalance: number,
    creditBalance: number
  }[]> {
    const [accounts, balances] = await Promise.all([
      this.getAllAccounts(),
      generalLedgerService.getAccountBalancesByFiscalPeriod(fiscalPeriodId)
    ]);

    const trialBalance = accounts.map(account => {
      const balance = balances.find(b => b.accountId === account.id);
      const currentBalance = balance?.currentBalance || 0;
      
      let debitBalance = 0;
      let creditBalance = 0;
      
      // For asset and expense accounts, positive balances are debits
      if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
        debitBalance = currentBalance > 0 ? currentBalance : 0;
        creditBalance = currentBalance < 0 ? Math.abs(currentBalance) : 0;
      } else {
        // For liability, equity and revenue accounts, positive balances are credits
        debitBalance = currentBalance < 0 ? Math.abs(currentBalance) : 0;
        creditBalance = currentBalance > 0 ? currentBalance : 0;
      }
      
      return {
        accountId: account.id,
        accountNumber: account.accountNumber,
        accountName: account.name,
        type: account.type,
        debitBalance,
        creditBalance
      };
    });

    return trialBalance;
  }

  async getIncomeStatement(fiscalYearId: string, fiscalPeriodId?: string): Promise<{
    revenues: { subtype: AccountSubType, amount: number }[],
    expenses: { subtype: AccountSubType, amount: number }[],
    totalRevenue: number,
    totalExpenses: number,
    netIncome: number
  }> {
    const accounts = await this.getAllAccounts();
    
    // Get balances for the relevant period
    const balances = fiscalPeriodId
      ? await generalLedgerService.getAccountBalancesByFiscalPeriod(fiscalPeriodId)
      : await this.getYearToDateBalances(fiscalYearId);
    
    // Calculate revenue subtotals by subtype
    const revenueAccounts = accounts.filter(a => a.type === AccountType.REVENUE);
    const revenueSubtypes = [...new Set(revenueAccounts.map(a => a.subType))];
    
    const revenues = revenueSubtypes.map(subtype => {
      const accountIds = revenueAccounts
        .filter(a => a.subType === subtype)
        .map(a => a.id);
      
      const amount = balances
        .filter(b => accountIds.includes(b.accountId))
        .reduce((sum, balance) => sum + balance.currentBalance, 0);
      
      return { subtype, amount };
    });
    
    // Calculate expense subtotals by subtype
    const expenseAccounts = accounts.filter(a => a.type === AccountType.EXPENSE);
    const expenseSubtypes = [...new Set(expenseAccounts.map(a => a.subType))];
    
    const expenses = expenseSubtypes.map(subtype => {
      const accountIds = expenseAccounts
        .filter(a => a.subType === subtype)
        .map(a => a.id);
      
      const amount = balances
        .filter(b => accountIds.includes(b.accountId))
        .reduce((sum, balance) => sum + balance.currentBalance, 0);
      
      return { subtype, amount };
    });
    
    const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    
    return { revenues, expenses, totalRevenue, totalExpenses, netIncome };
  }

  async getBalanceSheet(fiscalYearId: string, fiscalPeriodId?: string): Promise<{
    assets: { subtype: AccountSubType, amount: number }[],
    liabilities: { subtype: AccountSubType, amount: number }[],
    equity: { subtype: AccountSubType, amount: number }[],
    totalAssets: number,
    totalLiabilities: number,
    totalEquity: number
  }> {
    const accounts = await this.getAllAccounts();
    
    // Get balances for the relevant period
    const balances = fiscalPeriodId
      ? await generalLedgerService.getAccountBalancesByFiscalPeriod(fiscalPeriodId)
      : await this.getYearToDateBalances(fiscalYearId);
    
    // Calculate asset subtotals by subtype
    const assetAccounts = accounts.filter(a => a.type === AccountType.ASSET);
    const assetSubtypes = [...new Set(assetAccounts.map(a => a.subType))];
    
    const assets = assetSubtypes.map(subtype => {
      const accountIds = assetAccounts
        .filter(a => a.subType === subtype)
        .map(a => a.id);
      
      const amount = balances
        .filter(b => accountIds.includes(b.accountId))
        .reduce((sum, balance) => sum + balance.currentBalance, 0);
      
      return { subtype, amount };
    });
    
    // Calculate liability subtotals by subtype
    const liabilityAccounts = accounts.filter(a => a.type === AccountType.LIABILITY);
    const liabilitySubtypes = [...new Set(liabilityAccounts.map(a => a.subType))];
    
    const liabilities = liabilitySubtypes.map(subtype => {
      const accountIds = liabilityAccounts
        .filter(a => a.subType === subtype)
        .map(a => a.id);
      
      const amount = balances
        .filter(b => accountIds.includes(b.accountId))
        .reduce((sum, balance) => sum + balance.currentBalance, 0);
      
      return { subtype, amount };
    });
    
    // Calculate equity subtotals by subtype
    const equityAccounts = accounts.filter(a => a.type === AccountType.EQUITY);
    const equitySubtypes = [...new Set(equityAccounts.map(a => a.subType))];
    
    const equity = equitySubtypes.map(subtype => {
      const accountIds = equityAccounts
        .filter(a => a.subType === subtype)
        .map(a => a.id);
      
      const amount = balances
        .filter(b => accountIds.includes(b.accountId))
        .reduce((sum, balance) => sum + balance.currentBalance, 0);
      
      return { subtype, amount };
    });
    
    const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
    const totalEquity = equity.reduce((sum, equity) => sum + equity.amount, 0);
    
    return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity };
  }

  // Helper method to aggregate year-to-date balances
  private async getYearToDateBalances(fiscalYearId: string): Promise<AccountBalance[]> {
    const periods = await generalLedgerService.getFiscalPeriodsByFiscalYear(fiscalYearId);
    const allBalances: AccountBalance[] = [];
    
    // Fetch balances for all periods
    for (const period of periods) {
      const periodBalances = await generalLedgerService.getAccountBalancesByFiscalPeriod(period.id);
      allBalances.push(...periodBalances);
    }
    
    // Aggregate balances by account
    const accountMap = new Map<string, AccountBalance>();
    
    for (const balance of allBalances) {
      if (!accountMap.has(balance.accountId)) {
        accountMap.set(balance.accountId, {
          ...balance,
          currentBalance: balance.currentBalance
        });
      } else {
        const existingBalance = accountMap.get(balance.accountId)!;
        accountMap.set(balance.accountId, {
          ...existingBalance,
          currentBalance: existingBalance.currentBalance + balance.currentBalance
        });
      }
    }
    
    return Array.from(accountMap.values());
  }

  // Financial Reports Methods
  async getStatementOfFunctionalExpenses(fiscalYearId: string, fiscalPeriodId?: string): Promise<{
    categories: string[];
    programServices: number[];
    administrativeExpenses: number[];
    fundraisingExpenses: number[];
    totalProgram: number;
    totalAdministrative: number;
    totalFundraising: number;
    grandTotal: number;
  }> {
    const accounts = await this.getAllAccounts();
    
    // Get balances for the relevant period
    const balances = fiscalPeriodId
      ? await generalLedgerService.getAccountBalancesByFiscalPeriod(fiscalPeriodId)
      : await this.getYearToDateBalances(fiscalYearId);

    // Define expense categories
    const categories = [
      'Salaries and benefits',
      'Professional services',
      'Office expenses',
      'Travel and meetings',
      'Technology',
      'Tuition credits',
      'Provider support',
      'Marketing',
      'Other expenses'
    ];
    
    // Create sample data for now - in a real implementation this would be derived from actual account data
    const programServices = categories.map(() => Math.floor(Math.random() * 200000) + 100000);
    const administrativeExpenses = categories.map(() => Math.floor(Math.random() * 80000) + 20000);
    const fundraisingExpenses = categories.map(() => Math.floor(Math.random() * 40000) + 10000);
    
    const totalProgram = programServices.reduce((sum, val) => sum + val, 0);
    const totalAdministrative = administrativeExpenses.reduce((sum, val) => sum + val, 0);
    const totalFundraising = fundraisingExpenses.reduce((sum, val) => sum + val, 0);
    const grandTotal = totalProgram + totalAdministrative + totalFundraising;
    
    return {
      categories,
      programServices,
      administrativeExpenses,
      fundraisingExpenses,
      totalProgram,
      totalAdministrative,
      totalFundraising,
      grandTotal
    };
  }

  async getBudgetVsActualReport(fiscalYearId: string, departmentId?: string): Promise<{
    categories: string[];
    budgetData: number[];
    actualData: number[];
    varianceData: number[];
    totalBudget: number;
    totalActual: number;
    totalVariance: number;
    variancePercentage: number;
  }> {
    // This would normally fetch actual budget data from the database
    // For now, generating sample data
    const categories = [
      'Administrative',
      'Tuition Credits',
      'Program Services',
      'Marketing',
      'Professional Development',
      'Provider Support',
      'Facilities',
      'Technology'
    ];
    
    const budgetData = categories.map(() => Math.floor(Math.random() * 500000) + 100000);
    const actualData = budgetData.map(budget => {
      // Random variance between -15% and +10% of budget
      const variance = budget * (Math.random() * 0.25 - 0.15);
      return Math.max(0, Math.floor(budget + variance));
    });
    
    const varianceData = budgetData.map((budget, index) => actualData[index] - budget);
    
    const totalBudget = budgetData.reduce((sum, val) => sum + val, 0);
    const totalActual = actualData.reduce((sum, val) => sum + val, 0);
    const totalVariance = totalActual - totalBudget;
    const variancePercentage = (totalVariance / totalBudget) * 100;
    
    return {
      categories,
      budgetData,
      actualData,
      varianceData,
      totalBudget,
      totalActual,
      totalVariance,
      variancePercentage
    };
  }

  async getFinancialReportConfig(reportId: string): Promise<FinancialReportConfig | null> {
    // Mock implementation
    const reportConfigs: FinancialReportConfig[] = [
      {
        id: '1',
        name: 'Monthly Financial Summary',
        type: 'SUMMARY',
        createdById: 'user1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        parameters: {
          frequency: 'MONTHLY',
          includeBalanceSheet: true,
          includeIncomeStatement: true,
          includeBudgetComparison: true
        },
        scheduledDelivery: true,
        deliverySchedule: '0 9 1 * *', // 9 AM on the 1st of each month
        deliveryEmails: ['finance@example.com', 'director@example.com']
      },
      {
        id: '2',
        name: 'Quarterly Budget Analysis',
        type: 'BUDGET',
        createdById: 'user1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        parameters: {
          frequency: 'QUARTERLY',
          includeVarianceAnalysis: true,
          includeTrends: true,
          groupByDepartment: true
        },
        scheduledDelivery: true,
        deliverySchedule: '0 9 1 1,4,7,10 *', // 9 AM on the 1st of Jan, Apr, Jul, Oct
        deliveryEmails: ['finance@example.com']
      }
    ];
    
    const config = reportConfigs.find(r => r.id === reportId);
    return Promise.resolve(config || null);
  }

  async getAllFinancialReportConfigs(): Promise<FinancialReportConfig[]> {
    // Mock implementation
    const reportConfigs: FinancialReportConfig[] = [
      {
        id: '1',
        name: 'Monthly Financial Summary',
        type: 'SUMMARY',
        createdById: 'user1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        parameters: {
          frequency: 'MONTHLY',
          includeBalanceSheet: true,
          includeIncomeStatement: true,
          includeBudgetComparison: true
        },
        scheduledDelivery: true,
        deliverySchedule: '0 9 1 * *', // 9 AM on the 1st of each month
        deliveryEmails: ['finance@example.com', 'director@example.com']
      },
      {
        id: '2',
        name: 'Quarterly Budget Analysis',
        type: 'BUDGET',
        createdById: 'user1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        parameters: {
          frequency: 'QUARTERLY',
          includeVarianceAnalysis: true,
          includeTrends: true,
          groupByDepartment: true
        },
        scheduledDelivery: true,
        deliverySchedule: '0 9 1 1,4,7,10 *', // 9 AM on the 1st of Jan, Apr, Jul, Oct
        deliveryEmails: ['finance@example.com']
      },
      {
        id: '3',
        name: 'Weekly Transaction Log',
        type: 'TRANSACTION',
        createdById: 'user2',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        parameters: {
          frequency: 'WEEKLY',
          transactionTypes: ['JOURNAL_ENTRY', 'ACCOUNTS_PAYABLE', 'ACCOUNTS_RECEIVABLE'],
          includePending: true
        },
        scheduledDelivery: true,
        deliverySchedule: '0 17 * * 5', // 5 PM every Friday
        deliveryEmails: ['accounting@example.com']
      }
    ];
    
    return Promise.resolve(reportConfigs);
  }

  async createFinancialReportConfig(config: Omit<FinancialReportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialReportConfig> {
    // In a real implementation, this would save to the database
    const newConfig: FinancialReportConfig = {
      ...config,
      id: Math.random().toString(36).substring(2, 9), // Generate random ID
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return Promise.resolve(newConfig);
  }

  async updateFinancialReportConfig(id: string, configData: Partial<FinancialReportConfig>): Promise<FinancialReportConfig | null> {
    // In a real implementation, this would update the database
    // Mock implementation just returns the updated config
    const config = await this.getFinancialReportConfig(id);
    if (!config) return null;
    
    const updatedConfig: FinancialReportConfig = {
      ...config,
      ...configData,
      updatedAt: new Date()
    };
    
    return Promise.resolve(updatedConfig);
  }

  async deleteFinancialReportConfig(id: string): Promise<boolean> {
    // In a real implementation, this would delete from the database
    // Mock implementation just returns success
    return Promise.resolve(true);
  }

  async generateReport(reportType: string, fiscalYearId: string, fiscalPeriodId?: string, format: 'PDF' | 'EXCEL' | 'CSV' = 'PDF'): Promise<string> {
    // In a real implementation, this would generate the actual report file
    // For now, returning a mock file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${reportType.toLowerCase()}_report_${timestamp}.${format.toLowerCase()}`;
    
    return Promise.resolve(`/reports/${fileName}`);
  }

  async scheduleReport(reportConfigId: string): Promise<boolean> {
    // In a real implementation, this would schedule the report generation
    // For now, just return success
    return Promise.resolve(true);
  }

  // Accounts Payable methods
  async getAllVendors(): Promise<Vendor[]> {
    return accountsPayableService.getAllVendors();
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    return accountsPayableService.getVendorById(id);
  }

  async getVendorsByType(type: VendorType): Promise<Vendor[]> {
    return accountsPayableService.getVendorsByType(type);
  }

  async createVendor(vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'yearToDatePayments'>): Promise<Vendor> {
    return accountsPayableService.createVendor(vendor);
  }

  async updateVendor(id: string, vendorData: Partial<Vendor>): Promise<Vendor | null> {
    return accountsPayableService.updateVendor(id, vendorData);
  }

  async getAllBills(): Promise<Bill[]> {
    return accountsPayableService.getAllBills();
  }

  async getBillById(id: string): Promise<Bill | null> {
    return accountsPayableService.getBillById(id);
  }

  async getBillsByVendor(vendorId: string): Promise<Bill[]> {
    return accountsPayableService.getBillsByVendor(vendorId);
  }

  async getBillsByStatus(status: TransactionStatus): Promise<Bill[]> {
    return accountsPayableService.getBillsByStatus(status);
  }

  async createBill(billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'entries'>): Promise<Bill> {
    return accountsPayableService.createBill(billData);
  }

  async approveBill(id: string, approverId: string): Promise<Bill | null> {
    return accountsPayableService.approveBill(id, approverId);
  }

  async postBill(id: string): Promise<Bill | null> {
    return accountsPayableService.postBill(id);
  }

  async getAllRecurringBills(): Promise<RecurringBill[]> {
    return accountsPayableService.getAllRecurringBills();
  }

  async getRecurringBillById(id: string): Promise<RecurringBill | null> {
    return accountsPayableService.getRecurringBillById(id);
  }

  async createRecurringBill(recurringBill: Omit<RecurringBill, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringBill> {
    return accountsPayableService.createRecurringBill(recurringBill);
  }

  async generateBillFromRecurring(recurringBillId: string): Promise<Bill | null> {
    return accountsPayableService.generateBillFromRecurring(recurringBillId);
  }

  async getAllPayments(): Promise<Payment[]> {
    return accountsPayableService.getAllPayments();
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return accountsPayableService.getPaymentById(id);
  }

  async getPaymentsByBill(billId: string): Promise<Payment[]> {
    return accountsPayableService.getPaymentsByBill(billId);
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    return accountsPayableService.createPayment(paymentData);
  }

  async processPayment(id: string): Promise<Payment | null> {
    return accountsPayableService.processPayment(id);
  }

  async getTaxDocumentsByVendor(vendorId: string): Promise<TaxDocument[]> {
    return accountsPayableService.getTaxDocumentsByVendor(vendorId);
  }

  async get1099Vendors(): Promise<Vendor[]> {
    return accountsPayableService.get1099Vendors();
  }

  async getVendorPaymentSummary(vendorId: string, year: number): Promise<{
    vendor: Vendor | null;
    totalPayments: number;
    payments: Payment[];
    bills: Bill[];
  }> {
    return accountsPayableService.getVendorPaymentSummary(vendorId, year);
  }

  async getVendorAnalytics(): Promise<{
    totalVendors: number;
    activeVendors: number;
    totalSpend: number;
    vendorsByType: { type: VendorType; count: number }[];
    topVendorsBySpend: { vendor: Vendor; totalSpend: number }[];
  }> {
    return accountsPayableService.getVendorAnalytics();
  }

  async getOpenInvoiceAnalytics(): Promise<{
    totalOpenInvoices: number;
    totalPastDueInvoices: number;
    totalOpenAmount: number;
    totalPastDueAmount: number;
    agingBuckets: {
      current: number;
      '1-30': number;
      '31-60': number;
      '61-90': number;
      '90Plus': number;
    };
  }> {
    return accountsPayableService.getOpenInvoiceAnalytics();
  }

  // Accounts Receivable methods
  async getAllCustomers(): Promise<Customer[]> {
    return accountsReceivableService.getAllCustomers();
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return accountsReceivableService.getCustomerById(id);
  }

  async getCustomersByType(type: CustomerType): Promise<Customer[]> {
    return accountsReceivableService.getCustomersByType(type);
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'yearToDateReceivables'>): Promise<Customer> {
    return accountsReceivableService.createCustomer(customer);
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer | null> {
    return accountsReceivableService.updateCustomer(id, customerData);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return accountsReceivableService.getAllInvoices();
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    return accountsReceivableService.getInvoiceById(id);
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    return accountsReceivableService.getInvoicesByCustomer(customerId);
  }

  async getInvoicesByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return accountsReceivableService.getInvoicesByStatus(status);
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return accountsReceivableService.getOverdueInvoices();
  }

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'entries'>): Promise<Invoice> {
    return accountsReceivableService.createInvoice(invoiceData);
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice | null> {
    return accountsReceivableService.updateInvoiceStatus(id, status);
  }

  async sendInvoice(id: string): Promise<Invoice | null> {
    return accountsReceivableService.sendInvoice(id);
  }

  async voidInvoice(id: string, voidReason: string): Promise<Invoice | null> {
    return accountsReceivableService.voidInvoice(id, voidReason);
  }

  async getAllRecurringInvoices(): Promise<RecurringInvoice[]> {
    return accountsReceivableService.getAllRecurringInvoices();
  }

  async getRecurringInvoiceById(id: string): Promise<RecurringInvoice | null> {
    return accountsReceivableService.getRecurringInvoiceById(id);
  }

  async getRecurringInvoicesByCustomer(customerId: string): Promise<RecurringInvoice[]> {
    return accountsReceivableService.getRecurringInvoicesByCustomer(customerId);
  }

  async createRecurringInvoice(recurringInvoiceData: Omit<RecurringInvoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringInvoice> {
    return accountsReceivableService.createRecurringInvoice(recurringInvoiceData);
  }

  async updateRecurringInvoice(id: string, recurringInvoiceData: Partial<RecurringInvoice>): Promise<RecurringInvoice | null> {
    return accountsReceivableService.updateRecurringInvoice(id, recurringInvoiceData);
  }

  async generateInvoiceFromRecurring(recurringInvoiceId: string): Promise<Invoice | null> {
    return accountsReceivableService.generateInvoiceFromRecurring(recurringInvoiceId);
  }

  async getAllReceivablePayments(): Promise<ReceivablePayment[]> {
    return accountsReceivableService.getAllPayments();
  }

  async getReceivablePaymentById(id: string): Promise<ReceivablePayment | null> {
    return accountsReceivableService.getPaymentById(id);
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<ReceivablePayment[]> {
    return accountsReceivableService.getPaymentsByInvoice(invoiceId);
  }

  async createReceivablePayment(paymentData: Omit<ReceivablePayment, 'id' | 'createdAt' | 'updatedAt' | 'processedAt' | 'receiptSent' | 'receiptSentAt'>): Promise<ReceivablePayment> {
    return accountsReceivableService.createPayment(paymentData);
  }

  async processReceivablePayment(id: string): Promise<ReceivablePayment | null> {
    return accountsReceivableService.processPayment(id);
  }

  async voidReceivablePayment(id: string, reason: string): Promise<ReceivablePayment | null> {
    return accountsReceivableService.voidPayment(id, reason);
  }

  async getAllReceipts(): Promise<Receipt[]> {
    return accountsReceivableService.getAllReceipts();
  }

  async getReceiptById(id: string): Promise<Receipt | null> {
    return accountsReceivableService.getReceiptById(id);
  }

  async getReceiptsByCustomer(customerId: string): Promise<Receipt[]> {
    return accountsReceivableService.getReceiptsByCustomer(customerId);
  }

  async getReceiptByPayment(paymentId: string): Promise<Receipt | null> {
    return accountsReceivableService.getReceiptByPayment(paymentId);
  }

  async generateReceipt(paymentId: string, recipientEmail: string): Promise<Receipt | null> {
    return accountsReceivableService.generateReceipt(paymentId, recipientEmail);
  }

  async getAgingReport(): Promise<{
    current: number;
    '1-30': number;
    '31-60': number;
    '61-90': number;
    '90Plus': number;
    total: number;
    customerBreakdown: {
      customerId: string;
      customerName: string;
      current: number;
      '1-30': number;
      '31-60': number;
      '61-90': number;
      '90Plus': number;
      total: number;
    }[];
  }> {
    return accountsReceivableService.getAgingReport();
  }

  async getRevenueByCustomer(startDate: Date, endDate: Date): Promise<{
    customerId: string;
    customerName: string;
    revenue: number;
    invoiceCount: number;
    averageInvoiceAmount: number;
  }[]> {
    return accountsReceivableService.getRevenueByCustomer(startDate, endDate);
  }

  async getRevenueByCategory(startDate: Date, endDate: Date): Promise<{
    category: RevenueCategory;
    revenue: number;
    percentage: number;
  }[]> {
    return accountsReceivableService.getRevenueByCategory(startDate, endDate);
  }

  async getCustomerPaymentSummary(customerId: string, year: number): Promise<{
    customer: Customer | null;
    totalRevenue: number;
    invoices: Invoice[];
    payments: ReceivablePayment[];
    receiptHistory: Receipt[];
  }> {
    return accountsReceivableService.getCustomerPaymentSummary(customerId, year);
  }

  async getAccountsReceivableAnalytics(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    totalReceivables: number;
    totalOverdueAmount: number;
    customersByType: { type: CustomerType; count: number }[];
    topCustomersByRevenue: { customer: Customer; totalRevenue: number }[];
  }> {
    return accountsReceivableService.getAccountsReceivableAnalytics();
  }

  // Budgeting System methods
  async getAllBudgets(): Promise<Budget[]> {
    return budgetService.getAllBudgets();
  }

  async getCurrentBudget(): Promise<Budget | null> {
    return budgetService.getCurrentBudget();
  }

  async getBudgetById(id: string): Promise<Budget | null> {
    return budgetService.getBudgetById(id);
  }

  async getBudgetsByFiscalYear(fiscalYearId: string): Promise<Budget[]> {
    return budgetService.getBudgetsByFiscalYear(fiscalYearId);
  }

  async getBudgetsByStatus(status: BudgetStatus): Promise<Budget[]> {
    return budgetService.getBudgetsByStatus(status);
  }

  async getBudgetsByType(type: BudgetType): Promise<Budget[]> {
    return budgetService.getBudgetsByType(type);
  }

  async getBudgetsByDepartment(departmentId: string): Promise<Budget[]> {
    return budgetService.getBudgetsByDepartment(departmentId);
  }

  async getBudgetsByProgram(programId: string): Promise<Budget[]> {
    return budgetService.getBudgetsByProgram(programId);
  }

  async getBudgetsByProject(projectId: string): Promise<Budget[]> {
    return budgetService.getBudgetsByProject(projectId);
  }

  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    return budgetService.createBudget(budget);
  }

  async updateBudget(id: string, budgetData: Partial<Budget>): Promise<Budget | null> {
    return budgetService.updateBudget(id, budgetData);
  }

  async approveBudget(id: string, approverId: string): Promise<Budget | null> {
    return budgetService.approveBudget(id, approverId);
  }

  async rejectBudget(id: string, rejectionReason: string): Promise<Budget | null> {
    return budgetService.rejectBudget(id, rejectionReason);
  }

  async closeBudget(id: string): Promise<Budget | null> {
    return budgetService.closeBudget(id);
  }

  async getBudgetItems(budgetId: string): Promise<BudgetItem[]> {
    return budgetService.getBudgetItems(budgetId);
  }

  async getBudgetItemById(id: string): Promise<BudgetItem | null> {
    return budgetService.getBudgetItemById(id);
  }

  async addBudgetItem(budgetItem: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<BudgetItem> {
    return budgetService.addBudgetItem(budgetItem);
  }

  async updateBudgetItem(id: string, budgetItemData: Partial<BudgetItem>): Promise<BudgetItem | null> {
    return budgetService.updateBudgetItem(id, budgetItemData);
  }

  async removeBudgetItem(id: string): Promise<boolean> {
    return budgetService.removeBudgetItem(id);
  }

  async getAllBudgetRevisions(budgetId: string): Promise<BudgetRevision[]> {
    return budgetService.getAllBudgetRevisions(budgetId);
  }

  async getBudgetRevisionById(id: string): Promise<BudgetRevision | null> {
    return budgetService.getBudgetRevisionById(id);
  }

  async createBudgetRevision(
    budgetRevision: Omit<BudgetRevision, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BudgetRevision> {
    return budgetService.createBudgetRevision(budgetRevision);
  }

  async approveBudgetRevision(id: string, approverId: string): Promise<BudgetRevision | null> {
    return budgetService.approveBudgetRevision(id, approverId);
  }

  async rejectBudgetRevision(id: string, rejectionReason: string): Promise<BudgetRevision | null> {
    return budgetService.rejectBudgetRevision(id, rejectionReason);
  }

  async getAllBudgetTemplates(): Promise<BudgetTemplate[]> {
    return budgetService.getAllBudgetTemplates();
  }

  async getBudgetTemplateById(id: string): Promise<BudgetTemplate | null> {
    return budgetService.getBudgetTemplateById(id);
  }

  async getBudgetTemplatesByType(type: BudgetType): Promise<BudgetTemplate[]> {
    return budgetService.getBudgetTemplatesByType(type);
  }

  async createBudgetTemplate(
    budgetTemplate: Omit<BudgetTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BudgetTemplate> {
    return budgetService.createBudgetTemplate(budgetTemplate);
  }

  async updateBudgetTemplate(
    id: string,
    budgetTemplateData: Partial<BudgetTemplate>
  ): Promise<BudgetTemplate | null> {
    return budgetService.updateBudgetTemplate(id, budgetTemplateData);
  }

  async deleteBudgetTemplate(id: string): Promise<boolean> {
    return budgetService.deleteBudgetTemplate(id);
  }

  async createBudgetFromTemplate(
    templateId: string,
    fiscalYearId: string,
    name: string,
    startDate: Date,
    endDate: Date,
    options?: {
      departmentId?: string;
      programId?: string;
      projectId?: string;
      fundId?: string;
      customAmounts?: { [key: string]: number };
    }
  ): Promise<Budget> {
    return budgetService.createBudgetFromTemplate(
      templateId,
      fiscalYearId,
      name,
      startDate,
      endDate,
      options
    );
  }

  async getBudgetVarianceReport(
    budgetId: string,
    asOfDate?: Date
  ): Promise<BudgetVarianceReport> {
    return budgetService.getBudgetVarianceReport(budgetId, asOfDate);
  }

  async getBudgetVarianceReportById(id: string): Promise<BudgetVarianceReport | null> {
    return budgetService.getBudgetVarianceReportById(id);
  }

  async generateBudgetVarianceReport(
    budgetId: string,
    asOfDate: Date
  ): Promise<BudgetVarianceReport> {
    return budgetService.generateBudgetVarianceReport(budgetId, asOfDate);
  }

  async exportBudgetVarianceReport(
    id: string,
    format: 'PDF' | 'EXCEL' | 'CSV'
  ): Promise<string> {
    return budgetService.exportBudgetVarianceReport(id, format);
  }

  async getBudgetAnalytics(fiscalYearId: string): Promise<{
    totalBudgetAmount: number;
    totalActualAmount: number;
    varianceAmount: number;
    variancePercentage: number;
    budgetsByType: { type: BudgetType; count: number; amount: number }[];
    budgetsByStatus: { status: BudgetStatus; count: number; amount: number }[];
    topBudgetItems: { 
      account: ChartOfAccount; 
      budgetAmount: number; 
      actualAmount: number;
      variance: number;
      variancePercentage: number;
    }[];
  }> {
    return budgetService.getBudgetAnalytics(fiscalYearId);
  }

  async getAllDepartments(): Promise<Department[]> {
    return budgetService.getAllDepartments();
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    return budgetService.getDepartmentById(id);
  }

  async createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    return budgetService.createDepartment(department);
  }

  async updateDepartment(id: string, departmentData: Partial<Department>): Promise<Department | null> {
    return budgetService.updateDepartment(id, departmentData);
  }

  async getAllPrograms(): Promise<Program[]> {
    return budgetService.getAllPrograms();
  }

  async getProgramById(id: string): Promise<Program | null> {
    return budgetService.getProgramById(id);
  }

  async getProgramsByDepartment(departmentId: string): Promise<Program[]> {
    return budgetService.getProgramsByDepartment(departmentId);
  }

  async createProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program> {
    return budgetService.createProgram(program);
  }

  async updateProgram(id: string, programData: Partial<Program>): Promise<Program | null> {
    return budgetService.updateProgram(id, programData);
  }

  async getAllProjects(): Promise<Project[]> {
    return budgetService.getAllProjects();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return budgetService.getProjectById(id);
  }

  async getProjectsByProgram(programId: string): Promise<Project[]> {
    return budgetService.getProjectsByProgram(programId);
  }

  async getProjectsByDepartment(departmentId: string): Promise<Project[]> {
    return budgetService.getProjectsByDepartment(departmentId);
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return budgetService.createProject(project);
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project | null> {
    return budgetService.updateProject(id, projectData);
  }

  // Tuition Credit Management - Provider methods
  async getAllProviders(): Promise<Provider[]> {
    return tuitionCreditService.getAllProviders();
  }

  async getProviderById(id: string): Promise<Provider | null> {
    return tuitionCreditService.getProviderById(id);
  }

  async getProvidersByType(type: ProviderType): Promise<Provider[]> {
    return tuitionCreditService.getProvidersByType(type);
  }

  async getProvidersByStatus(status: ProviderStatus): Promise<Provider[]> {
    return tuitionCreditService.getProvidersByStatus(status);
  }

  async getProvidersByQualityRating(rating: ProviderQualityRating): Promise<Provider[]> {
    return tuitionCreditService.getProvidersByQualityRating(rating);
  }

  async createProvider(provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt' | 'yearToDatePayments' | 'yearToDateCredits'>): Promise<Provider> {
    return tuitionCreditService.createProvider(provider);
  }

  async updateProvider(id: string, providerData: Partial<Provider>): Promise<Provider | null> {
    return tuitionCreditService.updateProvider(id, providerData);
  }

  // Tuition Credit Management - Tuition Credit methods
  async getAllTuitionCredits(): Promise<TuitionCredit[]> {
    return tuitionCreditService.getAllTuitionCredits();
  }

  async getTuitionCreditById(id: string): Promise<TuitionCredit | null> {
    return tuitionCreditService.getTuitionCreditById(id);
  }

  async getTuitionCreditsByProvider(providerId: string): Promise<TuitionCredit[]> {
    return tuitionCreditService.getTuitionCreditsByProvider(providerId);
  }

  async getTuitionCreditsByStatus(status: TuitionCreditStatus): Promise<TuitionCredit[]> {
    return tuitionCreditService.getTuitionCreditsByStatus(status);
  }

  async getTuitionCreditsByPeriod(startDate: Date, endDate: Date): Promise<TuitionCredit[]> {
    return tuitionCreditService.getTuitionCreditsByPeriod(startDate, endDate);
  }

  async createTuitionCredit(creditData: Omit<TuitionCredit, 'id' | 'createdAt' | 'updatedAt' | 'entries'>): Promise<TuitionCredit> {
    return tuitionCreditService.createTuitionCredit(creditData);
  }

  async updateTuitionCredit(id: string, creditData: Partial<TuitionCredit>): Promise<TuitionCredit | null> {
    return tuitionCreditService.updateTuitionCredit(id, creditData);
  }

  async approveTuitionCredit(id: string, approverId: string): Promise<TuitionCredit | null> {
    return tuitionCreditService.approveTuitionCredit(id, approverId);
  }

  async rejectTuitionCredit(id: string, approverId: string, rejectionReason: string): Promise<TuitionCredit | null> {
    return tuitionCreditService.rejectTuitionCredit(id, approverId, rejectionReason);
  }

  async createAdjustmentCredit(originalCreditId: string, adjustmentData: Partial<TuitionCredit>, userId: string): Promise<TuitionCredit | null> {
    return tuitionCreditService.createAdjustmentCredit(originalCreditId, adjustmentData, userId);
  }

  // Tuition Credit Management - Tuition Credit Batch methods
  async getAllTuitionCreditBatches(): Promise<TuitionCreditBatch[]> {
    return tuitionCreditService.getAllTuitionCreditBatches();
  }

  async getTuitionCreditBatchById(id: string): Promise<TuitionCreditBatch | null> {
    return tuitionCreditService.getTuitionCreditBatchById(id);
  }

  async createTuitionCreditBatch(batchData: Omit<TuitionCreditBatch, 'id' | 'createdAt' | 'updatedAt'>): Promise<TuitionCreditBatch> {
    return tuitionCreditService.createTuitionCreditBatch(batchData);
  }

  async updateTuitionCreditBatch(id: string, batchData: Partial<TuitionCreditBatch>): Promise<TuitionCreditBatch | null> {
    return tuitionCreditService.updateTuitionCreditBatch(id, batchData);
  }

  async processTuitionCreditBatch(id: string, userId: string): Promise<TuitionCreditBatch | null> {
    return tuitionCreditService.processTuitionCreditBatch(id, userId);
  }

  async addCreditToBatch(batchId: string, creditId: string): Promise<TuitionCreditBatch | null> {
    return tuitionCreditService.addCreditToBatch(batchId, creditId);
  }

  async removeCreditFromBatch(batchId: string, creditId: string): Promise<TuitionCreditBatch | null> {
    return tuitionCreditService.removeCreditFromBatch(batchId, creditId);
  }

  // Tuition Credit Management - Provider Payment methods
  async getAllProviderPayments(): Promise<ProviderPayment[]> {
    return tuitionCreditService.getAllProviderPayments();
  }

  async getProviderPaymentById(id: string): Promise<ProviderPayment | null> {
    return tuitionCreditService.getProviderPaymentById(id);
  }

  async getProviderPaymentsByProvider(providerId: string): Promise<ProviderPayment[]> {
    return tuitionCreditService.getProviderPaymentsByProvider(providerId);
  }

  async getProviderPaymentsByStatus(status: PaymentStatus): Promise<ProviderPayment[]> {
    return tuitionCreditService.getProviderPaymentsByStatus(status);
  }

  async createProviderPayment(paymentData: Omit<ProviderPayment, 'id' | 'createdAt' | 'updatedAt' | 'processedAt' | 'processedById' | 'voidedAt' | 'voidedById'>): Promise<ProviderPayment> {
    return tuitionCreditService.createProviderPayment(paymentData);
  }

  async updateProviderPayment(id: string, paymentData: Partial<ProviderPayment>): Promise<ProviderPayment | null> {
    return tuitionCreditService.updateProviderPayment(id, paymentData);
  }

  async processProviderPayment(id: string, userId: string): Promise<ProviderPayment | null> {
    return tuitionCreditService.processProviderPayment(id, userId);
  }

  async voidProviderPayment(id: string, userId: string, voidReason: string): Promise<ProviderPayment | null> {
    return tuitionCreditService.voidProviderPayment(id, userId, voidReason);
  }

  // Tuition Credit Management - Provider Payment Batch methods
  async getAllProviderPaymentBatches(): Promise<ProviderPaymentBatch[]> {
    return tuitionCreditService.getAllProviderPaymentBatches();
  }

  async getProviderPaymentBatchById(id: string): Promise<ProviderPaymentBatch | null> {
    return tuitionCreditService.getProviderPaymentBatchById(id);
  }

  async createProviderPaymentBatch(batchData: Omit<ProviderPaymentBatch, 'id' | 'createdAt' | 'updatedAt' | 'processedAt' | 'processedById'>): Promise<ProviderPaymentBatch> {
    return tuitionCreditService.createProviderPaymentBatch(batchData);
  }

  async updateProviderPaymentBatch(id: string, batchData: Partial<ProviderPaymentBatch>): Promise<ProviderPaymentBatch | null> {
    return tuitionCreditService.updateProviderPaymentBatch(id, batchData);
  }

  async processProviderPaymentBatch(id: string, userId: string): Promise<ProviderPaymentBatch | null> {
    return tuitionCreditService.processProviderPaymentBatch(id, userId);
  }

  async generatePayfileForBatch(id: string): Promise<ProviderPaymentBatch | null> {
    return tuitionCreditService.generatePayfileForBatch(id);
  }

  async addPaymentToBatch(batchId: string, paymentId: string): Promise<ProviderPaymentBatch | null> {
    return tuitionCreditService.addPaymentToBatch(batchId, paymentId);
  }

  async removePaymentFromBatch(batchId: string, paymentId: string): Promise<ProviderPaymentBatch | null> {
    return tuitionCreditService.removePaymentFromBatch(batchId, paymentId);
  }

  // Tuition Credit Management - Analytics actions
  async getProviderTuitionCreditSummary(providerId: string, startDate: Date, endDate: Date): Promise<{
    provider: Provider | null;
    totalCredits: number;
    paidCredits: number;
    pendingCredits: number;
    creditsByStatus: Record<TuitionCreditStatus, number>;
    creditsByMonth: Record<string, number>;
    averageCreditAmount: number;
    studentCount: number;
  }> {
    return tuitionCreditService.getProviderTuitionCreditSummary(providerId, startDate, endDate);
  }

  async getTuitionCreditMetrics(startDate: Date, endDate: Date): Promise<{
    totalCreditAmount: number;
    totalCreditsCount: number;
    averageCreditAmount: number;
    creditsByProvider: {
      providerId: string;
      providerName: string;
      amount: number;
      count: number;
    }[];
    creditsByStatus: Record<TuitionCreditStatus, number>;
    creditsByMonth: Record<string, number>;
    totalStudents: number;
    processingTimeAverage: number;
  }> {
    return tuitionCreditService.getTuitionCreditMetrics(startDate, endDate);
  }

  async getProviderQualityImprovementGrants(startDate: Date, endDate: Date): Promise<{
    totalGrantAmount: number;
    grantCount: number;
    grantsByProviderType: Record<ProviderType, number>;
    grantsByQualityRating: Record<ProviderQualityRating, number>;
    providersWithGrants: {
      providerId: string;
      providerName: string;
      grantAmount: number;
      grantCount: number;
      providerType: ProviderType;
      qualityRating: ProviderQualityRating;
    }[];
  }> {
    return tuitionCreditService.getProviderQualityImprovementGrants(startDate, endDate);
  }

  // Helper for getting current fiscal year and period
  async getCurrentFiscalYearAndPeriod(): Promise<{
    currentFiscalYear: FiscalYear | null;
    currentFiscalPeriod: FiscalPeriod | null;
  }> {
    const currentFiscalYear = await this.getCurrentFiscalYear();
    const currentFiscalPeriod = await this.getCurrentFiscalPeriod();
    
    return {
      currentFiscalYear,
      currentFiscalPeriod
    };
  }

  // Data Import/Export methods
  async validateImport(file: File, config: ImportConfig): Promise<ImportValidationResult> {
    return dataImportExportService.validateImport(file, config);
  }

  async importData(file: File, config: ImportConfig): Promise<ImportResult> {
    return dataImportExportService.importData(file, config);
  }

  async exportData(config: ExportConfig): Promise<ExportResult> {
    return dataImportExportService.exportData(config);
  }

  async getDataMappingForTarget(target: ImportTarget): Promise<DataMapping> {
    return dataImportExportService.getDataMappingForTarget(target);
  }

  async scheduleAutomatedImport(
    sourceUrl: string, 
    schedule: string, 
    config: ImportConfig
  ): Promise<string> {
    return dataImportExportService.scheduleAutomatedImport(sourceUrl, schedule, config);
  }

  async getScheduledImports(): Promise<{
    id: string;
    sourceUrl: string;
    schedule: string;
    lastRun?: Date;
    nextRun?: Date;
    config: ImportConfig;
    status: 'ACTIVE' | 'PAUSED' | 'ERROR';
    errorMessage?: string;
  }[]> {
    return dataImportExportService.getScheduledImports();
  }

  async pauseScheduledImport(id: string): Promise<boolean> {
    return dataImportExportService.pauseScheduledImport(id);
  }

  async resumeScheduledImport(id: string): Promise<boolean> {
    return dataImportExportService.resumeScheduledImport(id);
  }

  async deleteScheduledImport(id: string): Promise<boolean> {
    return dataImportExportService.deleteScheduledImport(id);
  }

  async importBankTransactions(
    file: File, 
    bankAccountId: string, 
    format: string, 
    options?: { 
      dateFormat?: string;
      allowDuplicates?: boolean; 
      defaultCategoryId?: string;
    }
  ): Promise<ImportResult> {
    return dataImportExportService.importBankTransactions(file, bankAccountId, format, options);
  }

  // Bank Reconciliation Methods
  async getAllBankAccounts(): Promise<BankAccount[]> {
    return bankReconciliationService.getAllBankAccounts();
  }

  async getBankAccountById(id: string): Promise<BankAccount | null> {
    return bankReconciliationService.getBankAccountById(id);
  }

  async getBankAccountsByType(type: BankAccountType): Promise<BankAccount[]> {
    return bankReconciliationService.getBankAccountsByType(type);
  }

  async getBankAccountsByStatus(status: BankAccountStatus): Promise<BankAccount[]> {
    return bankReconciliationService.getBankAccountsByStatus(status);
  }

  async getDefaultBankAccount(): Promise<BankAccount | null> {
    return bankReconciliationService.getDefaultBankAccount();
  }

  async createBankAccount(accountData: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> {
    return bankReconciliationService.createBankAccount(accountData);
  }

  async updateBankAccount(id: string, accountData: Partial<BankAccount>): Promise<BankAccount | null> {
    return bankReconciliationService.updateBankAccount(id, accountData);
  }

  async getAllBankTransactions(): Promise<BankTransaction[]> {
    return bankReconciliationService.getAllBankTransactions();
  }

  async getBankTransactionById(id: string): Promise<BankTransaction | null> {
    return bankReconciliationService.getBankTransactionById(id);
  }

  async getBankTransactionsByAccount(bankAccountId: string): Promise<BankTransaction[]> {
    return bankReconciliationService.getBankTransactionsByAccount(bankAccountId);
  }

  async getBankTransactionsByMatchStatus(bankAccountId: string, status: TransactionMatchStatus): Promise<BankTransaction[]> {
    return bankReconciliationService.getBankTransactionsByMatchStatus(bankAccountId, status);
  }

  async getRecentBankTransactions(bankAccountId: string, count: number = 10): Promise<BankTransaction[]> {
    return bankReconciliationService.getRecentBankTransactions(bankAccountId, count);
  }

  async createBankTransaction(transactionData: Omit<BankTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankTransaction> {
    return bankReconciliationService.createBankTransaction(transactionData);
  }

  async updateBankTransaction(id: string, transactionData: Partial<BankTransaction>): Promise<BankTransaction | null> {
    return bankReconciliationService.updateBankTransaction(id, transactionData);
  }

  async getAllReconciliations(): Promise<BankReconciliation[]> {
    return bankReconciliationService.getAllReconciliations();
  }

  async getReconciliationById(id: string): Promise<BankReconciliation | null> {
    return bankReconciliationService.getReconciliationById(id);
  }

  async getReconciliationsByAccount(bankAccountId: string): Promise<BankReconciliation[]> {
    return bankReconciliationService.getReconciliationsByAccount(bankAccountId);
  }

  async getReconciliationsByStatus(status: ReconciliationStatus): Promise<BankReconciliation[]> {
    return bankReconciliationService.getReconciliationsByStatus(status);
  }

  async getCurrentReconciliation(bankAccountId: string): Promise<BankReconciliation | null> {
    return bankReconciliationService.getCurrentReconciliation(bankAccountId);
  }

  async getLastCompletedReconciliation(bankAccountId: string): Promise<BankReconciliation | null> {
    return bankReconciliationService.getLastCompletedReconciliation(bankAccountId);
  }

  async createReconciliation(reconciliationData: Omit<BankReconciliation, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'unreconciled' | 'adjustedStatementBalance'>): Promise<BankReconciliation> {
    return bankReconciliationService.createReconciliation(reconciliationData);
  }

  async updateReconciliation(id: string, reconciliationData: Partial<BankReconciliation>): Promise<BankReconciliation | null> {
    return bankReconciliationService.updateReconciliation(id, reconciliationData);
  }

  async completeReconciliation(id: string, userId: string): Promise<BankReconciliation | null> {
    return bankReconciliationService.completeReconciliation(id, userId);
  }

  async getStatementAdjustmentsByReconciliation(reconciliationId: string): Promise<BankStatementAdjustment[]> {
    return bankReconciliationService.getStatementAdjustmentsByReconciliation(reconciliationId);
  }

  async createStatementAdjustment(adjustmentData: Omit<BankStatementAdjustment, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankStatementAdjustment> {
    return bankReconciliationService.createStatementAdjustment(adjustmentData);
  }

  async updateStatementAdjustment(id: string, adjustmentData: Partial<BankStatementAdjustment>): Promise<BankStatementAdjustment | null> {
    return bankReconciliationService.updateStatementAdjustment(id, adjustmentData);
  }

  async deleteStatementAdjustment(id: string): Promise<boolean> {
    return bankReconciliationService.deleteStatementAdjustment(id);
  }

  async getAllRecurringPatterns(): Promise<RecurringTransactionPattern[]> {
    return bankReconciliationService.getAllRecurringPatterns();
  }

  async getRecurringPatternById(id: string): Promise<RecurringTransactionPattern | null> {
    return bankReconciliationService.getRecurringPatternById(id);
  }

  async getRecurringPatternsByAccount(bankAccountId: string): Promise<RecurringTransactionPattern[]> {
    return bankReconciliationService.getRecurringPatternsByAccount(bankAccountId);
  }

  async createRecurringPattern(patternData: Omit<RecurringTransactionPattern, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringTransactionPattern> {
    return bankReconciliationService.createRecurringPattern(patternData);
  }

  async matchTransactions(bankAccountId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    threshold?: number;
  }): Promise<{
    totalTransactions: number;
    matchedTransactions: number;
    potentialMatches: number;
    unmatchedTransactions: number;
  }> {
    return bankReconciliationService.matchTransactions(bankAccountId, options);
  }

  async manuallyMatchTransaction(bankTransactionId: string, glTransactionId: string): Promise<BankTransaction | null> {
    return bankReconciliationService.manuallyMatchTransaction(bankTransactionId, glTransactionId);
  }

  async excludeTransaction(bankTransactionId: string, reason?: string): Promise<BankTransaction | null> {
    return bankReconciliationService.excludeTransaction(bankTransactionId, reason);
  }

  async resetTransactionMatch(bankTransactionId: string): Promise<BankTransaction | null> {
    return bankReconciliationService.resetTransactionMatch(bankTransactionId);
  }

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
    return bankReconciliationService.getReconciliationSummary(reconciliationId);
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
    return bankReconciliationService.getBankAccountSummary(bankAccountId);
  }
}

// Create and export singleton instance
export const financeService = new FinanceService();