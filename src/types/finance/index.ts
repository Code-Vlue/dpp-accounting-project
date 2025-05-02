// src/types/finance/index.ts

// Fund accounting interfaces
export interface FundRestriction {
  id: string;
  fundId: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  restrictionType: 'TIME' | 'PURPOSE' | 'BOTH';
  restrictionDetails: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FundAllocation {
  id: string;
  fundId: string;
  sourceAccountId: string;
  targetAccountId: string;
  amount: number;
  description: string;
  date: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface FundTransfer {
  id: string;
  sourceFundId: string;
  targetFundId: string;
  accountId: string;
  amount: number;
  description: string;
  date: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  transactionId?: string;
}

// Data Import/Export Types
export enum ImportTarget {
  PROVIDERS = 'PROVIDERS',
  BUDGETING = 'BUDGETING',
  INVOICES = 'INVOICES',
  BILLS = 'BILLS',
  CHART_OF_ACCOUNTS = 'CHART_OF_ACCOUNTS',
  JOURNAL_ENTRIES = 'JOURNAL_ENTRIES',
  HISTORICAL_DATA = 'HISTORICAL_DATA',
  BANK_TRANSACTIONS = 'BANK_TRANSACTIONS',
  VENDORS = 'VENDORS',
  CUSTOMERS = 'CUSTOMERS'
}

export enum ExportTarget {
  PROVIDERS = 'PROVIDERS',
  BUDGETING = 'BUDGETING',
  INVOICES = 'INVOICES',
  BILLS = 'BILLS',
  CHART_OF_ACCOUNTS = 'CHART_OF_ACCOUNTS',
  JOURNAL_ENTRIES = 'JOURNAL_ENTRIES',
  FINANCIAL_REPORTS = 'FINANCIAL_REPORTS',
  BANK_TRANSACTIONS = 'BANK_TRANSACTIONS',
  VENDORS = 'VENDORS',
  CUSTOMERS = 'CUSTOMERS'
}

export enum FileFormat {
  CSV = 'CSV',
  XLSX = 'XLSX',
  JSON = 'JSON',
  OFX = 'OFX',
  QFX = 'QFX'
}

export interface ImportConfig {
  target: ImportTarget;
  format: FileFormat;
  mapping?: DataMapping;
  options?: {
    skipHeader?: boolean;
    delimiter?: string;
    dateFormat?: string;
    overwrite?: boolean;
    validateOnly?: boolean;
    sheetName?: string;
  };
  fiscalYearId?: string;
  fiscalPeriodId?: string;
  fundId?: string;
}

export interface ExportConfig {
  target: ExportTarget;
  format: FileFormat;
  options?: {
    includeHeader?: boolean;
    delimiter?: string;
    dateFormat?: string;
    sheetName?: string;
    prettyPrint?: boolean;
  };
  filters?: Record<string, any>;
  fiscalYearId?: string;
  fiscalPeriodId?: string;
  fundId?: string;
}

export interface DataMapping {
  [destinationField: string]: {
    sourceField: string;
    transform?: string;
    required?: boolean;
    defaultValue?: any;
    validation?: string;
  };
}

export interface ImportValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
  level: 'ERROR' | 'WARNING';
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  processedRows: number;
  errors: ImportValidationError[];
  warnings: ImportValidationError[];
  sample?: any[];
}

export interface ImportResult {
  success: boolean;
  target: ImportTarget;
  totalRows: number;
  processedRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: ImportValidationError[];
  warnings: ImportValidationError[];
  importId: string;
  importedAt: Date;
  importedById: string;
}

export interface ExportResult {
  success: boolean;
  target: ExportTarget;
  format: FileFormat;
  totalRows: number;
  fileUrl: string;
  fileName: string;
  exportId: string;
  exportedAt: Date;
  exportedById: string;
}

export interface ScheduledImport {
  id: string;
  name: string;
  description?: string;
  sourceType: 'FILE_UPLOAD' | 'API' | 'SFTP' | 'EMAIL' | 'BANK_FEED';
  sourceConfig: {
    url?: string;
    credentials?: {
      username?: string;
      apiKey?: string;
    };
    path?: string;
    emailFilter?: string;
  };
  target: ImportTarget;
  format: FileFormat;
  mapping: DataMapping;
  schedule: {
    frequency: RecurrenceFrequency;
    dayOfWeek?: number;
    dayOfMonth?: number;
    hour?: number;
    minute?: number;
  };
  options?: Record<string, any>;
  lastRunAt?: Date;
  lastRunStatus?: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  nextRunAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  notifyEmail?: string[];
}

export interface ImportExportLog {
  id: string;
  type: 'IMPORT' | 'EXPORT';
  target: ImportTarget | ExportTarget;
  format: FileFormat;
  fileName: string;
  fileSize: number;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  rowsProcessed: number;
  startedAt: Date;
  completedAt: Date;
  userId: string;
  errorDetails?: string;
  notes?: string;
  resultUrl?: string;
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export enum AccountSubType {
  // Asset subtypes
  CURRENT_ASSET = 'CURRENT_ASSET',
  FIXED_ASSET = 'FIXED_ASSET',
  OTHER_ASSET = 'OTHER_ASSET',
  
  // Liability subtypes
  CURRENT_LIABILITY = 'CURRENT_LIABILITY',
  LONG_TERM_LIABILITY = 'LONG_TERM_LIABILITY',
  
  // Equity subtypes
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  FUND_BALANCE = 'FUND_BALANCE',
  
  // Revenue subtypes
  OPERATING_REVENUE = 'OPERATING_REVENUE',
  NON_OPERATING_REVENUE = 'NON_OPERATING_REVENUE',
  GRANT_REVENUE = 'GRANT_REVENUE',
  
  // Expense subtypes
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  ADMINISTRATIVE_EXPENSE = 'ADMINISTRATIVE_EXPENSE',
  PROGRAM_EXPENSE = 'PROGRAM_EXPENSE'
}

export enum FundType {
  GENERAL = 'GENERAL',
  RESTRICTED = 'RESTRICTED',
  TEMPORARILY_RESTRICTED = 'TEMPORARILY_RESTRICTED',
  PERMANENTLY_RESTRICTED = 'PERMANENTLY_RESTRICTED',
  BOARD_DESIGNATED = 'BOARD_DESIGNATED'
}

export enum FiscalYearStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING'
}

export enum TransactionType {
  JOURNAL_ENTRY = 'JOURNAL_ENTRY',
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  BANK_TRANSACTION = 'BANK_TRANSACTION',
  BUDGET_ADJUSTMENT = 'BUDGET_ADJUSTMENT',
  TUITION_CREDIT = 'TUITION_CREDIT'
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  POSTED = 'POSTED',
  VOIDED = 'VOIDED',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PaymentMethod {
  CHECK = 'CHECK',
  ACH = 'ACH',
  WIRE = 'WIRE',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED'
}

export enum VendorType {
  PROVIDER = 'PROVIDER',
  SUPPLIER = 'SUPPLIER',
  CONTRACTOR = 'CONTRACTOR',
  GOVERNMENT = 'GOVERNMENT',
  NONPROFIT = 'NONPROFIT',
  OTHER = 'OTHER'
}

export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED'
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  GOVERNMENT = 'GOVERNMENT',
  NONPROFIT = 'NONPROFIT',
  FOUNDATION = 'FOUNDATION',
  SCHOOL_DISTRICT = 'SCHOOL_DISTRICT',
  OTHER = 'OTHER'
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOIDED = 'VOIDED'
}

export enum RevenueCategory {
  GRANT = 'GRANT',
  DONATION = 'DONATION',
  SERVICE_FEE = 'SERVICE_FEE',
  PROGRAM_REVENUE = 'PROGRAM_REVENUE',
  INVESTMENT = 'INVESTMENT',
  TUITION = 'TUITION',
  OTHER = 'OTHER'
}

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  CUSTOM = 'CUSTOM'
}

