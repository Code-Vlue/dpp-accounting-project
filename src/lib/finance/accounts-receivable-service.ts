// src/lib/finance/accounts-receivable-service.ts
import { 
  Customer, 
  CustomerType, 
  CustomerStatus, 
  Invoice, 
  InvoiceItem, 
  InvoiceStatus, 
  RecurringInvoice, 
  ReceivablePayment, 
  PaymentMethod, 
  PaymentStatus, 
  RevenueCategory,
  TransactionType,
  TransactionStatus,
  TransactionEntry,
  Receipt,
  RecurrenceFrequency
} from '@/types/finance';
import { v4 as uuidv4 } from 'uuid';

// Mock data for development
const generateMockCustomers = (): Customer[] => {
  return [
    {
      id: '1',
      name: 'Denver Public Schools',
      customerNumber: 'C-1001',
      type: CustomerType.SCHOOL_DISTRICT,
      status: CustomerStatus.ACTIVE,
      contactName: 'Sarah Johnson',
      email: 'sjohnson@dps.org',
      phone: '303-555-1234',
      address: {
        street1: '1860 Lincoln Street',
        street2: 'Suite 1000',
        city: 'Denver',
        state: 'CO',
        zipCode: '80203',
        country: 'USA'
      },
      defaultAccountId: '101',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      createdById: 'user1',
      yearToDateReceivables: 125000,
      lastPaymentReceived: new Date('2024-03-15'),
      creditLimit: 250000,
      paymentTerms: 'Net 30'
    },
    {
      id: '2',
      name: 'Colorado Department of Education',
      customerNumber: 'C-1002',
      type: CustomerType.GOVERNMENT,
      status: CustomerStatus.ACTIVE,
      contactName: 'Michael Reynolds',
      email: 'michael.reynolds@cde.state.co.us',
      phone: '303-555-2345',
      address: {
        street1: '201 E Colfax Ave',
        city: 'Denver',
        state: 'CO',
        zipCode: '80203',
        country: 'USA'
      },
      defaultAccountId: '102',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      createdById: 'user1',
      yearToDateReceivables: 80000,
      lastPaymentReceived: new Date('2024-02-28'),
      creditLimit: 300000,
      paymentTerms: 'Net 45'
    },
    {
      id: '3',
      name: 'Gates Family Foundation',
      customerNumber: 'C-1003',
      type: CustomerType.FOUNDATION,
      status: CustomerStatus.ACTIVE,
      contactName: 'Lisa Martinez',
      email: 'lmartinez@gatesfoundation.org',
      phone: '303-555-3456',
      address: {
        street1: '1390 Lawrence Street',
        street2: 'Suite 400',
        city: 'Denver',
        state: 'CO',
        zipCode: '80204',
        country: 'USA'
      },
      defaultAccountId: '103',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      createdById: 'user1',
      yearToDateReceivables: 200000,
      lastPaymentReceived: new Date('2024-03-01'),
      creditLimit: 500000,
      paymentTerms: 'Net 30'
    },
    {
      id: '4',
      name: 'Mile High United Way',
      customerNumber: 'C-1004',
      type: CustomerType.NONPROFIT,
      status: CustomerStatus.ACTIVE,
      contactName: 'David Wilson',
      email: 'dwilson@unitedway.org',
      phone: '303-555-4567',
      address: {
        street1: '711 Park Avenue West',
        city: 'Denver',
        state: 'CO',
        zipCode: '80205',
        country: 'USA'
      },
      defaultAccountId: '104',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      createdById: 'user1',
      yearToDateReceivables: 45000,
      lastPaymentReceived: new Date('2024-03-10'),
      creditLimit: 100000,
      paymentTerms: 'Net 30'
    }
  ];
};

