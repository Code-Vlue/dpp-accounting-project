// src/lib/finance/accounts-payable-service.ts
import {
  Vendor,
  VendorType,
  VendorStatus,
  Bill,
  BillItem,
  RecurringBill,
  Payment,
  PaymentMethod,
  PaymentStatus,
  TransactionStatus,
  TransactionType,
  TaxDocument,
  TaxFormType,
  ExpenseCategory,
  Address,
  Transaction,
  TransactionEntry,
  VendorCategory,
  RecurrenceFrequency,
  FiscalYear,
  FiscalPeriod
} from '@/types/finance';
import { financeService } from './finance-service';
import { generalLedgerService } from './general-ledger-service';

// Mock data for development
const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Bright Horizons Preschool',
    vendorNumber: 'V1001',
    type: VendorType.PROVIDER,
    status: VendorStatus.ACTIVE,
    contactName: 'Sarah Johnson',
    email: 'sarah@brighthorizons.example',
    phone: '303-555-1234',
    address: {
      street1: '123 Learning Lane',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'USA'
    },
    paymentTerms: 'Net 30',
    defaultAccountId: '6', // Tuition Credit Expense
    defaultExpenseCategory: ExpenseCategory.TUITION_CREDITS,
    taxIdentification: '82-1234567',
    taxForm: TaxFormType.W9,
    isProvider: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    createdById: 'user1',
    yearToDatePayments: 145000,
    lastPaymentDate: new Date('2024-03-15')
  },
  {
    id: '2',
    name: 'Little Learners Academy',
    vendorNumber: 'V1002',
    type: VendorType.PROVIDER,
    status: VendorStatus.ACTIVE,
    contactName: 'Michael Smith',
    email: 'michael@littlelearners.example',
    phone: '303-555-2345',
    address: {
      street1: '456 Education Ave',
      city: 'Denver',
      state: 'CO',
      zipCode: '80203',
      country: 'USA'
    },
    paymentTerms: 'Net 30',
    defaultAccountId: '6', // Tuition Credit Expense
    defaultExpenseCategory: ExpenseCategory.TUITION_CREDITS,
    taxIdentification: '82-2345678',
    taxForm: TaxFormType.W9,
    isProvider: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    createdById: 'user1',
    yearToDatePayments: 98000,
    lastPaymentDate: new Date('2024-03-15')
  },
  {
    id: '3',
    name: 'Office Supply Co',
    vendorNumber: 'V2001',
    type: VendorType.SUPPLIER,
    status: VendorStatus.ACTIVE,
    contactName: 'Jennifer Lee',
    email: 'sales@officesupplyco.example',
    phone: '800-555-7890',
    address: {
      street1: '789 Commerce Way',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    paymentTerms: 'Net 15',
    defaultAccountId: '8', // Office Supplies
    defaultExpenseCategory: ExpenseCategory.SUPPLIES,
    taxIdentification: '45-6789012',
    taxForm: TaxFormType.W9,
    isProvider: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    createdById: 'user1',
    yearToDatePayments: 3500,
    lastPaymentDate: new Date('2024-02-28')
  },
  {
    id: '4',
    name: 'Tech Solutions LLC',
    vendorNumber: 'V3001',
    type: VendorType.CONTRACTOR,
    status: VendorStatus.ACTIVE,
    contactName: 'David Wilson',
    email: 'david@techsolutions.example',
    phone: '415-555-3456',
    address: {
      street1: '101 Tech Blvd',
      street2: 'Suite 400',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    paymentTerms: 'Net 15',
    defaultAccountId: '7', // Administrative Expenses
    defaultExpenseCategory: ExpenseCategory.TECHNOLOGY,
    taxIdentification: '94-3456789',
    taxForm: TaxFormType.W9,
    notes: 'IT support and website maintenance',
    isProvider: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdById: 'user1',
    website: 'https://techsolutions.example',
    yearToDatePayments: 12000,
    lastPaymentDate: new Date('2024-03-01')
  }
];

const mockBills: Bill[] = [
  {
    id: '1',
    type: TransactionType.ACCOUNTS_PAYABLE,
    date: new Date('2024-02-15'),
    description: 'February 2024 Tuition Credits',
    reference: 'INV-2024-001',
    amount: 75000,
    status: TransactionStatus.PAID,
    fiscalYearId: '1',
    fiscalPeriodId: '2',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-20'),
    createdById: 'user1',
    approvedById: 'user2',
    approvedAt: new Date('2024-02-12'),
    postedAt: new Date('2024-02-15'),
    entries: [
      {
        id: '1',
        transactionId: '1',
        accountId: '6', // Tuition Credit Expense
        description: 'February tuition credits',
        debitAmount: 75000,
        creditAmount: 0,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: '2',
        transactionId: '1',
        accountId: '3', // Accounts Payable
        description: 'February tuition credits',
        debitAmount: 0,
        creditAmount: 75000,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
      }
    ],
    vendorId: '1',
    invoiceNumber: 'BH-2024-02',
    invoiceDate: new Date('2024-02-05'),
    dueDate: new Date('2024-03-05'),
    amountDue: 75000,
    amountPaid: 75000,
    paymentStatus: TransactionStatus.PAID,
    paymentTerms: 'Net 30',
    billItems: [
      {
        id: '1',
        billId: '1',
        description: 'Tuition credits for 25 students',
        quantity: 25,
        unitPrice: 3000,
        amount: 75000,
        accountId: '6', // Tuition Credit Expense
        expenseCategory: ExpenseCategory.TUITION_CREDITS,
        taxable: false
      }
    ]
  },
  {
    id: '2',
    type: TransactionType.ACCOUNTS_PAYABLE,
    date: new Date('2024-03-10'),
    description: 'Office supplies purchase',
    reference: 'INV-2024-002',
    amount: 1250,
    status: TransactionStatus.POSTED,
    fiscalYearId: '1',
    fiscalPeriodId: '3',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-10'),
    createdById: 'user1',
    approvedById: 'user2',
    approvedAt: new Date('2024-03-07'),
    postedAt: new Date('2024-03-10'),
    entries: [
      {
        id: '3',
        transactionId: '2',
        accountId: '8', // Office Supplies
        description: 'Office supplies purchase',
        debitAmount: 1250,
        creditAmount: 0,
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-05')
      },
      {
        id: '4',
        transactionId: '2',
        accountId: '3', // Accounts Payable
        description: 'Office supplies purchase',
        debitAmount: 0,
        creditAmount: 1250,
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-05')
      }
    ],
    vendorId: '3',
    invoiceNumber: 'OSC-98765',
    invoiceDate: new Date('2024-03-01'),
    dueDate: new Date('2024-03-15'),
    amountDue: 1250,
    amountPaid: 0,
    paymentStatus: TransactionStatus.PENDING_APPROVAL,
    paymentTerms: 'Net 15',
    billItems: [
      {
        id: '2',
        billId: '2',
        description: 'Paper, pens, and folders',
        quantity: 1,
        unitPrice: 750,
        amount: 750,
        accountId: '8', // Office Supplies
        expenseCategory: ExpenseCategory.SUPPLIES,
        taxable: true
      },
      {
        id: '3',
        billId: '2',
        description: 'Printer toner',
        quantity: 2,
        unitPrice: 250,
        amount: 500,
        accountId: '8', // Office Supplies
        expenseCategory: ExpenseCategory.SUPPLIES,
        taxable: true
      }
    ]
  },
  {
    id: '3',
    type: TransactionType.ACCOUNTS_PAYABLE,
    date: new Date('2024-03-20'),
    description: 'IT Support - March 2024',
    reference: 'INV-2024-003',
    amount: 3000,
    status: TransactionStatus.PENDING_APPROVAL,
    fiscalYearId: '1',
    fiscalPeriodId: '3',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    createdById: 'user1',
    entries: [
      {
        id: '5',
        transactionId: '3',
        accountId: '7', // Administrative Expenses
        description: 'IT support services',
        debitAmount: 3000,
        creditAmount: 0,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },
      {
        id: '6',
        transactionId: '3',
        accountId: '3', // Accounts Payable
        description: 'IT support services',
        debitAmount: 0,
        creditAmount: 3000,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }
    ],
    vendorId: '4',
    invoiceNumber: 'TS-2024-03',
    invoiceDate: new Date('2024-03-15'),
    dueDate: new Date('2024-03-30'),
    amountDue: 3000,
    amountPaid: 0,
    paymentStatus: TransactionStatus.PENDING_APPROVAL,
    paymentTerms: 'Net 15',
    billItems: [
      {
        id: '4',
        billId: '3',
        description: 'Monthly IT support - 20 hours',
        quantity: 20,
        unitPrice: 150,
        amount: 3000,
        accountId: '7', // Administrative Expenses
        expenseCategory: ExpenseCategory.TECHNOLOGY,
        taxable: false
      }
    ]
  }
];

const mockRecurringBills: RecurringBill[] = [
  {
    id: '1',
    vendorId: '1',
    description: 'Monthly Tuition Credits',
    amount: 75000,
    frequency: RecurrenceFrequency.MONTHLY,
    dayOfMonth: 5,
    startDate: new Date('2024-01-05'),
    accountId: '6', // Tuition Credit Expense
    expenseCategory: ExpenseCategory.TUITION_CREDITS,
    nextGenerationDate: new Date('2024-04-05'),
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastGeneratedDate: new Date('2024-03-05'),
    notes: 'Automatic monthly tuition credit allocation'
  },
  {
    id: '2',
    vendorId: '4',
    description: 'IT Support Services',
    amount: 3000,
    frequency: RecurrenceFrequency.MONTHLY,
    dayOfMonth: 15,
    startDate: new Date('2024-01-15'),
    accountId: '7', // Administrative Expenses
    expenseCategory: ExpenseCategory.TECHNOLOGY,
    nextGenerationDate: new Date('2024-04-15'),
    active: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    lastGeneratedDate: new Date('2024-03-15'),
    notes: 'Monthly IT support contract'
  }
];

const mockPayments: Payment[] = [
  {
    id: '1',
    billId: '1',
    amount: 75000,
    date: new Date('2024-02-20'),
    method: PaymentMethod.ACH,
    status: PaymentStatus.COMPLETED,
    referenceNumber: 'ACH-2024-001',
    accountId: '1', // Cash
    notes: 'February tuition credit payment',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
    createdById: 'user1',
    processedAt: new Date('2024-02-20'),
    transactionId: '5' // Assuming this is the transaction ID for the payment
  }
];

const mockTaxDocuments: TaxDocument[] = [
  {
    id: '1',
    vendorId: '1',
    type: TaxFormType.W9,
    year: 2024,
    fileUrl: '/documents/taxes/w9-brighthorizons-2024.pdf',
    uploaded: true,
    uploadedAt: new Date('2024-01-10'),
    uploadedById: 'user1',
    expirationDate: new Date('2027-01-10')
  },
  {
    id: '2',
    vendorId: '2',
    type: TaxFormType.W9,
    year: 2024,
    fileUrl: '/documents/taxes/w9-littlelearners-2024.pdf',
    uploaded: true,
    uploadedAt: new Date('2024-01-12'),
    uploadedById: 'user1',
    expirationDate: new Date('2027-01-12')
  }
];

const mockVendorCategories: VendorCategory[] = [
  {
    id: '1',
    name: 'Preschool Providers',
    description: 'Authorized preschool providers for tuition credit program',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Office Suppliers',
    description: 'Office supply vendors',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'IT Services',
    description: 'Technology and IT service providers',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Accounts Payable Service Class
class AccountsPayableService {
  private vendors: Vendor[] = mockVendors;
  private bills: Bill[] = mockBills;
  private recurringBills: RecurringBill[] = mockRecurringBills;
  private payments: Payment[] = mockPayments;
  private taxDocuments: TaxDocument[] = mockTaxDocuments;
  private vendorCategories: VendorCategory[] = mockVendorCategories;

  // Vendor Methods
  async getAllVendors(): Promise<Vendor[]> {
    return Promise.resolve([...this.vendors]);
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    const vendor = this.vendors.find(v => v.id === id);
    return Promise.resolve(vendor || null);
  }

  async getVendorsByType(type: VendorType): Promise<Vendor[]> {
    const filteredVendors = this.vendors.filter(v => v.type === type);
    return Promise.resolve(filteredVendors);
  }

  async createVendor(vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'yearToDatePayments'>): Promise<Vendor> {
    const newVendor: Vendor = {
      ...vendor,
      id: (this.vendors.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      yearToDatePayments: 0
    };
    
    this.vendors.push(newVendor);
    return Promise.resolve(newVendor);
  }

  async updateVendor(id: string, vendorData: Partial<Vendor>): Promise<Vendor | null> {
    const index = this.vendors.findIndex(v => v.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.vendors[index] = {
      ...this.vendors[index],
      ...vendorData,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.vendors[index]);
  }

  async deactivateVendor(id: string): Promise<boolean> {
    const index = this.vendors.findIndex(v => v.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.vendors[index] = {
      ...this.vendors[index],
      status: VendorStatus.INACTIVE,
      updatedAt: new Date()
    };
    
    return Promise.resolve(true);
  }

  // Bill Methods
  async getAllBills(): Promise<Bill[]> {
    return Promise.resolve([...this.bills]);
  }

  async getBillById(id: string): Promise<Bill | null> {
    const bill = this.bills.find(b => b.id === id);
    return Promise.resolve(bill || null);
  }

  async getBillsByVendor(vendorId: string): Promise<Bill[]> {
    const vendorBills = this.bills.filter(b => b.vendorId === vendorId);
    return Promise.resolve(vendorBills);
  }

  async getBillsByStatus(status: TransactionStatus): Promise<Bill[]> {
    const filteredBills = this.bills.filter(b => b.status === status);
    return Promise.resolve(filteredBills);
  }

  async createBill(billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'entries'>): Promise<Bill> {
    const { billItems, ...transactionData } = billData;
    
    // Create transaction entries from bill items
    const entries: TransactionEntry[] = [];
    
    // Debit entries for each bill item (expense accounts)
    for (const item of billItems) {
      entries.push({
        id: `draft-debit-${entries.length}`,
        transactionId: 'draft',
        accountId: item.accountId,
        description: item.description,
        debitAmount: item.amount,
        creditAmount: 0,
        fundId: item.fundId,
        departmentId: item.departmentId,
        projectId: item.projectId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Credit entry to accounts payable
    entries.push({
      id: `draft-credit-${entries.length}`,
      transactionId: 'draft',
      accountId: '3', // Accounts Payable (assuming this is the AP account)
      description: billData.description,
      debitAmount: 0,
      creditAmount: billData.amount,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create the bill
    const newBill: Bill = {
      ...transactionData,
      id: (this.bills.length + 1).toString(),
      type: TransactionType.ACCOUNTS_PAYABLE,
      status: TransactionStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      entries,
      billItems: billItems.map((item, index) => ({
        ...item,
        id: (index + 1).toString(),
        billId: (this.bills.length + 1).toString()
      }))
    };
    
    this.bills.push(newBill);
    return Promise.resolve(newBill);
  }

  async updateBill(id: string, billData: Partial<Bill>): Promise<Bill | null> {
    const index = this.bills.findIndex(b => b.id === id);
    if (index === -1) return Promise.resolve(null);
    
    // Update the bill
    this.bills[index] = {
      ...this.bills[index],
      ...billData,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.bills[index]);
  }

  async approveBill(id: string, approverId: string): Promise<Bill | null> {
    const index = this.bills.findIndex(b => b.id === id);
    if (index === -1) return Promise.resolve(null);
    
    if (this.bills[index].status !== TransactionStatus.DRAFT && 
        this.bills[index].status !== TransactionStatus.PENDING_APPROVAL) {
      throw new Error('Bill must be in DRAFT or PENDING_APPROVAL status to be approved');
    }
    
    this.bills[index] = {
      ...this.bills[index],
      status: TransactionStatus.APPROVED,
      approvedById: approverId,
      approvedAt: new Date(),
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.bills[index]);
  }

  async postBill(id: string): Promise<Bill | null> {
    const index = this.bills.findIndex(b => b.id === id);
    if (index === -1) return Promise.resolve(null);
    
    if (this.bills[index].status !== TransactionStatus.APPROVED) {
      throw new Error('Bill must be approved before posting');
    }
    
    this.bills[index] = {
      ...this.bills[index],
      status: TransactionStatus.POSTED,
      postedAt: new Date(),
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.bills[index]);
  }

  async voidBill(id: string, voidedById: string, voidReason: string): Promise<Bill | null> {
    const index = this.bills.findIndex(b => b.id === id);
    if (index === -1) return Promise.resolve(null);
    
    if (this.bills[index].status === TransactionStatus.PAID || 
        this.bills[index].status === TransactionStatus.PARTIALLY_PAID) {
      throw new Error('Cannot void a bill that has been paid');
    }
    
    this.bills[index] = {
      ...this.bills[index],
      status: TransactionStatus.VOIDED,
      voidedById,
      voidedAt: new Date(),
      voidReason,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.bills[index]);
  }

  // Recurring Bill Methods
  async getAllRecurringBills(): Promise<RecurringBill[]> {
    return Promise.resolve([...this.recurringBills]);
  }

  async getRecurringBillById(id: string): Promise<RecurringBill | null> {
    const recurringBill = this.recurringBills.find(rb => rb.id === id);
    return Promise.resolve(recurringBill || null);
  }

  async getRecurringBillsByVendor(vendorId: string): Promise<RecurringBill[]> {
    const vendorRecurringBills = this.recurringBills.filter(rb => rb.vendorId === vendorId);
    return Promise.resolve(vendorRecurringBills);
  }

  async createRecurringBill(recurringBill: Omit<RecurringBill, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringBill> {
    const newRecurringBill: RecurringBill = {
      ...recurringBill,
      id: (this.recurringBills.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.recurringBills.push(newRecurringBill);
    return Promise.resolve(newRecurringBill);
  }

  async updateRecurringBill(id: string, data: Partial<RecurringBill>): Promise<RecurringBill | null> {
    const index = this.recurringBills.findIndex(rb => rb.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.recurringBills[index] = {
      ...this.recurringBills[index],
      ...data,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.recurringBills[index]);
  }

  async deactivateRecurringBill(id: string): Promise<boolean> {
    const index = this.recurringBills.findIndex(rb => rb.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.recurringBills[index] = {
      ...this.recurringBills[index],
      active: false,
      updatedAt: new Date()
    };
    
    return Promise.resolve(true);
  }

  async generateBillFromRecurring(recurringBillId: string): Promise<Bill | null> {
    const recurringBill = await this.getRecurringBillById(recurringBillId);
    if (!recurringBill) return Promise.resolve(null);
    
    const vendor = await this.getVendorById(recurringBill.vendorId);
    if (!vendor) return Promise.resolve(null);
    
    const { currentFiscalYear, currentFiscalPeriod } = await financeService.getCurrentFiscalYearAndPeriod();
    if (!currentFiscalYear || !currentFiscalPeriod) {
      throw new Error('No active fiscal period found');
    }
    
    // Generate a new invoice number
    const invoiceDate = new Date();
    const invoiceNumber = `AUTO-${recurringBill.id}-${invoiceDate.getFullYear()}${(invoiceDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Calculate due date based on vendor payment terms or default to 30 days
    const dueDate = new Date(invoiceDate);
    const paymentTerms = vendor.paymentTerms || 'Net 30';
    const daysToAdd = parseInt(paymentTerms.replace('Net ', ''), 10) || 30;
    dueDate.setDate(dueDate.getDate() + daysToAdd);
    
    // Create bill item
    const billItem: Omit<BillItem, 'id' | 'billId'> = {
      description: recurringBill.description,
      quantity: 1,
      unitPrice: recurringBill.amount,
      amount: recurringBill.amount,
      accountId: recurringBill.accountId,
      expenseCategory: recurringBill.expenseCategory,
      taxable: false
    };
    
    // Create the bill
    const billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'entries'> = {
      type: TransactionType.ACCOUNTS_PAYABLE,
      date: invoiceDate,
      description: `Auto-generated: ${recurringBill.description}`,
      amount: recurringBill.amount,
      status: TransactionStatus.DRAFT,
      fiscalYearId: currentFiscalYear.id,
      fiscalPeriodId: currentFiscalPeriod.id,
      createdById: 'system',
      vendorId: recurringBill.vendorId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      amountDue: recurringBill.amount,
      amountPaid: 0,
      paymentStatus: TransactionStatus.DRAFT,
      paymentTerms,
      recurringBillId: recurringBill.id,
      billItems: [billItem as BillItem]
    };
    
    // Create the bill
    const newBill = await this.createBill(billData);
    
    // Update the recurring bill with the last generated date
    await this.updateRecurringBill(recurringBill.id, {
      lastGeneratedDate: invoiceDate,
      nextGenerationDate: this.calculateNextGenerationDate(recurringBill)
    });
    
    return newBill;
  }

  // Calculate the next generation date based on frequency
  private calculateNextGenerationDate(recurringBill: RecurringBill): Date {
    const now = new Date();
    const nextDate = new Date(now);
    
    switch (recurringBill.frequency) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'BIWEEKLY':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        if (recurringBill.dayOfMonth) {
          nextDate.setDate(recurringBill.dayOfMonth);
        }
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3);
        if (recurringBill.dayOfMonth) {
          nextDate.setDate(recurringBill.dayOfMonth);
        }
        break;
      case 'ANNUALLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        if (recurringBill.dayOfMonth) {
          nextDate.setDate(recurringBill.dayOfMonth);
        }
        break;
    }
    
    return nextDate;
  }

  // Payment Methods
  async getAllPayments(): Promise<Payment[]> {
    return Promise.resolve([...this.payments]);
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const payment = this.payments.find(p => p.id === id);
    return Promise.resolve(payment || null);
  }

  async getPaymentsByBill(billId: string): Promise<Payment[]> {
    const billPayments = this.payments.filter(p => p.billId === billId);
    return Promise.resolve(billPayments);
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    // Get the bill to update its payment status
    const bill = await this.getBillById(paymentData.billId);
    if (!bill) {
      throw new Error(`Bill with ID ${paymentData.billId} not found`);
    }
    
    // Create the payment
    const newPayment: Payment = {
      ...paymentData,
      id: (this.payments.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.payments.push(newPayment);
    
    // Update the bill's payment status and amount paid
    const totalPaid = bill.amountPaid + paymentData.amount;
    let paymentStatus: TransactionStatus;
    
    if (totalPaid >= bill.amountDue) {
      paymentStatus = TransactionStatus.PAID;
    } else {
      paymentStatus = TransactionStatus.PARTIALLY_PAID;
    }
    
    await this.updateBill(bill.id, {
      amountPaid: totalPaid,
      paymentStatus,
      status: paymentStatus
    });
    
    // Update vendor's year-to-date payments
    const vendor = await this.getVendorById(bill.vendorId);
    if (vendor) {
      await this.updateVendor(vendor.id, {
        yearToDatePayments: vendor.yearToDatePayments + paymentData.amount,
        lastPaymentDate: paymentData.date
      });
    }
    
    return Promise.resolve(newPayment);
  }

  async processPayment(id: string): Promise<Payment | null> {
    const index = this.payments.findIndex(p => p.id === id);
    if (index === -1) return Promise.resolve(null);
    
    // Update payment status
    this.payments[index] = {
      ...this.payments[index],
      status: PaymentStatus.COMPLETED,
      processedAt: new Date(),
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.payments[index]);
  }

  async voidPayment(id: string, reason: string): Promise<Payment | null> {
    const index = this.payments.findIndex(p => p.id === id);
    if (index === -1) return Promise.resolve(null);
    
    if (this.payments[index].status === PaymentStatus.COMPLETED) {
      // Revert the bill payment status
      const bill = await this.getBillById(this.payments[index].billId);
      if (bill) {
        const updatedAmountPaid = bill.amountPaid - this.payments[index].amount;
        let updatedStatus: TransactionStatus;
        
        if (updatedAmountPaid <= 0) {
          updatedStatus = TransactionStatus.POSTED;
        } else if (updatedAmountPaid < bill.amountDue) {
          updatedStatus = TransactionStatus.PARTIALLY_PAID;
        } else {
          updatedStatus = TransactionStatus.PAID;
        }
        
        await this.updateBill(bill.id, {
          amountPaid: updatedAmountPaid,
          paymentStatus: updatedStatus,
          status: updatedStatus
        });
        
        // Update vendor's year-to-date payments
        const vendor = await this.getVendorById(bill.vendorId);
        if (vendor) {
          await this.updateVendor(vendor.id, {
            yearToDatePayments: vendor.yearToDatePayments - this.payments[index].amount
          });
        }
      }
    }
    
    // Update payment status
    this.payments[index] = {
      ...this.payments[index],
      status: PaymentStatus.VOIDED,
      notes: this.payments[index].notes ? `${this.payments[index].notes}\nVoided: ${reason}` : `Voided: ${reason}`,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.payments[index]);
  }

  // Tax Document Methods
  async getTaxDocumentsByVendor(vendorId: string): Promise<TaxDocument[]> {
    const vendorDocs = this.taxDocuments.filter(td => td.vendorId === vendorId);
    return Promise.resolve(vendorDocs);
  }

  async uploadTaxDocument(taxDocument: Omit<TaxDocument, 'id' | 'uploadedAt'>): Promise<TaxDocument> {
    const newDocument: TaxDocument = {
      ...taxDocument,
      id: (this.taxDocuments.length + 1).toString(),
      uploadedAt: new Date(),
      uploaded: true
    };
    
    this.taxDocuments.push(newDocument);
    return Promise.resolve(newDocument);
  }

  // 1099 Preparation Methods
  async get1099Vendors(): Promise<Vendor[]> {
    const eligible1099Vendors = this.vendors.filter(v => 
      v.taxForm === TaxFormType.W9 && 
      v.yearToDatePayments > 600 && 
      !v.isProvider
    );
    
    return Promise.resolve(eligible1099Vendors);
  }

  async getVendorPaymentSummary(vendorId: string, year: number): Promise<{
    vendor: Vendor | null;
    totalPayments: number;
    payments: Payment[];
    bills: Bill[];
  }> {
    const vendor = await this.getVendorById(vendorId);
    if (!vendor) {
      return {
        vendor: null,
        totalPayments: 0,
        payments: [],
        bills: []
      };
    }
    
    // Get all bills for the vendor
    const vendorBills = await this.getBillsByVendor(vendorId);
    
    // Filter bills by year
    const yearBills = vendorBills.filter(b => 
      b.date.getFullYear() === year
    );
    
    // Get all payments for these bills
    let yearPayments: Payment[] = [];
    for (const bill of yearBills) {
      const billPayments = await this.getPaymentsByBill(bill.id);
      const filteredPayments = billPayments.filter(p => 
        p.date.getFullYear() === year && 
        p.status === PaymentStatus.COMPLETED
      );
      yearPayments = [...yearPayments, ...filteredPayments];
    }
    
    // Calculate total payments
    const totalPayments = yearPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      vendor,
      totalPayments,
      payments: yearPayments,
      bills: yearBills
    };
  }

  // Vendor Category Methods
  async getAllVendorCategories(): Promise<VendorCategory[]> {
    return Promise.resolve([...this.vendorCategories]);
  }

  async getVendorCategoryById(id: string): Promise<VendorCategory | null> {
    const category = this.vendorCategories.find(c => c.id === id);
    return Promise.resolve(category || null);
  }

  async createVendorCategory(category: Omit<VendorCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<VendorCategory> {
    const newCategory: VendorCategory = {
      ...category,
      id: (this.vendorCategories.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.vendorCategories.push(newCategory);
    return Promise.resolve(newCategory);
  }

  // Reporting Methods
  async getVendorAnalytics(): Promise<{
    totalVendors: number;
    activeVendors: number;
    totalSpend: number;
    vendorsByType: { type: VendorType; count: number }[];
    topVendorsBySpend: { vendor: Vendor; totalSpend: number }[];
  }> {
    const activeVendors = this.vendors.filter(v => v.status === VendorStatus.ACTIVE);
    const totalSpend = this.payments
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Group vendors by type
    const vendorsByType = Object.values(VendorType).map(type => ({
      type,
      count: this.vendors.filter(v => v.type === type).length
    }));
    
    // Get top vendors by spend
    const vendorSpendMap = new Map<string, number>();
    
    for (const vendor of this.vendors) {
      vendorSpendMap.set(vendor.id, vendor.yearToDatePayments);
    }
    
    const topVendorsBySpend = Array.from(vendorSpendMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([vendorId, totalSpend]) => ({
        vendor: this.vendors.find(v => v.id === vendorId)!,
        totalSpend
      }));
    
    return {
      totalVendors: this.vendors.length,
      activeVendors: activeVendors.length,
      totalSpend,
      vendorsByType,
      topVendorsBySpend
    };
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
    const now = new Date();
    const openBills = this.bills.filter(b => 
      b.status === TransactionStatus.POSTED || 
      b.status === TransactionStatus.APPROVED ||
      b.status === TransactionStatus.PARTIALLY_PAID
    );
    
    const pastDueBills = openBills.filter(b => 
      new Date(b.dueDate) < now
    );
    
    const totalOpenAmount = openBills.reduce((sum, bill) => sum + (bill.amountDue - bill.amountPaid), 0);
    const totalPastDueAmount = pastDueBills.reduce((sum, bill) => sum + (bill.amountDue - bill.amountPaid), 0);
    
    // Aging analysis
    const agingBuckets = {
      current: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90Plus': 0
    };
    
    for (const bill of openBills) {
      const daysOverdue = Math.floor((now.getTime() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      const outstandingAmount = bill.amountDue - bill.amountPaid;
      
      if (daysOverdue <= 0) {
        agingBuckets.current += outstandingAmount;
      } else if (daysOverdue <= 30) {
        agingBuckets['1-30'] += outstandingAmount;
      } else if (daysOverdue <= 60) {
        agingBuckets['31-60'] += outstandingAmount;
      } else if (daysOverdue <= 90) {
        agingBuckets['61-90'] += outstandingAmount;
      } else {
        agingBuckets['90Plus'] += outstandingAmount;
      }
    }
    
    return {
      totalOpenInvoices: openBills.length,
      totalPastDueInvoices: pastDueBills.length,
      totalOpenAmount,
      totalPastDueAmount,
      agingBuckets
    };
  }

  // Helper methods
  async getCurrentFiscalYearAndPeriod(): Promise<{
    currentFiscalYear: FiscalYear | null;
    currentFiscalPeriod: FiscalPeriod | null;
  }> {
    const currentFiscalYear = await financeService.getCurrentFiscalYear();
    const currentFiscalPeriod = await financeService.getCurrentFiscalPeriod();
    
    return {
      currentFiscalYear,
      currentFiscalPeriod
    };
  }
}

// Create and export singleton instance
export const accountsPayableService = new AccountsPayableService();