// src/lib/finance/chart-of-accounts-service.ts
import { 
  ChartOfAccount, 
  AccountType, 
  AccountSubType, 
  Fund, 
  FundType 
} from '@/types/finance';

// Mock data for development
const mockAccounts: ChartOfAccount[] = [
  {
    id: '1',
    accountNumber: '1000',
    name: 'Cash',
    description: 'Primary cash account',
    type: AccountType.ASSET,
    subType: AccountSubType.CURRENT_ASSET,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    normalBalance: 'DEBIT',
    isCashAccount: true,
    isBankAccount: true,
    allowAdjustingEntries: true,
    hasChildren: false,
    tags: ['cash', 'liquid']
  },
  {
    id: '2',
    accountNumber: '1100',
    name: 'Accounts Receivable',
    description: 'Amounts owed to the organization',
    type: AccountType.ASSET,
    subType: AccountSubType.CURRENT_ASSET,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    normalBalance: 'DEBIT',
    isCashAccount: false,
    isBankAccount: false,
    allowAdjustingEntries: true,
    hasChildren: false,
    tags: ['receivables']
  },
  {
    id: '3',
    accountNumber: '2000',
    name: 'Accounts Payable',
    description: 'Amounts owed by the organization',
    type: AccountType.LIABILITY,
    subType: AccountSubType.CURRENT_LIABILITY,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    normalBalance: 'CREDIT',
    isCashAccount: false,
    isBankAccount: false,
    allowAdjustingEntries: true,
    hasChildren: false,
    tags: ['payables']
  },
  {
    id: '4',
    accountNumber: '3000',
    name: 'Fund Balance',
    description: 'Organization equity',
    type: AccountType.EQUITY,
    subType: AccountSubType.FUND_BALANCE,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    normalBalance: 'CREDIT',
    isCashAccount: false,
    isBankAccount: false,
    allowAdjustingEntries: false,
    hasChildren: false,
    tags: ['equity']
  },
  {
    id: '5',
    accountNumber: '4000',
    name: 'Grant Revenue',
    description: 'Revenue from grants',
    type: AccountType.REVENUE,
    subType: AccountSubType.GRANT_REVENUE,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    normalBalance: 'CREDIT',
    isCashAccount: false,
    isBankAccount: false,
    allowAdjustingEntries: true,
    hasChildren: false,
    tags: ['revenue', 'grants']
  },
  {
    id: '6',
    accountNumber: '5000',
    name: 'Tuition Credit Expense',
    description: 'Expense for tuition credits',
    type: AccountType.EXPENSE,
    subType: AccountSubType.PROGRAM_EXPENSE,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    normalBalance: 'DEBIT',
    isCashAccount: false,
    isBankAccount: false,
    allowAdjustingEntries: true,
    hasChildren: false,
    tags: ['expense', 'program', 'tuition']
  },
  {
    id: '7',
    accountNumber: '5100',
    name: 'Administrative Expenses',
    description: 'General administrative expenses',
    type: AccountType.EXPENSE,
    subType: AccountSubType.ADMINISTRATIVE_EXPENSE,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    normalBalance: 'DEBIT',
    isCashAccount: false,
    isBankAccount: false,
    allowAdjustingEntries: true,
    hasChildren: true,
    tags: ['expense', 'administrative']
  },
  {
    id: '8',
    accountNumber: '5101',
    name: 'Office Supplies',
    description: 'Office supplies expense',
    type: AccountType.EXPENSE,
    subType: AccountSubType.ADMINISTRATIVE_EXPENSE,
    isActive: true,
    parentAccountId: '7',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    normalBalance: 'DEBIT',
    isCashAccount: false,
    isBankAccount: false,
    allowAdjustingEntries: true,
    hasChildren: false,
    tags: ['expense', 'administrative', 'supplies']
  }
];