export enum ExpenseCategory {
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  PROGRAM = 'PROGRAM',
  FUNDRAISING = 'FUNDRAISING',
  TUITION_CREDITS = 'TUITION_CREDITS',
  PROVIDER_SUPPORT = 'PROVIDER_SUPPORT',
  MARKETING = 'MARKETING',
  TECHNOLOGY = 'TECHNOLOGY',
  PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
  FACILITIES = 'FACILITIES',
  TRAVEL = 'TRAVEL',
  SUPPLIES = 'SUPPLIES',
  OTHER = 'OTHER'
}

export enum TaxFormType {
  W9 = 'W9',
  W8BEN = 'W8BEN',
  W8BENE = 'W8BENE',
  FORM_1099 = 'FORM_1099',
  OTHER = 'OTHER'
}

export interface ChartOfAccount {
  id: string;
  accountNumber: string;
  name: string;
  description: string;
  type: AccountType;
  subType: AccountSubType;
  isActive: boolean;
  parentAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
  normalBalance: 'DEBIT' | 'CREDIT';
  isCashAccount: boolean;
  isBankAccount: boolean;
  allowAdjustingEntries: boolean;
  hasChildren: boolean;
  fundId?: string;
  tags?: string[];
}

export interface Fund {
  id: string;
  name: string;
  description: string;
  type: FundType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  restrictionDetails?: string;
  fundBalance: number;
}