const generateMockInvoices = (): Invoice[] => {
  return [
    {
      id: '1',
      customerId: '1',
      invoiceNumber: 'INV-2024-001',
      invoiceDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-14'),
      amountDue: 25000,
      amountPaid: 25000,
      invoiceStatus: InvoiceStatus.PAID,
      paymentTerms: 'Net 30',
      sendReceipt: true,
      subtotal: 25000,
      type: TransactionType.ACCOUNTS_RECEIVABLE,
      date: new Date('2024-01-15'),
      description: 'Program Services Q1 2024',
      reference: 'REF-2401-DPS',
      amount: 25000,
      status: TransactionStatus.PAID,
      fiscalYearId: 'FY2024',
      fiscalPeriodId: 'Q1-2024',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-15'),
      createdById: 'user1',
      approvedById: 'user2',
      approvedAt: new Date('2024-01-16'),
      postedAt: new Date('2024-01-16'),
      entries: [],
      invoiceItems: [
        {
          id: '101',
          invoiceId: '1',
          description: 'Program development services',
          quantity: 1,
          unitPrice: 15000,
          amount: 15000,
          accountId: '201',
          revenueCategory: RevenueCategory.PROGRAM_REVENUE,
          taxable: false,
          fundId: 'F1'
        },
        {
          id: '102',
          invoiceId: '1',
          description: 'Training materials',
          quantity: 100,
          unitPrice: 100,
          amount: 10000,
          accountId: '202',
          revenueCategory: RevenueCategory.PROGRAM_REVENUE,
          taxable: false,
          fundId: 'F1'
        }
      ]
    },
    {
      id: '2',
      customerId: '2',
      invoiceNumber: 'INV-2024-002',
      invoiceDate: new Date('2024-02-01'),
      dueDate: new Date('2024-03-17'),
      amountDue: 40000,
      amountPaid: 40000,
      invoiceStatus: InvoiceStatus.PAID,
      paymentTerms: 'Net 45',
      sendReceipt: true,
      subtotal: 40000,
      type: TransactionType.ACCOUNTS_RECEIVABLE,
      date: new Date('2024-02-01'),
      description: 'Grant Administration Q1 2024',
      reference: 'REF-2402-CDE',
      amount: 40000,
      status: TransactionStatus.PAID,
      fiscalYearId: 'FY2024',
      fiscalPeriodId: 'Q1-2024',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-01'),
      createdById: 'user1',
      approvedById: 'user2',
      approvedAt: new Date('2024-02-02'),
      postedAt: new Date('2024-02-02'),
      entries: [],
      invoiceItems: [
        {
          id: '201',
          invoiceId: '2',
          description: 'Grant administration services',
          quantity: 1,
          unitPrice: 40000,
          amount: 40000,
          accountId: '203',
          revenueCategory: RevenueCategory.SERVICE_FEE,
          taxable: false,
          fundId: 'F2'
        }
      ]
    },
    {
      id: '3',
      customerId: '3',
      invoiceNumber: 'INV-2024-003',
      invoiceDate: new Date('2024-03-01'),
      dueDate: new Date('2024-03-31'),
      amountDue: 100000,
      amountPaid: 0,
      invoiceStatus: InvoiceStatus.SENT,
      paymentTerms: 'Net 30',
      sendReceipt: true,
      subtotal: 100000,
      type: TransactionType.ACCOUNTS_RECEIVABLE,
      date: new Date('2024-03-01'),
      description: 'Foundation Grant Q2 2024',
      reference: 'REF-2403-GFF',
      amount: 100000,
      status: TransactionStatus.APPROVED,
      fiscalYearId: 'FY2024',
      fiscalPeriodId: 'Q2-2024',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-02'),
      createdById: 'user1',
      approvedById: 'user2',
      approvedAt: new Date('2024-03-02'),
      postedAt: new Date('2024-03-02'),
      entries: [],
      invoiceItems: [
        {
          id: '301',
          invoiceId: '3',
          description: 'Q2 Foundation Grant',
          quantity: 1,
          unitPrice: 100000,
          amount: 100000,
          accountId: '204',
          revenueCategory: RevenueCategory.GRANT,
          taxable: false,
          fundId: 'F3'
        }
      ]
    },
    {
      id: '4',
      customerId: '4',
      invoiceNumber: 'INV-2024-004',
      invoiceDate: new Date('2024-03-15'),
      dueDate: new Date('2024-04-14'),
      amountDue: 15000,
      amountPaid: 10000,
      invoiceStatus: InvoiceStatus.PARTIALLY_PAID,
      paymentTerms: 'Net 30',
      sendReceipt: true,
      subtotal: 15000,
      type: TransactionType.ACCOUNTS_RECEIVABLE,
      date: new Date('2024-03-15'),
      description: 'Program Collaboration Q2 2024',
      reference: 'REF-2403-UW',
      amount: 15000,
      status: TransactionStatus.PARTIALLY_PAID,
      fiscalYearId: 'FY2024',
      fiscalPeriodId: 'Q2-2024',
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-25'),
      createdById: 'user1',
      approvedById: 'user2',
      approvedAt: new Date('2024-03-16'),
      postedAt: new Date('2024-03-16'),
      entries: [],
      invoiceItems: [
        {
          id: '401',
          invoiceId: '4',
          description: 'Collaborative program development',
          quantity: 1,
          unitPrice: 10000,
          amount: 10000,
          accountId: '205',
          revenueCategory: RevenueCategory.PROGRAM_REVENUE,
          taxable: false,
          fundId: 'F1'
        },
        {
          id: '402',
          invoiceId: '4',
          description: 'Resource materials',
          quantity: 50,
          unitPrice: 100,
          amount: 5000,
          accountId: '206',
          revenueCategory: RevenueCategory.PROGRAM_REVENUE,
          taxable: false,
          fundId: 'F1'
        }
      ]
    }
  ];
};