const mockFunds: Fund[] = [
  {
    id: '1',
    name: 'General Fund',
    description: 'Primary operating fund',
    type: FundType.GENERAL,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    fundBalance: 1250000
  },
  {
    id: '2',
    name: 'Quality Improvement Grant',
    description: 'Restricted for provider quality improvement',
    type: FundType.RESTRICTED,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    restrictionDetails: 'Can only be used for provider quality improvement initiatives',
    fundBalance: 350000
  },
  {
    id: '3',
    name: 'Endowment Fund',
    description: 'Permanently restricted endowment',
    type: FundType.PERMANENTLY_RESTRICTED,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    restrictionDetails: 'Only interest can be spent; principal must remain intact',
    fundBalance: 2000000
  }
];

// Service for Chart of Accounts management
class ChartOfAccountsService {
  private accounts: ChartOfAccount[] = mockAccounts;
  private funds: Fund[] = mockFunds;

  // Get all accounts
  async getAllAccounts(): Promise<ChartOfAccount[]> {
    return Promise.resolve([...this.accounts]);
  }

  // Get account by ID
  async getAccountById(id: string): Promise<ChartOfAccount | null> {
    const account = this.accounts.find(a => a.id === id);
    return Promise.resolve(account || null);
  }

  // Get accounts by type
  async getAccountsByType(type: AccountType): Promise<ChartOfAccount[]> {
    const filteredAccounts = this.accounts.filter(a => a.type === type);
    return Promise.resolve(filteredAccounts);
  }

  // Get accounts by subtype
  async getAccountsBySubType(subType: AccountSubType): Promise<ChartOfAccount[]> {
    const filteredAccounts = this.accounts.filter(a => a.subType === subType);
    return Promise.resolve(filteredAccounts);
  }

  // Get child accounts
  async getChildAccounts(parentAccountId: string): Promise<ChartOfAccount[]> {
    const childAccounts = this.accounts.filter(a => a.parentAccountId === parentAccountId);
    return Promise.resolve(childAccounts);
  }

  // Create a new account
  async createAccount(account: Omit<ChartOfAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChartOfAccount> {
    const newAccount: ChartOfAccount = {
      ...account,
      id: (this.accounts.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.accounts.push(newAccount);
    return Promise.resolve(newAccount);
  }

  // Update an account
  async updateAccount(id: string, accountData: Partial<ChartOfAccount>): Promise<ChartOfAccount | null> {
    const index = this.accounts.findIndex(a => a.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.accounts[index] = {
      ...this.accounts[index],
      ...accountData,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.accounts[index]);
  }

  // Deactivate an account
  async deactivateAccount(id: string): Promise<boolean> {
    const index = this.accounts.findIndex(a => a.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.accounts[index].isActive = false;
    this.accounts[index].updatedAt = new Date();
    
    return Promise.resolve(true);
  }

  // Get all funds
  async getAllFunds(): Promise<Fund[]> {
    return Promise.resolve([...this.funds]);
  }

  // Get fund by ID
  async getFundById(id: string): Promise<Fund | null> {
    const fund = this.funds.find(f => f.id === id);
    return Promise.resolve(fund || null);
  }

  // Get funds by type
  async getFundsByType(type: FundType): Promise<Fund[]> {
    const filteredFunds = this.funds.filter(f => f.type === type);
    return Promise.resolve(filteredFunds);
  }

  // Create a new fund
  async createFund(fund: Omit<Fund, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fund> {
    const newFund: Fund = {
      ...fund,
      id: (this.funds.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.funds.push(newFund);
    return Promise.resolve(newFund);
  }

  // Update a fund
  async updateFund(id: string, fundData: Partial<Fund>): Promise<Fund | null> {
    const index = this.funds.findIndex(f => f.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.funds[index] = {
      ...this.funds[index],
      ...fundData,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.funds[index]);
  }

  // Deactivate a fund
  async deactivateFund(id: string): Promise<boolean> {
    const index = this.funds.findIndex(f => f.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.funds[index].isActive = false;
    this.funds[index].updatedAt = new Date();
    
    return Promise.resolve(true);
  }
}

// Create and export singleton instance
export const chartOfAccountsService = new ChartOfAccountsService();