export interface FiscalYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: FiscalYearStatus;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
  closingDate?: Date;
  reopeningDate?: Date;
}

export interface FiscalPeriod {
  id: string;
  fiscalYearId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: FiscalYearStatus;
  periodNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: Date;
  description: string;
  reference?: string;
  amount: number;
  status: TransactionStatus;
  fiscalYearId: string;
  fiscalPeriodId: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  approvedById?: string;
  approvedAt?: Date;
  postedAt?: Date;
  voidedAt?: Date;
  voidedById?: string;
  voidReason?: string;
  entries: TransactionEntry[];
  attachments?: Attachment[];
  metadata?: Record<string, any>;
}

export interface TransactionEntry {
  id: string;
  transactionId: string;
  accountId: string;
  fundId?: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  departmentId?: string;
  metadata?: Record<string, any>;
}

export interface JournalEntry extends Transaction {
  reason: string;
  recurring: boolean;
  recurringSchedule?: string;
  approvalStatus: ApprovalStatus;
  approvalChainId?: string;
}

export interface Attachment {
  id: string;
  transactionId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: Date;
  uploadedById: string;
}

export interface AccountBalance {
  accountId: string;
  fiscalYearId: string;
  fiscalPeriodId: string;
  fundId?: string;
  openingBalance: number;
  currentBalance: number;
  closingBalance: number;
  lastUpdated: Date;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: Date;
  details: string;
  ipAddress?: string;
  previousState?: string;
  newState?: string;
}

export interface FinancialReportConfig {
  id: string;
  name: string;
  type: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  parameters: Record<string, any>;
  scheduledDelivery?: boolean;
  deliverySchedule?: string;
  deliveryEmails?: string[];
}

// Accounts Payable Types
export interface Vendor {
  id: string;
  name: string;
  vendorNumber: string;
  type: VendorType;
  status: VendorStatus;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: Address;
  accountNumber?: string;
  paymentTerms?: string;
  defaultAccountId?: string;
  defaultExpenseCategory?: ExpenseCategory;
  taxIdentification?: string;
  taxForm?: TaxFormType;
  notes?: string;
  tags?: string[];
  isProvider?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById?: string;
  website?: string;
  invoicingInstructions?: string;
  yearToDatePayments: number;
  lastPaymentDate?: Date;
}

export interface Bill extends Transaction {
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  amountDue: number;
  amountPaid: number;
  paymentStatus: TransactionStatus;
  paymentTerms?: string;
  recurringBillId?: string;
  billItems: BillItem[];
}