const generateMockRecurringInvoices = (): RecurringInvoice[] => {
  return [
    {
      id: '1',
      customerId: '1',
      description: 'Monthly Program Services',
      amount: 5000,
      frequency: RecurrenceFrequency.MONTHLY,
      dayOfMonth: 1,
      startDate: new Date('2024-01-01'),
      accountId: '201',
      revenueCategory: RevenueCategory.PROGRAM_REVENUE,
      nextGenerationDate: new Date('2024-05-01'),
      active: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastGeneratedDate: new Date('2024-04-01'),
      notes: 'Generate on the 1st of each month',
      invoiceTemplate: {
        paymentTerms: 'Net 30',
        sendReceipt: true,
        description: 'Monthly Program Services',
        status: TransactionStatus.DRAFT,
        invoiceItems: [
          {
            id: 'invoiceItem1',
            invoiceId: '1',
            description: 'Monthly program support services',
            quantity: 1,
            unitPrice: 5000,
            amount: 5000,
            accountId: '201',
            revenueCategory: RevenueCategory.PROGRAM_REVENUE,
            taxable: false,
            fundId: 'F1'
          }
        ]
      }
    },
    {
      id: '2',
      customerId: '4',
      description: 'Quarterly Collaboration Fee',
      amount: 15000,
      frequency: RecurrenceFrequency.QUARTERLY,
      startDate: new Date('2024-01-01'),
      accountId: '205',
      revenueCategory: RevenueCategory.PROGRAM_REVENUE,
      nextGenerationDate: new Date('2024-07-01'),
      active: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastGeneratedDate: new Date('2024-04-01'),
      notes: 'Generate on the 1st of each quarter',
      invoiceTemplate: {
        paymentTerms: 'Net 30',
        sendReceipt: true,
        description: 'Quarterly Collaboration Fee',
        status: TransactionStatus.DRAFT,
        invoiceItems: [
          {
            id: 'invoiceItem2',
            invoiceId: '2',
            description: 'Quarterly collaborative program development',
            quantity: 1,
            unitPrice: 15000,
            amount: 15000,
            accountId: '205',
            revenueCategory: RevenueCategory.PROGRAM_REVENUE,
            taxable: false,
            fundId: 'F1'
          }
        ]
      }
    }
  ];
};

const generateMockPayments = (): ReceivablePayment[] => {
  return [
    {
      id: '1',
      invoiceId: '1',
      amount: 25000,
      date: new Date('2024-02-10'),
      method: PaymentMethod.ACH,
      status: PaymentStatus.COMPLETED,
      referenceNumber: 'PAY-2402-001',
      accountId: '101',
      notes: 'Payment received via ACH transfer',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10'),
      createdById: 'user1',
      processedAt: new Date('2024-02-10'),
      transactionId: 'T-2402-001',
      depositDate: new Date('2024-02-10'),
      receiptSent: true,
      receiptSentAt: new Date('2024-02-10')
    },
    {
      id: '2',
      invoiceId: '2',
      amount: 40000,
      date: new Date('2024-02-28'),
      method: PaymentMethod.ACH,
      status: PaymentStatus.COMPLETED,
      referenceNumber: 'PAY-2402-002',
      accountId: '102',
      notes: 'Payment received via ACH transfer',
      createdAt: new Date('2024-02-28'),
      updatedAt: new Date('2024-02-28'),
      createdById: 'user1',
      processedAt: new Date('2024-02-28'),
      transactionId: 'T-2402-002',
      depositDate: new Date('2024-02-28'),
      receiptSent: true,
      receiptSentAt: new Date('2024-02-28')
    },
    {
      id: '3',
      invoiceId: '4',
      amount: 10000,
      date: new Date('2024-03-25'),
      method: PaymentMethod.CHECK,
      status: PaymentStatus.COMPLETED,
      referenceNumber: 'PAY-2403-001',
      accountId: '104',
      checkNumber: '12345',
      notes: 'Partial payment received via check',
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-25'),
      createdById: 'user1',
      processedAt: new Date('2024-03-25'),
      transactionId: 'T-2403-001',
      depositDate: new Date('2024-03-25'),
      receiptSent: true,
      receiptSentAt: new Date('2024-03-25')
    }
  ];
};

const generateMockReceipts = (): Receipt[] => {
  return [
    {
      id: '1',
      paymentId: '1',
      receiptNumber: 'RCP-2402-001',
      date: new Date('2024-02-10'),
      amount: 25000,
      customerId: '1',
      createdAt: new Date('2024-02-10'),
      sentAt: new Date('2024-02-10'),
      sentTo: 'sjohnson@dps.org',
      fileUrl: '/receipts/RCP-2402-001.pdf'
    },
    {
      id: '2',
      paymentId: '2',
      receiptNumber: 'RCP-2402-002',
      date: new Date('2024-02-28'),
      amount: 40000,
      customerId: '2',
      createdAt: new Date('2024-02-28'),
      sentAt: new Date('2024-02-28'),
      sentTo: 'michael.reynolds@cde.state.co.us',
      fileUrl: '/receipts/RCP-2402-002.pdf'
    },
    {
      id: '3',
      paymentId: '3',
      receiptNumber: 'RCP-2403-001',
      date: new Date('2024-03-25'),
      amount: 10000,
      customerId: '4',
      createdAt: new Date('2024-03-25'),
      sentAt: new Date('2024-03-25'),
      sentTo: 'dwilson@unitedway.org',
      fileUrl: '/receipts/RCP-2403-001.pdf'
    }
  ];
};

// Accounts Receivable Service
class AccountsReceivableService {
  private customers: Customer[] = [];
  private invoices: Invoice[] = [];
  private recurringInvoices: RecurringInvoice[] = [];
  private payments: ReceivablePayment[] = [];
  private receipts: Receipt[] = [];

  constructor() {
    // Initialize with mock data
    this.customers = generateMockCustomers();
    this.invoices = generateMockInvoices();
    this.recurringInvoices = generateMockRecurringInvoices();
    this.payments = generateMockPayments();
    this.receipts = generateMockReceipts();
  }

  // Customer Management
  async getAllCustomers(): Promise<Customer[]> {
    return Promise.resolve([...this.customers]);
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const customer = this.customers.find(c => c.id === id);
    return Promise.resolve(customer || null);
  }