export interface BillItem {
  id: string;
  billId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  accountId: string;
  expenseCategory: ExpenseCategory;
  taxable: boolean;
  fundId?: string;
  departmentId?: string;
  projectId?: string;
  metadata?: Record<string, any>;
}

export interface RecurringBill {
  id: string;
  vendorId: string;
  description: string;
  amount: number;
  frequency: RecurrenceFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: Date;
  endDate?: Date;
  accountId: string;
  expenseCategory: ExpenseCategory;
  nextGenerationDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastGeneratedDate?: Date;
  notes?: string;
  billTemplate?: Partial<Bill>;
}

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber?: string;
  accountId: string;
  checkNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  processedAt?: Date;
  transactionId?: string;
  attachments?: Attachment[];
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TaxDocument {
  id: string;
  vendorId: string;
  type: TaxFormType;
  year: number;
  fileUrl: string;
  uploaded: boolean;
  uploadedAt?: Date;
  uploadedById?: string;
  expirationDate?: Date;
}

export interface VendorCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Accounts Receivable Types
export interface Customer {
  id: string;
  name: string;
  customerNumber: string;
  type: CustomerType;
  status: CustomerStatus;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: Address;
  accountNumber?: string;
  defaultAccountId?: string;
  taxIdentification?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById?: string;
  website?: string;
  billingInstructions?: string;
  yearToDateReceivables: number;
  lastPaymentReceived?: Date;
  creditLimit?: number;
  paymentTerms?: string; // Net 30, etc.
}

export interface Invoice extends Transaction {
  customerId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  amountDue: number;
  amountPaid: number;
  invoiceStatus: InvoiceStatus;
  paymentTerms?: string;
  recurringInvoiceId?: string;
  invoiceItems: InvoiceItem[];
  memo?: string;
  subtotal: number;
  discountAmount?: number;
  taxAmount?: number;
  sendReceipt: boolean;
  customerNotes?: string;
  termsAndConditions?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  accountId: string;
  revenueCategory: RevenueCategory;
  taxable: boolean;
  fundId?: string;
  departmentId?: string;
  projectId?: string;
  metadata?: Record<string, any>;
  discountPercent?: number;
}

export interface RecurringInvoice {
  id: string;
  customerId: string;
  description: string;
  amount: number;
  frequency: RecurrenceFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: Date;
  endDate?: Date;
  accountId: string;
  revenueCategory: RevenueCategory;
  nextGenerationDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastGeneratedDate?: Date;
  notes?: string;
  invoiceTemplate?: Partial<Invoice>;
}

export interface ReceivablePayment {
  id: string;
  invoiceId: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber?: string;
  accountId: string;
  checkNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  processedAt?: Date;
  transactionId?: string;
  attachments?: Attachment[];
  depositDate?: Date;
  receiptSent: boolean;
  receiptSentAt?: Date;
}

export interface CustomerCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Receipt {
  id: string;
  paymentId: string;
  receiptNumber: string;
  date: Date;
  amount: number;
  customerId: string;
  createdAt: Date;
  sentAt?: Date;
  sentTo?: string;
  fileUrl?: string;
}

// Budgeting System Types
export enum BudgetStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

export enum BudgetType {
  ANNUAL = 'ANNUAL',
  QUARTERLY = 'QUARTERLY',
  MONTHLY = 'MONTHLY',
  PROJECT = 'PROJECT',
  PROGRAM = 'PROGRAM',
  DEPARTMENT = 'DEPARTMENT'
}

export enum BudgetPeriodType {
  ANNUAL = 'ANNUAL',
  QUARTERLY = 'QUARTERLY',
  MONTHLY = 'MONTHLY'
}

export interface Budget {
  id: string;
  name: string;
  description: string;
  fiscalYearId: string;
  type: BudgetType;
  status: BudgetStatus;
  createdById: string;
  approvedById?: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  notes?: string;
  departmentId?: string;
  programId?: string;
  projectId?: string;
  fundId?: string;
  parentBudgetId?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  isCurrent: boolean;
  periodType: BudgetPeriodType;
  version: number;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  accountId: string;
  name: string;
  description: string;
  amount: number;
  notes?: string;
  departmentId?: string;
  programId?: string;
  projectId?: string;
  fundId?: string;
  periodDistribution: BudgetPeriodDistribution[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetPeriodDistribution {
  id: string;
  budgetItemId: string;
  periodNumber: number;
  periodName: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetRevision {
  id: string;
  budgetId: string;
  revisionNumber: number;
  description: string;
  reason: string;
  status: BudgetStatus;
  createdById: string;
  approvedById?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  previousTotalAmount: number;
  newTotalAmount: number;
  changes: BudgetRevisionChange[];
}

export interface BudgetRevisionChange {
  id: string;
  budgetRevisionId: string;
  budgetItemId?: string;
  accountId?: string;
  changeType: 'ADD' | 'MODIFY' | 'REMOVE';
  description: string;
  previousAmount: number;
  newAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  type: BudgetType;
  isDefault: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  items: BudgetTemplateItem[];
}

export interface BudgetTemplateItem {
  id: string;
  budgetTemplateId: string;
  accountId: string;
  name: string;
  description: string;
  defaultAmount: number;
  distributionPattern: 'EQUAL' | 'FRONT_LOADED' | 'BACK_LOADED' | 'SEASONAL' | 'CUSTOM';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetVarianceReport {
  id: string;
  budgetId: string;
  name: string;
  description: string;
  periodType: BudgetPeriodType;
  asOfDate: Date;
  createdById: string;
  createdAt: Date;
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  variancePercentage: number;
  items: BudgetVarianceItem[];
}

export interface BudgetVarianceItem {
  id: string;
  budgetVarianceReportId: string;
  budgetItemId: string;
  accountId: string;
  name: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  periodDetails: BudgetVariancePeriodDetail[];
}

export interface BudgetVariancePeriodDetail {
  id: string;
  budgetVarianceItemId: string;
  periodNumber: number;
  periodName: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  description?: string;
  departmentId?: string;
  managerId?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  programId?: string;
  departmentId?: string;
  managerId?: string;
  startDate: Date;
  endDate?: Date;
  status: 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  budget?: number;
  actualSpend?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tuition Credit Management Types
export enum TuitionCreditStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  VOIDED = 'VOIDED'
}

export enum ProviderType {
  CENTER = 'CENTER',
  HOME = 'HOME',
  SCHOOL = 'SCHOOL',
  OTHER = 'OTHER'
}

export enum ProviderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export enum ProviderQualityRating {
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
  LEVEL_4 = 'LEVEL_4',
  LEVEL_5 = 'LEVEL_5',
  UNRATED = 'UNRATED'
}

export enum PaymentPriority {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Provider extends Vendor {
  providerType: ProviderType;
  providerStatus: ProviderStatus;
  licenseNumber?: string;
  qualityRating: ProviderQualityRating;
  enrollmentCapacity?: number;
  currentEnrollment?: number;
  contactEmail: string;
  contactPhone: string;
  bankAccountInfo?: {
    accountNumber: string;
    routingNumber: string;
    accountType: 'CHECKING' | 'SAVINGS';
    accountName: string;
  };
  paymentMethod: PaymentMethod;
  paymentTerms: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  yearToDateCredits: number;
  qualityImprovementGrantEligible: boolean;
  lastQualityImprovementGrantDate?: Date;
  notes?: string;
}

export interface TuitionCredit extends Transaction {
  providerId: string;
  studentId: string;
  studentName: string;
  creditPeriodStart: Date;
  creditPeriodEnd: Date;
  creditAmount: number;
  familyPortion: number;
  dppPortion: number;
  creditStatus: TuitionCreditStatus;
  approvalChain: string[];
  approvalDate?: Date;
  approvedById?: string;
  rejectionReason?: string;
  paymentBatchId?: string;
  paymentDate?: Date;
  processingNotes?: string;
  adjustmentNotes?: string;
  isAdjustment: boolean;
  originalCreditId?: string;
}

export interface TuitionCreditBatch {
  id: string;
  name: string;
  description: string;
  periodStart: Date;
  periodEnd: Date;
  status: TuitionCreditStatus;
  totalAmount: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  processedById?: string;
  providerIds: string[];
  creditIds: string[];
  notes?: string;
}

export interface ProviderPayment {
  id: string;
  providerId: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string;
  reference?: string;
  accountId: string;
  batchId?: string;
  tuitionCreditIds: string[];
  qualityImprovementGrant: boolean;
  grantAmount?: number;
  grantReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  processedAt?: Date;
  processedById?: string;
  voidedAt?: Date;
  voidedById?: string;
  voidReason?: string;
  paymentPriority: PaymentPriority;
}

export interface ProviderPaymentBatch {
  id: string;
  name: string;
  description: string;
  date: Date;
  status: PaymentStatus;
  totalAmount: number;
  providerCount: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  processedById?: string;
  paymentIds: string[];
  payfileGenerated: boolean;
  payfileGeneratedAt?: Date;
  payfileUrl?: string;
  notes?: string;
}

// Bank Reconciliation Types
export enum BankAccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  MONEY_MARKET = 'MONEY_MARKET',
  CREDIT_CARD = 'CREDIT_CARD',
  OTHER = 'OTHER'
}

export enum BankAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING'
}

export enum ReconciliationStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED'
}

export enum TransactionMatchStatus {
  UNMATCHED = 'UNMATCHED',
  MATCHED = 'MATCHED',
  MANUALLY_MATCHED = 'MANUALLY_MATCHED',
  EXCLUDED = 'EXCLUDED',
  ADDED_MANUALLY = 'ADDED_MANUALLY',
  NEEDS_REVIEW = 'NEEDS_REVIEW'
}

export interface BankAccount {
  id: string;
  accountId: string; // References ChartOfAccount
  name: string;
  description?: string;
  accountNumber: string; // Masked/partial account number for display
  routingNumber?: string;
  bankName: string;
  type: BankAccountType;
  status: BankAccountStatus;
  openingBalance: number;
  currentBalance: number;
  asOfDate: Date;
  lastReconciliationDate?: Date;
  lastImportDate?: Date;
  defaultCategoryId?: string; // Default GL account for categorizing transactions
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  allowManualReconciliation: boolean;
  allowAutomaticImport: boolean;
  isDefault: boolean;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  transactionId?: string; // Optional reference to a Transaction in the GL
  date: Date;
  amount: number;
  description: string;
  reference?: string;
  checkNumber?: string;
  type: 'CREDIT' | 'DEBIT';
  category?: string;
  matchStatus: TransactionMatchStatus;
  matchedTransactionId?: string;
  matchConfidence?: number; // 0-100 score for auto-matching
  reconciliationId?: string;
  importId?: string;
  importedAt?: Date;
  notes?: string;
  statementDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  isRecurring?: boolean;
  recurringPatternId?: string;
  metadata?: Record<string, any>; // For storing additional bank-provided data
}

export interface BankReconciliation {
  id: string;
  bankAccountId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  startingBalance: number;
  endingBalance: number;
  statementBalance: number;
  adjustedStatementBalance: number;
  unreconciled: number;
  status: ReconciliationStatus;
  isAutoReconciled: boolean;
  lastActivity: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  completedById?: string;
  notes?: string;
}

export interface BankStatementAdjustment {
  id: string;
  reconciliationId: string;
  description: string;
  amount: number;
  type: 'ADD' | 'SUBTRACT';
  category: 'DEPOSIT_IN_TRANSIT' | 'OUTSTANDING_CHECK' | 'BANK_ERROR' | 'INTEREST' | 'FEE' | 'OTHER';
  date: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface RecurringTransactionPattern {
  id: string;
  bankAccountId: string;
  description: string;
  matchPattern: string; // Regex or text pattern to match descriptions
  expectedAmount?: number;
  expectedAmountTolerance?: number; // Amount can vary by +/- this value
  frequency: RecurrenceFrequency;
  defaultAccountId?: string; // For auto-categorization
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  notes?: string;
}

// Asset Management Types
export enum AssetType {
  EQUIPMENT = 'EQUIPMENT',
  FURNITURE = 'FURNITURE',
  COMPUTER_HARDWARE = 'COMPUTER_HARDWARE',
  COMPUTER_SOFTWARE = 'COMPUTER_SOFTWARE',
  VEHICLE = 'VEHICLE',
  BUILDING = 'BUILDING',
  LAND = 'LAND',
  LEASEHOLD_IMPROVEMENT = 'LEASEHOLD_IMPROVEMENT',
  INTANGIBLE = 'INTANGIBLE',
  OTHER = 'OTHER'
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  DISPOSED = 'DISPOSED',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  PENDING = 'PENDING'
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  DECLINING_BALANCE = 'DECLINING_BALANCE',
  DOUBLE_DECLINING_BALANCE = 'DOUBLE_DECLINING_BALANCE',
  UNITS_OF_PRODUCTION = 'UNITS_OF_PRODUCTION',
  SUM_OF_YEARS_DIGITS = 'SUM_OF_YEARS_DIGITS',
  NONE = 'NONE'
}

export enum AssetDisposalMethod {
  SOLD = 'SOLD',
  DONATED = 'DONATED',
  SCRAPPED = 'SCRAPPED',
  TRADED_IN = 'TRADED_IN',
  STOLEN = 'STOLEN',
  LOST = 'LOST',
  OTHER = 'OTHER'
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  assetNumber: string;
  serialNumber?: string;
  type: AssetType;
  status: AssetStatus;
  location?: string;
  department?: string;
  assignedTo?: string;
  purchaseDate: Date;
  inServiceDate: Date;
  purchasePrice: number;
  residualValue: number;
  currentValue: number;
  usefulLifeYears: number;
  usefulLifeMonths: number;
  depreciationMethod: DepreciationMethod;
  accountId: string;
  accumulatedDepreciationAccountId: string;
  depreciationExpenseAccountId: string;
  lastDepreciationDate?: Date;
  warrantyExpirationDate?: Date;
  maintenanceSchedule?: string;
  notes?: string;
  tags?: string[];
  barcode?: string;
  imageUrl?: string;
  vendorId?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  fundId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById?: string;
}

export interface AssetDepreciationSchedule {
  id: string;
  assetId: string;
  fiscalYear: string;
  fiscalPeriod: string;
  depreciationDate: Date;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  bookValue: number;
  journalEntryId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetDisposal {
  id: string;
  assetId: string;
  disposalDate: Date;
  disposalMethod: AssetDisposalMethod;
  salePrice?: number;
  buyerId?: string;
  disposalCosts?: number;
  gainLoss: number;
  journalEntryId?: string;
  notes?: string;
  receiptUrl?: string;
  approvedById?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
}

export interface AssetMaintenance {
  id: string;
  assetId: string;
  maintenanceType: string;
  description: string;
  provider: string;
  date: Date;
  cost: number;
  nextMaintenanceDate?: Date;
  notes?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
}

export interface AssetTransfer {
  id: string;
  assetId: string;
  previousDepartment?: string;
  newDepartment?: string;
  previousLocation?: string;
  newLocation?: string;
  previousAssignee?: string;
  newAssignee?: string;
  transferDate: Date;
  reason: string;
  notes?: string;
  approvedById?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  defaultDepreciationMethod: DepreciationMethod;
  defaultUsefulLifeYears: number;
  defaultType: AssetType;
  defaultDepreciationAccountId: string;
  defaultAssetAccountId: string;
  createdAt: Date;
  updatedAt: Date;
}