  async getCustomersByType(type: CustomerType): Promise<Customer[]> {
    const filteredCustomers = this.customers.filter(c => c.type === type);
    return Promise.resolve([...filteredCustomers]);
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'yearToDateReceivables'>): Promise<Customer> {
    const newCustomer: Customer = {
      ...customerData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      yearToDateReceivables: 0,
      lastPaymentReceived: undefined
    };

    this.customers.push(newCustomer);
    return Promise.resolve({...newCustomer});
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer | null> {
    const customerIndex = this.customers.findIndex(c => c.id === id);
    if (customerIndex === -1) return Promise.resolve(null);

    const updatedCustomer = {
      ...this.customers[customerIndex],
      ...customerData,
      updatedAt: new Date()
    };

    this.customers[customerIndex] = updatedCustomer;
    return Promise.resolve({...updatedCustomer});
  }

  // Invoice Management
  async getAllInvoices(): Promise<Invoice[]> {
    return Promise.resolve([...this.invoices]);
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const invoice = this.invoices.find(i => i.id === id);
    return Promise.resolve(invoice ? {...invoice} : null);
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    const filteredInvoices = this.invoices.filter(i => i.customerId === customerId);
    return Promise.resolve([...filteredInvoices]);
  }

  async getInvoicesByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    const filteredInvoices = this.invoices.filter(i => i.invoiceStatus === status);
    return Promise.resolve([...filteredInvoices]);
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date();
    const overdueInvoices = this.invoices.filter(
      i => i.invoiceStatus !== InvoiceStatus.PAID && 
           i.invoiceStatus !== InvoiceStatus.VOIDED &&
           new Date(i.dueDate) < today
    );
    return Promise.resolve([...overdueInvoices]);
  }

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'entries'>): Promise<Invoice> {
    // Calculate total amount from invoice items
    const subtotal = invoiceData.invoiceItems.reduce(
      (sum, item) => sum + item.amount, 
      0
    );
    
    // Create transaction entries for GL impact
    const entries: TransactionEntry[] = [];
    
    // Generate a new invoice ID
    const id = uuidv4();
    
    // Update invoice items with generated ID
    const invoiceItems = invoiceData.invoiceItems.map(item => ({
      ...item,
      id: uuidv4(),
      invoiceId: id
    }));
    
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      subtotal,
      amount: subtotal,
      entries,
      invoiceItems
    };
    
    this.invoices.push(newInvoice);
    
    // Update customer's year-to-date receivables
    const customer = await this.getCustomerById(invoiceData.customerId);
    if (customer) {
      await this.updateCustomer(customer.id, {
        yearToDateReceivables: customer.yearToDateReceivables + subtotal
      });
    }
    
    return Promise.resolve({...newInvoice});
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice | null> {
    const invoiceIndex = this.invoices.findIndex(i => i.id === id);
    if (invoiceIndex === -1) return Promise.resolve(null);
    
    const updatedInvoice = {
      ...this.invoices[invoiceIndex],
      invoiceStatus: status,
      updatedAt: new Date()
    };
    
    this.invoices[invoiceIndex] = updatedInvoice;
    return Promise.resolve({...updatedInvoice});
  }

  async sendInvoice(id: string): Promise<Invoice | null> {
    const invoiceIndex = this.invoices.findIndex(i => i.id === id);
    if (invoiceIndex === -1) return Promise.resolve(null);
    
    if (this.invoices[invoiceIndex].invoiceStatus === InvoiceStatus.DRAFT) {
      const updatedInvoice = {
        ...this.invoices[invoiceIndex],
        invoiceStatus: InvoiceStatus.SENT,
        status: TransactionStatus.POSTED,
        postedAt: new Date(),
        updatedAt: new Date()
      };
      
      this.invoices[invoiceIndex] = updatedInvoice;
      return Promise.resolve({...updatedInvoice});
    }
    
    return Promise.resolve({...this.invoices[invoiceIndex]});
  }

  async voidInvoice(id: string, voidReason: string): Promise<Invoice | null> {
    const invoiceIndex = this.invoices.findIndex(i => i.id === id);
    if (invoiceIndex === -1) return Promise.resolve(null);
    
    // Can only void invoices that haven't been paid
    if (this.invoices[invoiceIndex].amountPaid > 0) {
      throw new Error('Cannot void an invoice with payments');
    }
    
    const updatedInvoice = {
      ...this.invoices[invoiceIndex],
      invoiceStatus: InvoiceStatus.VOIDED,
      status: TransactionStatus.VOIDED,
      voidedAt: new Date(),
      voidReason,
      updatedAt: new Date()
    };
    
    this.invoices[invoiceIndex] = updatedInvoice;
    
    // Update customer's year-to-date receivables
    const customer = await this.getCustomerById(updatedInvoice.customerId);
    if (customer) {
      await this.updateCustomer(customer.id, {
        yearToDateReceivables: customer.yearToDateReceivables - updatedInvoice.amount
      });
    }
    
    return Promise.resolve({...updatedInvoice});
  }

  // Recurring Invoice Management
  async getAllRecurringInvoices(): Promise<RecurringInvoice[]> {
    return Promise.resolve([...this.recurringInvoices]);
  }

  async getRecurringInvoiceById(id: string): Promise<RecurringInvoice | null> {
    const recurringInvoice = this.recurringInvoices.find(r => r.id === id);
    return Promise.resolve(recurringInvoice ? {...recurringInvoice} : null);
  }

  async getRecurringInvoicesByCustomer(customerId: string): Promise<RecurringInvoice[]> {
    const filteredInvoices = this.recurringInvoices.filter(r => r.customerId === customerId);
    return Promise.resolve([...filteredInvoices]);
  }

  async createRecurringInvoice(recurringInvoiceData: Omit<RecurringInvoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringInvoice> {
    const newRecurringInvoice: RecurringInvoice = {
      ...recurringInvoiceData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.recurringInvoices.push(newRecurringInvoice);
    return Promise.resolve({...newRecurringInvoice});
  }

  async updateRecurringInvoice(id: string, recurringInvoiceData: Partial<RecurringInvoice>): Promise<RecurringInvoice | null> {
    const recurringInvoiceIndex = this.recurringInvoices.findIndex(r => r.id === id);
    if (recurringInvoiceIndex === -1) return Promise.resolve(null);
    
    const updatedRecurringInvoice = {
      ...this.recurringInvoices[recurringInvoiceIndex],
      ...recurringInvoiceData,
      updatedAt: new Date()
    };
    
    this.recurringInvoices[recurringInvoiceIndex] = updatedRecurringInvoice;
    return Promise.resolve({...updatedRecurringInvoice});
  }

  async generateInvoiceFromRecurring(recurringInvoiceId: string): Promise<Invoice | null> {
    const recurringInvoice = await this.getRecurringInvoiceById(recurringInvoiceId);
    if (!recurringInvoice || !recurringInvoice.active) return Promise.resolve(null);
    
    const customer = await this.getCustomerById(recurringInvoice.customerId);
    if (!customer) return Promise.resolve(null);
    
    const invoiceDate = new Date();
    
    // Calculate due date based on customer payment terms
    const dueDate = new Date(invoiceDate);
    const paymentTerms = customer.paymentTerms || 'Net 30';
    const daysUntilDue = parseInt(paymentTerms.replace('Net ', '')) || 30;
    dueDate.setDate(dueDate.getDate() + daysUntilDue);
    
    // Generate invoice number
    const yearMonth = invoiceDate.toISOString().substring(0, 7).replace('-', '');
    const invoiceNumber = `INV-${yearMonth}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Use template or create default invoice items
    const invoiceItems = recurringInvoice.invoiceTemplate?.invoiceItems || [
      {
        id: uuidv4(),
        invoiceId: 'pending',
        description: recurringInvoice.description,
        quantity: 1,
        unitPrice: recurringInvoice.amount,
        amount: recurringInvoice.amount,
        accountId: recurringInvoice.accountId,
        revenueCategory: recurringInvoice.revenueCategory,
        taxable: false
      }
    ];
    
    // Create invoice
    const newInvoice = await this.createInvoice({
      customerId: recurringInvoice.customerId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      amountDue: recurringInvoice.amount,
      amountPaid: 0,
      invoiceStatus: InvoiceStatus.DRAFT,
      paymentTerms,
      recurringInvoiceId: recurringInvoice.id,
      invoiceItems: invoiceItems as InvoiceItem[],
      type: TransactionType.ACCOUNTS_RECEIVABLE,
      date: invoiceDate,
      description: recurringInvoice.description,
      reference: invoiceNumber,
      amount: recurringInvoice.amount,
      status: TransactionStatus.DRAFT,
      fiscalYearId: 'FY2024', // This would be dynamically determined in a real implementation
      fiscalPeriodId: 'Q2-2024', // This would be dynamically determined in a real implementation
      createdById: 'system',
      sendReceipt: true,
      subtotal: recurringInvoice.amount
    });
    
    // Update recurring invoice with last generated date and next generation date
    await this.updateRecurringInvoice(recurringInvoice.id, {
      lastGeneratedDate: new Date(),
      nextGenerationDate: this.calculateNextGenerationDate(recurringInvoice)
    });
    
    return Promise.resolve(newInvoice);
  }

  private calculateNextGenerationDate(recurringInvoice: RecurringInvoice): Date {
    const now = new Date();
    const next = new Date(now);
    
    switch (recurringInvoice.frequency) {
      case 'DAILY':
        next.setDate(now.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(now.getDate() + 7);
        break;
      case 'BIWEEKLY':
        next.setDate(now.getDate() + 14);
        break;
      case 'MONTHLY':
        next.setMonth(now.getMonth() + 1);
        if (recurringInvoice.dayOfMonth) {
          next.setDate(recurringInvoice.dayOfMonth);
        }
        break;
      case 'QUARTERLY':
        next.setMonth(now.getMonth() + 3);
        if (recurringInvoice.dayOfMonth) {
          next.setDate(recurringInvoice.dayOfMonth);
        }
        break;
      case 'ANNUALLY':
        next.setFullYear(now.getFullYear() + 1);
        if (recurringInvoice.dayOfMonth && recurringInvoice.dayOfMonth > 0) {
          next.setDate(recurringInvoice.dayOfMonth);
        }
        break;
      default:
        next.setMonth(now.getMonth() + 1);
    }
    
    return next;
  }

  // Payment Management
  async getAllPayments(): Promise<ReceivablePayment[]> {
    return Promise.resolve([...this.payments]);
  }

  async getPaymentById(id: string): Promise<ReceivablePayment | null> {
    const payment = this.payments.find(p => p.id === id);
    return Promise.resolve(payment ? {...payment} : null);
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<ReceivablePayment[]> {
    const filteredPayments = this.payments.filter(p => p.invoiceId === invoiceId);
    return Promise.resolve([...filteredPayments]);
  }

  async createPayment(paymentData: Omit<ReceivablePayment, 'id' | 'createdAt' | 'updatedAt' | 'processedAt' | 'receiptSent' | 'receiptSentAt'>): Promise<ReceivablePayment> {
    const newPayment: ReceivablePayment = {
      ...paymentData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      receiptSent: false
    };
    
    this.payments.push(newPayment);
    
    // Update invoice payment status
    const invoice = await this.getInvoiceById(paymentData.invoiceId);
    if (invoice) {
      const totalPaid = this.payments
        .filter(p => p.invoiceId === invoice.id && p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + p.amount, 0);
      
      const amountPaid = totalPaid + paymentData.amount;
      let invoiceStatus: InvoiceStatus;
      let transactionStatus: TransactionStatus;
      
      if (amountPaid >= invoice.amountDue) {
        invoiceStatus = InvoiceStatus.PAID;
        transactionStatus = TransactionStatus.PAID;
      } else {
        invoiceStatus = InvoiceStatus.PARTIALLY_PAID;
        transactionStatus = TransactionStatus.PARTIALLY_PAID;
      }
      
      // Update invoice
      const invoiceIndex = this.invoices.findIndex(i => i.id === invoice.id);
      if (invoiceIndex !== -1) {
        this.invoices[invoiceIndex] = {
          ...invoice,
          amountPaid,
          invoiceStatus,
          status: transactionStatus,
          updatedAt: new Date()
        };
      }
      
      // Update customer's last payment date
      const customer = await this.getCustomerById(invoice.customerId);
      if (customer) {
        await this.updateCustomer(customer.id, {
          lastPaymentReceived: new Date()
        });
      }
    }
    
    return Promise.resolve({...newPayment});
  }

  async processPayment(id: string): Promise<ReceivablePayment | null> {
    const paymentIndex = this.payments.findIndex(p => p.id === id);
    if (paymentIndex === -1) return Promise.resolve(null);
    
    const processedPayment = {
      ...this.payments[paymentIndex],
      status: PaymentStatus.COMPLETED,
      processedAt: new Date(),
      updatedAt: new Date()
    };
    
    this.payments[paymentIndex] = processedPayment;
    return Promise.resolve({...processedPayment});
  }
  
  async voidPayment(id: string, reason: string): Promise<ReceivablePayment | null> {
    const paymentIndex = this.payments.findIndex(p => p.id === id);
    if (paymentIndex === -1) return Promise.resolve(null);
    
    // Can only void payments that are pending or completed
    if (
      this.payments[paymentIndex].status !== PaymentStatus.PENDING && 
      this.payments[paymentIndex].status !== PaymentStatus.COMPLETED
    ) {
      throw new Error('Cannot void this payment due to its current status');
    }
    
    const originalPayment = this.payments[paymentIndex];
    const voidedPayment = {
      ...originalPayment,
      status: PaymentStatus.VOIDED,
      notes: `${originalPayment.notes || ''} | VOIDED: ${reason}`,
      updatedAt: new Date()
    };
    
    this.payments[paymentIndex] = voidedPayment;
    
    // Update invoice payment status
    const invoice = await this.getInvoiceById(originalPayment.invoiceId);
    if (invoice) {
      const remainingValidPayments = this.payments.filter(
        p => p.invoiceId === invoice.id && 
             p.status === PaymentStatus.COMPLETED && 
             p.id !== id
      );
      
      const amountPaid = remainingValidPayments.reduce(
        (sum, p) => sum + p.amount, 0
      );
      
      let invoiceStatus: InvoiceStatus;
      let transactionStatus: TransactionStatus;
      
      if (amountPaid === 0) {
        invoiceStatus = InvoiceStatus.SENT;
        transactionStatus = TransactionStatus.POSTED;
      } else if (amountPaid >= invoice.amountDue) {
        invoiceStatus = InvoiceStatus.PAID;
        transactionStatus = TransactionStatus.PAID;
      } else {
        invoiceStatus = InvoiceStatus.PARTIALLY_PAID;
        transactionStatus = TransactionStatus.PARTIALLY_PAID;
      }
      
      // Update invoice
      const invoiceIndex = this.invoices.findIndex(i => i.id === invoice.id);
      if (invoiceIndex !== -1) {
        this.invoices[invoiceIndex] = {
          ...invoice,
          amountPaid,
          invoiceStatus,
          status: transactionStatus,
          updatedAt: new Date()
        };
      }
    }
    
    return Promise.resolve({...voidedPayment});
  }

  // Receipt Management
  async getAllReceipts(): Promise<Receipt[]> {
    return Promise.resolve([...this.receipts]);
  }

  async getReceiptById(id: string): Promise<Receipt | null> {
    const receipt = this.receipts.find(r => r.id === id);
    return Promise.resolve(receipt ? {...receipt} : null);
  }

  async getReceiptsByCustomer(customerId: string): Promise<Receipt[]> {
    const filteredReceipts = this.receipts.filter(r => r.customerId === customerId);
    return Promise.resolve([...filteredReceipts]);
  }

  async getReceiptByPayment(paymentId: string): Promise<Receipt | null> {
    const receipt = this.receipts.find(r => r.paymentId === paymentId);
    return Promise.resolve(receipt ? {...receipt} : null);
  }

  async generateReceipt(paymentId: string, recipientEmail: string): Promise<Receipt | null> {
    const payment = await this.getPaymentById(paymentId);
    if (!payment) return Promise.resolve(null);
    
    const invoice = await this.getInvoiceById(payment.invoiceId);
    if (!invoice) return Promise.resolve(null);
    
    const customer = await this.getCustomerById(invoice.customerId);
    if (!customer) return Promise.resolve(null);
    
    // Generate receipt number
    const date = new Date();
    const yearMonth = date.toISOString().substring(0, 7).replace('-', '');
    const receiptNumber = `RCP-${yearMonth}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Create receipt
    const newReceipt: Receipt = {
      id: uuidv4(),
      paymentId: payment.id,
      receiptNumber,
      date,
      amount: payment.amount,
      customerId: customer.id,
      createdAt: date,
      sentAt: date,
      sentTo: recipientEmail,
      fileUrl: `/receipts/${receiptNumber}.pdf` // This would be generated in a real implementation
    };
    
    this.receipts.push(newReceipt);
    
    // Mark payment as having receipt sent
    const paymentIndex = this.payments.findIndex(p => p.id === payment.id);
    if (paymentIndex !== -1) {
      this.payments[paymentIndex] = {
        ...payment,
        receiptSent: true,
        receiptSentAt: date,
        updatedAt: date
      };
    }
    
    return Promise.resolve({...newReceipt});
  }

  // Analytics and Reporting
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
    const today = new Date();
    const unpaidInvoices = this.invoices.filter(i => 
      i.invoiceStatus !== InvoiceStatus.PAID && 
      i.invoiceStatus !== InvoiceStatus.VOIDED
    );
    
    const agingBuckets = {
      current: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90Plus': 0,
      total: 0
    };
    
    const customerAgingMap = new Map<string, {
      customerId: string;
      customerName: string;
      current: number;
      '1-30': number;
      '31-60': number;
      '61-90': number;
      '90Plus': number;
      total: number;
    }>();
    
    // Initialize customer aging objects
    for (const customer of this.customers) {
      customerAgingMap.set(customer.id, {
        customerId: customer.id,
        customerName: customer.name,
        current: 0,
        '1-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90Plus': 0,
        total: 0
      });
    }
    
    // Calculate aging for each invoice
    for (const invoice of unpaidInvoices) {
      const dueDate = new Date(invoice.dueDate);
      const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const remainingDue = invoice.amountDue - invoice.amountPaid;
      
      let bucket: keyof typeof agingBuckets;
      
      if (daysPastDue <= 0) {
        bucket = 'current';
      } else if (daysPastDue <= 30) {
        bucket = '1-30';
      } else if (daysPastDue <= 60) {
        bucket = '31-60';
      } else if (daysPastDue <= 90) {
        bucket = '61-90';
      } else {
        bucket = '90Plus';
      }
      
      // Update overall aging buckets
      agingBuckets[bucket] += remainingDue;
      agingBuckets.total += remainingDue;
      
      // Update customer aging
      const customerAging = customerAgingMap.get(invoice.customerId);
      if (customerAging) {
        customerAging[bucket] += remainingDue;
        customerAging.total += remainingDue;
      }
    }
    
    return Promise.resolve({
      ...agingBuckets,
      customerBreakdown: Array.from(customerAgingMap.values())
    });
  }

  async getRevenueByCustomer(startDate: Date, endDate: Date): Promise<{
    customerId: string;
    customerName: string;
    revenue: number;
    invoiceCount: number;
    averageInvoiceAmount: number;
  }[]> {
    // Filter paid invoices within date range
    const invoicesInPeriod = this.invoices.filter(i => 
      (i.invoiceStatus === InvoiceStatus.PAID || i.invoiceStatus === InvoiceStatus.PARTIALLY_PAID) &&
      new Date(i.invoiceDate) >= startDate &&
      new Date(i.invoiceDate) <= endDate
    );
    
    // Group by customer
    const customerRevenueMap = new Map<string, {
      customerId: string;
      customerName: string;
      revenue: number;
      invoiceCount: number;
    }>();
    
    for (const invoice of invoicesInPeriod) {
      const customer = await this.getCustomerById(invoice.customerId);
      if (!customer) continue;
      
      if (!customerRevenueMap.has(customer.id)) {
        customerRevenueMap.set(customer.id, {
          customerId: customer.id,
          customerName: customer.name,
          revenue: 0,
          invoiceCount: 0
        });
      }
      
      const customerRevenue = customerRevenueMap.get(customer.id)!;
      customerRevenue.revenue += invoice.amountPaid;
      customerRevenue.invoiceCount += 1;
    }
    
    // Calculate averages and format result
    const result = Array.from(customerRevenueMap.values()).map(cr => ({
      ...cr,
      averageInvoiceAmount: cr.invoiceCount > 0 ? cr.revenue / cr.invoiceCount : 0
    }));
    
    // Sort by revenue (highest first)
    result.sort((a, b) => b.revenue - a.revenue);
    
    return Promise.resolve(result);
  }

  async getRevenueByCategory(startDate: Date, endDate: Date): Promise<{
    category: RevenueCategory;
    revenue: number;
    percentage: number;
  }[]> {
    // Filter paid invoices within date range
    const invoicesInPeriod = this.invoices.filter(i => 
      (i.invoiceStatus === InvoiceStatus.PAID || i.invoiceStatus === InvoiceStatus.PARTIALLY_PAID) &&
      new Date(i.invoiceDate) >= startDate &&
      new Date(i.invoiceDate) <= endDate
    );
    
    // Group by revenue category
    const categoryRevenueMap = new Map<RevenueCategory, number>();
    const totalRevenue = invoicesInPeriod.reduce((sum, i) => sum + i.amountPaid, 0);
    
    // Initialize all categories
    Object.values(RevenueCategory).forEach(category => {
      categoryRevenueMap.set(category as RevenueCategory, 0);
    });
    
    // Aggregate revenue by category
    for (const invoice of invoicesInPeriod) {
      for (const item of invoice.invoiceItems) {
        const currentAmount = categoryRevenueMap.get(item.revenueCategory) || 0;
        // Calculate the paid portion of this line item (proportional to overall invoice payment)
        const paidRatio = invoice.amountPaid / invoice.amountDue;
        const itemPaidAmount = item.amount * paidRatio;
        categoryRevenueMap.set(item.revenueCategory, currentAmount + itemPaidAmount);
      }
    }
    
    // Format result with percentages
    const result = Array.from(categoryRevenueMap.entries()).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
    }));
    
    // Sort by revenue (highest first)
    result.sort((a, b) => b.revenue - a.revenue);
    
    return Promise.resolve(result);
  }

  async getCustomerPaymentSummary(customerId: string, year: number): Promise<{
    customer: Customer | null;
    totalRevenue: number;
    invoices: Invoice[];
    payments: ReceivablePayment[];
    receiptHistory: Receipt[];
  }> {
    const customer = await this.getCustomerById(customerId);
    if (!customer) {
      return {
        customer: null,
        totalRevenue: 0,
        invoices: [],
        payments: [],
        receiptHistory: []
      };
    }
    
    // Get invoices for the specified year
    const startDate = new Date(year, 0, 1); // January 1st of the year
    const endDate = new Date(year, 11, 31); // December 31st of the year
    
    const invoices = (await this.getInvoicesByCustomer(customerId)).filter(
      i => new Date(i.invoiceDate) >= startDate && new Date(i.invoiceDate) <= endDate
    );
    
    // Get all payments for these invoices
    const payments: ReceivablePayment[] = [];
    for (const invoice of invoices) {
      const invoicePayments = await this.getPaymentsByInvoice(invoice.id);
      payments.push(...invoicePayments);
    }
    
    // Get receipt history
    const receipts = await this.getReceiptsByCustomer(customerId);
    
    // Calculate total revenue (paid amounts)
    const totalRevenue = payments
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0);
    
    return Promise.resolve({
      customer,
      totalRevenue,
      invoices,
      payments,
      receiptHistory: receipts
    });
  }

  async getAccountsReceivableAnalytics(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    totalReceivables: number;
    totalOverdueAmount: number;
    customersByType: { type: CustomerType; count: number }[];
    topCustomersByRevenue: { customer: Customer; totalRevenue: number }[];
  }> {
    const customers = await this.getAllCustomers();
    const activeCustomers = customers.filter(c => c.status === CustomerStatus.ACTIVE);
    
    // Group customers by type
    const customerTypeMap = new Map<CustomerType, number>();
    
    // Initialize all types
    Object.values(CustomerType).forEach(type => {
      customerTypeMap.set(type as CustomerType, 0);
    });
    
    // Count customers by type
    for (const customer of customers) {
      const currentCount = customerTypeMap.get(customer.type) || 0;
      customerTypeMap.set(customer.type, currentCount + 1);
    }
    
    const customersByType = Array.from(customerTypeMap.entries()).map(([type, count]) => ({
      type,
      count
    }));
    
    // Calculate total receivables
    const totalReceivables = customers.reduce((sum, c) => sum + c.yearToDateReceivables, 0);
    
    // Calculate overdue amount
    const overdueInvoices = await this.getOverdueInvoices();
    const totalOverdueAmount = overdueInvoices.reduce(
      (sum, invoice) => sum + (invoice.amountDue - invoice.amountPaid), 
      0
    );
    
    // Get top customers by revenue (this would normally use the reporting period)
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const today = new Date();
    const revenueByCustomer = await this.getRevenueByCustomer(startOfYear, today);
    
    const topCustomersByRevenue = [];
    for (const customerRevenue of revenueByCustomer.slice(0, 5)) {
      const customer = await this.getCustomerById(customerRevenue.customerId);
      if (customer) {
        topCustomersByRevenue.push({
          customer,
          totalRevenue: customerRevenue.revenue
        });
      }
    }
    
    return Promise.resolve({
      totalCustomers: customers.length,
      activeCustomers: activeCustomers.length,
      totalReceivables,
      totalOverdueAmount,
      customersByType,
      topCustomersByRevenue
    });
  }
}

// Create and export singleton instance
export const accountsReceivableService = new AccountsReceivableService();