// src/lib/finance/budget-service.ts
import { 
  Budget,
  BudgetItem,
  BudgetStatus,
  BudgetType,
  BudgetPeriodType,
  BudgetRevision,
  BudgetRevisionChange,
  BudgetTemplate,
  BudgetTemplateItem,
  BudgetVarianceReport,
  BudgetVarianceItem,
  BudgetVariancePeriodDetail,
  BudgetPeriodDistribution,
  Department,
  Program,
  Project,
  ChartOfAccount,
  AccountType,
  AccountSubType,
  FiscalYear,
  FiscalPeriod
} from '@/types/finance';

class BudgetService {
  // Mock data and helper functions
  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private mockBudgets: Budget[] = [
    {
      id: 'budget-1',
      name: 'Annual Operating Budget 2024-2025',
      description: 'Annual operating budget for fiscal year 2024-2025',
      fiscalYearId: 'fy-2024-2025',
      type: BudgetType.ANNUAL,
      status: BudgetStatus.ACTIVE,
      createdById: 'user-1',
      approvedById: 'user-2',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-06-30'),
      totalAmount: 3500000,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-06-15'),
      approvedAt: new Date('2024-06-15'),
      isCurrent: true,
      periodType: BudgetPeriodType.MONTHLY,
      version: 1
    },
    {
      id: 'budget-2',
      name: 'Marketing Department Budget 2024-2025',
      description: 'Marketing department budget for fiscal year 2024-2025',
      fiscalYearId: 'fy-2024-2025',
      type: BudgetType.DEPARTMENT,
      status: BudgetStatus.ACTIVE,
      createdById: 'user-1',
      approvedById: 'user-2',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-06-30'),
      totalAmount: 450000,
      departmentId: 'dept-marketing',
      createdAt: new Date('2024-05-20'),
      updatedAt: new Date('2024-06-15'),
      approvedAt: new Date('2024-06-15'),
      isCurrent: true,
      periodType: BudgetPeriodType.QUARTERLY,
      version: 1
    },
    {
      id: 'budget-3',
      name: 'Provider Support Program Budget 2024-2025',
      description: 'Provider support program budget for fiscal year 2024-2025',
      fiscalYearId: 'fy-2024-2025',
      type: BudgetType.PROGRAM,
      status: BudgetStatus.ACTIVE,
      createdById: 'user-1',
      approvedById: 'user-2',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-06-30'),
      totalAmount: 1200000,
      programId: 'prog-provider-support',
      createdAt: new Date('2024-05-25'),
      updatedAt: new Date('2024-06-15'),
      approvedAt: new Date('2024-06-15'),
      isCurrent: true,
      periodType: BudgetPeriodType.QUARTERLY,
      version: 1
    }
  ];

  private mockBudgetItems: BudgetItem[] = [
    {
      id: 'budget-item-1',
      budgetId: 'budget-1',
      accountId: 'acct-salaries',
      name: 'Staff Salaries',
      description: 'Salaries for all full-time staff members',
      amount: 1500000,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-05-15'),
      periodDistribution: this.generateMonthlyDistribution('budget-item-1', 1500000)
    },
    {
      id: 'budget-item-2',
      budgetId: 'budget-1',
      accountId: 'acct-benefits',
      name: 'Employee Benefits',
      description: 'Benefits for all full-time staff members',
      amount: 450000,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-05-15'),
      periodDistribution: this.generateMonthlyDistribution('budget-item-2', 450000)
    },
    {
      id: 'budget-item-3',
      budgetId: 'budget-1',
      accountId: 'acct-tuition-credits',
      name: 'Tuition Credits',
      description: 'Tuition credits for program participants',
      amount: 850000,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-05-15'),
      periodDistribution: this.generateMonthlyDistribution('budget-item-3', 850000)
    },
    {
      id: 'budget-item-4',
      budgetId: 'budget-1',
      accountId: 'acct-rent',
      name: 'Rent and Utilities',
      description: 'Office rent and utilities',
      amount: 120000,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-05-15'),
      periodDistribution: this.generateMonthlyDistribution('budget-item-4', 120000)
    },
    {
      id: 'budget-item-5',
      budgetId: 'budget-1',
      accountId: 'acct-marketing',
      name: 'Marketing and Outreach',
      description: 'Marketing campaigns and community outreach',
      amount: 250000,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-05-15'),
      periodDistribution: this.generateMonthlyDistribution('budget-item-5', 250000)
    },
    {
      id: 'budget-item-6',
      budgetId: 'budget-1',
      accountId: 'acct-technology',
      name: 'Technology',
      description: 'Technology, software, and IT support',
      amount: 180000,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-05-15'),
      periodDistribution: this.generateMonthlyDistribution('budget-item-6', 180000)
    },
    {
      id: 'budget-item-7',
      budgetId: 'budget-1',
      accountId: 'acct-professional-services',
      name: 'Professional Services',
      description: 'Legal, accounting, and consulting services',
      amount: 150000,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-05-15'),
      periodDistribution: this.generateMonthlyDistribution('budget-item-7', 150000)
    }
  ];

  private mockBudgetRevisions: BudgetRevision[] = [
    {
      id: 'budget-revision-1',
      budgetId: 'budget-1',
      revisionNumber: 1,
      description: 'Mid-year budget adjustment',
      reason: 'Increased tuition credit demand and staffing changes',
      status: BudgetStatus.APPROVED,
      createdById: 'user-1',
      approvedById: 'user-2',
      createdAt: new Date('2024-12-05'),
      updatedAt: new Date('2024-12-10'),
      approvedAt: new Date('2024-12-10'),
      previousTotalAmount: 3500000,
      newTotalAmount: 3650000,
      changes: [
        {
          id: 'budget-revision-change-1',
          budgetRevisionId: 'budget-revision-1',
          budgetItemId: 'budget-item-3',
          accountId: 'acct-tuition-credits',
          changeType: 'MODIFY',
          description: 'Increase to tuition credits due to higher enrollment',
          previousAmount: 850000,
          newAmount: 950000,
          createdAt: new Date('2024-12-05'),
          updatedAt: new Date('2024-12-05')
        },
        {
          id: 'budget-revision-change-2',
          budgetRevisionId: 'budget-revision-1',
          budgetItemId: 'budget-item-1',
          accountId: 'acct-salaries',
          changeType: 'MODIFY',
          description: 'Increase to staff salaries for new hire',
          previousAmount: 1500000,
          newAmount: 1550000,
          createdAt: new Date('2024-12-05'),
          updatedAt: new Date('2024-12-05')
        }
      ]
    }
  ];

  private mockBudgetTemplates: BudgetTemplate[] = [
    {
      id: 'budget-template-1',
      name: 'Annual Operating Budget Template',
      description: 'Default template for annual operating budgets',
      type: BudgetType.ANNUAL,
      isDefault: true,
      createdById: 'user-1',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      items: [
        {
          id: 'template-item-1',
          budgetTemplateId: 'budget-template-1',
          accountId: 'acct-salaries',
          name: 'Staff Salaries',
          description: 'Salaries for all full-time staff members',
          defaultAmount: 1500000,
          distributionPattern: 'EQUAL',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: 'template-item-2',
          budgetTemplateId: 'budget-template-1',
          accountId: 'acct-benefits',
          name: 'Employee Benefits',
          description: 'Benefits for all full-time staff members',
          defaultAmount: 450000,
          distributionPattern: 'EQUAL',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: 'template-item-3',
          budgetTemplateId: 'budget-template-1',
          accountId: 'acct-tuition-credits',
          name: 'Tuition Credits',
          description: 'Tuition credits for program participants',
          defaultAmount: 850000,
          distributionPattern: 'SEASONAL',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: 'template-item-4',
          budgetTemplateId: 'budget-template-1',
          accountId: 'acct-rent',
          name: 'Rent and Utilities',
          description: 'Office rent and utilities',
          defaultAmount: 120000,
          distributionPattern: 'EQUAL',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: 'template-item-5',
          budgetTemplateId: 'budget-template-1',
          accountId: 'acct-marketing',
          name: 'Marketing and Outreach',
          description: 'Marketing campaigns and community outreach',
          defaultAmount: 250000,
          distributionPattern: 'SEASONAL',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        }
      ]
    },
    {
      id: 'budget-template-2',
      name: 'Department Budget Template',
      description: 'Default template for department budgets',
      type: BudgetType.DEPARTMENT,
      isDefault: true,
      createdById: 'user-1',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      items: [
        {
          id: 'template-item-6',
          budgetTemplateId: 'budget-template-2',
          accountId: 'acct-salaries',
          name: 'Staff Salaries',
          description: 'Salaries for department staff',
          defaultAmount: 500000,
          distributionPattern: 'EQUAL',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20')
        },
        {
          id: 'template-item-7',
          budgetTemplateId: 'budget-template-2',
          accountId: 'acct-benefits',
          name: 'Employee Benefits',
          description: 'Benefits for department staff',
          defaultAmount: 150000,
          distributionPattern: 'EQUAL',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20')
        },
        {
          id: 'template-item-8',
          budgetTemplateId: 'budget-template-2',
          accountId: 'acct-operations',
          name: 'Operational Expenses',
          description: 'General operational expenses',
          defaultAmount: 100000,
          distributionPattern: 'EQUAL',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20')
        }
      ]
    }
  ];

  private mockDepartments: Department[] = [
    {
      id: 'dept-executive',
      name: 'Executive',
      code: 'EXEC',
      description: 'Executive leadership team',
      managerId: 'user-2',
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: 'dept-finance',
      name: 'Finance',
      code: 'FIN',
      description: 'Finance and accounting',
      managerId: 'user-3',
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: 'dept-operations',
      name: 'Operations',
      code: 'OPS',
      description: 'Organizational operations',
      managerId: 'user-4',
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: 'dept-marketing',
      name: 'Marketing',
      code: 'MKT',
      description: 'Marketing and communications',
      managerId: 'user-5',
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: 'dept-programs',
      name: 'Programs',
      code: 'PROG',
      description: 'Program delivery and management',
      managerId: 'user-6',
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    }
  ];

  private mockPrograms: Program[] = [
    {
      id: 'prog-tuition-credits',
      name: 'Tuition Credits',
      code: 'TC',
      description: 'Tuition credit distribution program',
      departmentId: 'dept-programs',
      managerId: 'user-6',
      isActive: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    },
    {
      id: 'prog-provider-support',
      name: 'Provider Support',
      code: 'PS',
      description: 'Provider support and quality improvement program',
      departmentId: 'dept-programs',
      managerId: 'user-7',
      isActive: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    },
    {
      id: 'prog-community-outreach',
      name: 'Community Outreach',
      code: 'CO',
      description: 'Community engagement and outreach program',
      departmentId: 'dept-marketing',
      managerId: 'user-5',
      isActive: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    }
  ];

  private mockProjects: Project[] = [
    {
      id: 'proj-quality-improvement',
      name: 'Quality Improvement Initiative',
      code: 'QII',
      description: 'Initiative to improve quality of provider services',
      programId: 'prog-provider-support',
      departmentId: 'dept-programs',
      managerId: 'user-7',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-06-30'),
      status: 'ACTIVE',
      budget: 250000,
      actualSpend: 0,
      createdAt: new Date('2024-05-01'),
      updatedAt: new Date('2024-05-01')
    },
    {
      id: 'proj-technology-upgrade',
      name: 'Technology Infrastructure Upgrade',
      code: 'TIU',
      description: 'Upgrade of organization-wide technology infrastructure',
      departmentId: 'dept-operations',
      managerId: 'user-4',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-12-31'),
      status: 'ACTIVE',
      budget: 175000,
      actualSpend: 0,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-05-15')
    },
    {
      id: 'proj-awareness-campaign',
      name: 'Community Awareness Campaign',
      code: 'CAC',
      description: 'Campaign to increase community awareness of program offerings',
      programId: 'prog-community-outreach',
      departmentId: 'dept-marketing',
      managerId: 'user-5',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-01-31'),
      status: 'PLANNED',
      budget: 120000,
      actualSpend: 0,
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-06-01')
    }
  ];

  // Helper method to generate monthly distributions for a budget item
  private generateMonthlyDistribution(budgetItemId: string, totalAmount: number): BudgetPeriodDistribution[] {
    const distributions: BudgetPeriodDistribution[] = [];
    const monthlyAmount = Math.floor(totalAmount / 12); // Equal distribution for simplicity
    const remainderAmount = totalAmount - (monthlyAmount * 12);
    
    const startDate = new Date('2024-07-01');
    const months = [
      'July', 'August', 'September', 'October', 'November', 'December',
      'January', 'February', 'March', 'April', 'May', 'June'
    ];
    
    for (let i = 0; i < 12; i++) {
      const periodStartDate = new Date(startDate);
      periodStartDate.setMonth(startDate.getMonth() + i);
      
      const periodEndDate = new Date(periodStartDate);
      periodEndDate.setMonth(periodStartDate.getMonth() + 1);
      periodEndDate.setDate(0); // Last day of the month
      
      // Add remainder to first month for rounding
      const amount = i === 0 ? monthlyAmount + remainderAmount : monthlyAmount;
      
      distributions.push({
        id: `period-dist-${budgetItemId}-${i+1}`,
        budgetItemId,
        periodNumber: i + 1,
        periodName: months[i],
        startDate: periodStartDate,
        endDate: periodEndDate,
        amount,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return distributions;
  }

  // Helper method to generate quarterly distributions for a budget item
  private generateQuarterlyDistribution(budgetItemId: string, totalAmount: number): BudgetPeriodDistribution[] {
    const distributions: BudgetPeriodDistribution[] = [];
    const quarterlyAmount = Math.floor(totalAmount / 4); // Equal distribution for simplicity
    const remainderAmount = totalAmount - (quarterlyAmount * 4);
    
    const startDate = new Date('2024-07-01');
    const quarters = [
      'Q1 (Jul-Sep)', 'Q2 (Oct-Dec)', 'Q3 (Jan-Mar)', 'Q4 (Apr-Jun)'
    ];
    
    for (let i = 0; i < 4; i++) {
      const periodStartDate = new Date(startDate);
      periodStartDate.setMonth(startDate.getMonth() + (i * 3));
      
      const periodEndDate = new Date(periodStartDate);
      periodEndDate.setMonth(periodStartDate.getMonth() + 3);
      periodEndDate.setDate(0); // Last day of the quarter's last month
      
      // Add remainder to first quarter for rounding
      const amount = i === 0 ? quarterlyAmount + remainderAmount : quarterlyAmount;
      
      distributions.push({
        id: `period-dist-${budgetItemId}-${i+1}`,
        budgetItemId,
        periodNumber: i + 1,
        periodName: quarters[i],
        startDate: periodStartDate,
        endDate: periodEndDate,
        amount,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return distributions;
  }

  // Budget methods
  async getAllBudgets(): Promise<Budget[]> {
    return Promise.resolve([...this.mockBudgets]);
  }

  async getCurrentBudget(): Promise<Budget | null> {
    const current = this.mockBudgets.find(budget => budget.isCurrent && budget.type === BudgetType.ANNUAL);
    return Promise.resolve(current || null);
  }

  async getBudgetById(id: string): Promise<Budget | null> {
    const budget = this.mockBudgets.find(budget => budget.id === id);
    return Promise.resolve(budget || null);
  }

  async getBudgetsByFiscalYear(fiscalYearId: string): Promise<Budget[]> {
    const budgets = this.mockBudgets.filter(budget => budget.fiscalYearId === fiscalYearId);
    return Promise.resolve(budgets);
  }

  async getBudgetsByStatus(status: BudgetStatus): Promise<Budget[]> {
    const budgets = this.mockBudgets.filter(budget => budget.status === status);
    return Promise.resolve(budgets);
  }

  async getBudgetsByType(type: BudgetType): Promise<Budget[]> {
    const budgets = this.mockBudgets.filter(budget => budget.type === type);
    return Promise.resolve(budgets);
  }

  async getBudgetsByDepartment(departmentId: string): Promise<Budget[]> {
    const budgets = this.mockBudgets.filter(budget => budget.departmentId === departmentId);
    return Promise.resolve(budgets);
  }

  async getBudgetsByProgram(programId: string): Promise<Budget[]> {
    const budgets = this.mockBudgets.filter(budget => budget.programId === programId);
    return Promise.resolve(budgets);
  }

  async getBudgetsByProject(projectId: string): Promise<Budget[]> {
    const budgets = this.mockBudgets.filter(budget => budget.projectId === projectId);
    return Promise.resolve(budgets);
  }

  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    const newBudget: Budget = {
      ...budget,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockBudgets.push(newBudget);
    return Promise.resolve(newBudget);
  }

  async updateBudget(id: string, budgetData: Partial<Budget>): Promise<Budget | null> {
    const index = this.mockBudgets.findIndex(budget => budget.id === id);
    if (index === -1) return Promise.resolve(null);
    
    const updatedBudget: Budget = {
      ...this.mockBudgets[index],
      ...budgetData,
      updatedAt: new Date()
    };
    
    this.mockBudgets[index] = updatedBudget;
    return Promise.resolve(updatedBudget);
  }
  
  async updateBudgetStatus(id: string, status: BudgetStatus): Promise<Budget | null> {
    const index = this.mockBudgets.findIndex(budget => budget.id === id);
    if (index === -1) return Promise.resolve(null);
    
    const updatedBudget: Budget = {
      ...this.mockBudgets[index],
      status,
      updatedAt: new Date(),
      ...(status === BudgetStatus.APPROVED ? {
        approvedAt: new Date(),
        approvedById: 'current-user-id'
      } : {})
    };
    
    this.mockBudgets[index] = updatedBudget;
    return Promise.resolve(updatedBudget);
  }

  async approveBudget(id: string, approverId: string): Promise<Budget | null> {
    const budget = await this.getBudgetById(id);
    if (!budget) return Promise.resolve(null);
    
    const updatedBudget = await this.updateBudget(id, {
      status: BudgetStatus.APPROVED,
      approvedById: approverId,
      approvedAt: new Date()
    });
    
    return Promise.resolve(updatedBudget);
  }

  async rejectBudget(id: string, rejectionReason: string): Promise<Budget | null> {
    const budget = await this.getBudgetById(id);
    if (!budget) return Promise.resolve(null);
    
    const updatedBudget = await this.updateBudget(id, {
      status: BudgetStatus.REJECTED,
      notes: rejectionReason
    });
    
    return Promise.resolve(updatedBudget);
  }

  async closeBudget(id: string): Promise<Budget | null> {
    const budget = await this.getBudgetById(id);
    if (!budget) return Promise.resolve(null);
    
    const updatedBudget = await this.updateBudget(id, {
      status: BudgetStatus.CLOSED,
      isCurrent: false
    });
    
    return Promise.resolve(updatedBudget);
  }

  // Budget Item methods
  async getBudgetItems(budgetId: string): Promise<BudgetItem[]> {
    const items = this.mockBudgetItems.filter(item => item.budgetId === budgetId);
    return Promise.resolve(items);
  }

  async getBudgetItemById(id: string): Promise<BudgetItem | null> {
    const item = this.mockBudgetItems.find(item => item.id === id);
    return Promise.resolve(item || null);
  }

  async addBudgetItem(budgetItem: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<BudgetItem> {
    // Generate period distributions based on the budget's period type
    const budget = await this.getBudgetById(budgetItem.budgetId);
    if (!budget) {
      throw new Error(`Budget not found with id ${budgetItem.budgetId}`);
    }
    
    const itemId = this.generateId();
    let periodDistribution: BudgetPeriodDistribution[];
    
    switch (budget.periodType) {
      case BudgetPeriodType.MONTHLY:
        periodDistribution = this.generateMonthlyDistribution(itemId, budgetItem.amount);
        break;
      case BudgetPeriodType.QUARTERLY:
        periodDistribution = this.generateQuarterlyDistribution(itemId, budgetItem.amount);
        break;
      case BudgetPeriodType.ANNUAL:
        // For annual, just create a single period covering the entire year
        periodDistribution = [{
          id: `period-dist-${itemId}-1`,
          budgetItemId: itemId,
          periodNumber: 1,
          periodName: `FY ${budget.startDate.getFullYear()}-${budget.endDate.getFullYear()}`,
          startDate: budget.startDate,
          endDate: budget.endDate,
          amount: budgetItem.amount,
          createdAt: new Date(),
          updatedAt: new Date()
        }];
        break;
      default:
        periodDistribution = [];
    }
    
    const newBudgetItem: BudgetItem = {
      ...budgetItem,
      id: itemId,
      periodDistribution,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockBudgetItems.push(newBudgetItem);
    
    // Update the budget's total amount
    const updatedBudget = await this.getBudgetById(budgetItem.budgetId);
    if (updatedBudget) {
      const items = await this.getBudgetItems(budgetItem.budgetId);
      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
      await this.updateBudget(budgetItem.budgetId, { totalAmount });
    }
    
    return Promise.resolve(newBudgetItem);
  }

  async updateBudgetItem(id: string, budgetItemData: Partial<BudgetItem>): Promise<BudgetItem | null> {
    const index = this.mockBudgetItems.findIndex(item => item.id === id);
    if (index === -1) return Promise.resolve(null);
    
    const currentItem = this.mockBudgetItems[index];
    
    // If amount is changing, we need to regenerate period distributions
    if (budgetItemData.amount !== undefined && budgetItemData.amount !== currentItem.amount) {
      const budget = await this.getBudgetById(currentItem.budgetId);
      if (budget) {
        switch (budget.periodType) {
          case BudgetPeriodType.MONTHLY:
            budgetItemData.periodDistribution = this.generateMonthlyDistribution(id, budgetItemData.amount);
            break;
          case BudgetPeriodType.QUARTERLY:
            budgetItemData.periodDistribution = this.generateQuarterlyDistribution(id, budgetItemData.amount);
            break;
          case BudgetPeriodType.ANNUAL:
            budgetItemData.periodDistribution = [{
              id: `period-dist-${id}-1`,
              budgetItemId: id,
              periodNumber: 1,
              periodName: `FY ${budget.startDate.getFullYear()}-${budget.endDate.getFullYear()}`,
              startDate: budget.startDate,
              endDate: budget.endDate,
              amount: budgetItemData.amount,
              createdAt: new Date(),
              updatedAt: new Date()
            }];
            break;
        }
      }
    }
    
    const updatedBudgetItem: BudgetItem = {
      ...currentItem,
      ...budgetItemData,
      updatedAt: new Date()
    };
    
    this.mockBudgetItems[index] = updatedBudgetItem;
    
    // Update the budget's total amount if necessary
    if (budgetItemData.amount !== undefined) {
      const budget = await this.getBudgetById(currentItem.budgetId);
      if (budget) {
        const items = await this.getBudgetItems(currentItem.budgetId);
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
        await this.updateBudget(currentItem.budgetId, { totalAmount });
      }
    }
    
    return Promise.resolve(updatedBudgetItem);
  }

  async removeBudgetItem(id: string): Promise<boolean> {
    const index = this.mockBudgetItems.findIndex(item => item.id === id);
    if (index === -1) return Promise.resolve(false);
    
    const budgetId = this.mockBudgetItems[index].budgetId;
    
    // Remove the item
    this.mockBudgetItems.splice(index, 1);
    
    // Update the budget's total amount
    const budget = await this.getBudgetById(budgetId);
    if (budget) {
      const items = await this.getBudgetItems(budgetId);
      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
      await this.updateBudget(budgetId, { totalAmount });
    }
    
    return Promise.resolve(true);
  }

  // Budget Revision methods
  async getAllBudgetRevisions(budgetId: string): Promise<BudgetRevision[]> {
    const revisions = this.mockBudgetRevisions.filter(revision => revision.budgetId === budgetId);
    return Promise.resolve(revisions);
  }

  async getBudgetRevisionById(id: string): Promise<BudgetRevision | null> {
    const revision = this.mockBudgetRevisions.find(revision => revision.id === id);
    return Promise.resolve(revision || null);
  }

  async createBudgetRevision(budgetRevision: Omit<BudgetRevision, 'id' | 'createdAt' | 'updatedAt'>): Promise<BudgetRevision> {
    const newBudgetRevision: BudgetRevision = {
      ...budgetRevision,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockBudgetRevisions.push(newBudgetRevision);
    return Promise.resolve(newBudgetRevision);
  }

  async approveBudgetRevision(id: string, approverId: string): Promise<BudgetRevision | null> {
    const revisionIndex = this.mockBudgetRevisions.findIndex(revision => revision.id === id);
    if (revisionIndex === -1) return Promise.resolve(null);
    
    const revision = this.mockBudgetRevisions[revisionIndex];
    const approvedRevision: BudgetRevision = {
      ...revision,
      status: BudgetStatus.APPROVED,
      approvedById: approverId,
      approvedAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockBudgetRevisions[revisionIndex] = approvedRevision;
    
    // Apply the changes to the budget items
    const budget = await this.getBudgetById(revision.budgetId);
    if (budget) {
      // Update the budget version and total amount
      await this.updateBudget(revision.budgetId, {
        version: budget.version + 1,
        totalAmount: revision.newTotalAmount
      });
      
      // Apply each change to the budget items
      for (const change of revision.changes) {
        if (change.budgetItemId) {
          switch (change.changeType) {
            case 'MODIFY':
              await this.updateBudgetItem(change.budgetItemId, { amount: change.newAmount });
              break;
            case 'REMOVE':
              await this.removeBudgetItem(change.budgetItemId);
              break;
          }
        } else if (change.changeType === 'ADD' && change.accountId) {
          // For new budget items, create a new item
          // This is a simplified implementation; in a real system, you would need more data
          await this.addBudgetItem({
            budgetId: revision.budgetId,
            accountId: change.accountId,
            name: change.description,
            description: change.description,
            amount: change.newAmount,
            periodDistribution: []
          });
        }
      }
    }
    
    return Promise.resolve(approvedRevision);
  }

  async rejectBudgetRevision(id: string, rejectionReason: string): Promise<BudgetRevision | null> {
    const revisionIndex = this.mockBudgetRevisions.findIndex(revision => revision.id === id);
    if (revisionIndex === -1) return Promise.resolve(null);
    
    const revision = this.mockBudgetRevisions[revisionIndex];
    const rejectedRevision: BudgetRevision = {
      ...revision,
      status: BudgetStatus.REJECTED,
      updatedAt: new Date()
    };
    
    this.mockBudgetRevisions[revisionIndex] = rejectedRevision;
    return Promise.resolve(rejectedRevision);
  }

  // Budget Template methods
  async getAllBudgetTemplates(): Promise<BudgetTemplate[]> {
    return Promise.resolve([...this.mockBudgetTemplates]);
  }

  async getBudgetTemplateById(id: string): Promise<BudgetTemplate | null> {
    const template = this.mockBudgetTemplates.find(template => template.id === id);
    return Promise.resolve(template || null);
  }

  async getBudgetTemplatesByType(type: BudgetType): Promise<BudgetTemplate[]> {
    const templates = this.mockBudgetTemplates.filter(template => template.type === type);
    return Promise.resolve(templates);
  }

  async createBudgetTemplate(
    budgetTemplate: Omit<BudgetTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BudgetTemplate> {
    const newBudgetTemplate: BudgetTemplate = {
      ...budgetTemplate,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockBudgetTemplates.push(newBudgetTemplate);
    return Promise.resolve(newBudgetTemplate);
  }

  async updateBudgetTemplate(
    id: string,
    budgetTemplateData: Partial<BudgetTemplate>
  ): Promise<BudgetTemplate | null> {
    const index = this.mockBudgetTemplates.findIndex(template => template.id === id);
    if (index === -1) return Promise.resolve(null);
    
    const updatedBudgetTemplate: BudgetTemplate = {
      ...this.mockBudgetTemplates[index],
      ...budgetTemplateData,
      updatedAt: new Date()
    };
    
    this.mockBudgetTemplates[index] = updatedBudgetTemplate;
    return Promise.resolve(updatedBudgetTemplate);
  }

  async deleteBudgetTemplate(id: string): Promise<boolean> {
    const index = this.mockBudgetTemplates.findIndex(template => template.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.mockBudgetTemplates.splice(index, 1);
    return Promise.resolve(true);
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
    const template = await this.getBudgetTemplateById(templateId);
    if (!template) {
      throw new Error(`Template not found with id ${templateId}`);
    }
    
    // Create the budget
    const budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      description: `Budget created from template: ${template.name}`,
      fiscalYearId,
      type: template.type,
      status: BudgetStatus.DRAFT,
      createdById: 'user-1', // In a real app, this would be the current user
      startDate,
      endDate,
      totalAmount: 0, // Will be calculated from items
      isCurrent: false,
      periodType: BudgetPeriodType.MONTHLY, // Default, could be configurable
      version: 1,
      ...(options?.departmentId && { departmentId: options.departmentId }),
      ...(options?.programId && { programId: options.programId }),
      ...(options?.projectId && { projectId: options.projectId }),
      ...(options?.fundId && { fundId: options.fundId })
    };
    
    const newBudget = await this.createBudget(budget);
    
    // Create budget items from template items
    const customAmounts = options?.customAmounts || {};
    let totalAmount = 0;
    
    for (const templateItem of template.items) {
      const amount = customAmounts[templateItem.id] || templateItem.defaultAmount;
      totalAmount += amount;
      
      await this.addBudgetItem({
        budgetId: newBudget.id,
        accountId: templateItem.accountId,
        name: templateItem.name,
        description: templateItem.description,
        amount,
        notes: templateItem.notes,
        ...(options?.departmentId && { departmentId: options.departmentId }),
        ...(options?.programId && { programId: options.programId }),
        ...(options?.projectId && { projectId: options.projectId }),
        ...(options?.fundId && { fundId: options.fundId }),
        periodDistribution: []
      });
    }
    
    // Update the budget's total amount
    const updatedBudget = await this.updateBudget(newBudget.id, { totalAmount });
    return Promise.resolve(updatedBudget!);
  }

  // Budget Variance Report methods
  async getBudgetVarianceReport(
    budgetId: string,
    asOfDate?: Date
  ): Promise<BudgetVarianceReport> {
    // In a real implementation, this would generate a variance report based on actual data
    // For now, we'll generate a mock report
    
    const budget = await this.getBudgetById(budgetId);
    if (!budget) {
      throw new Error(`Budget not found with id ${budgetId}`);
    }
    
    const budgetItems = await this.getBudgetItems(budgetId);
    const reportDate = asOfDate || new Date();
    
    const items: BudgetVarianceItem[] = budgetItems.map(item => {
      // Generate some random actual data for demonstration
      const actualAmount = item.amount * (Math.random() * 0.3 + 0.8); // Between 80% and 110% of budget
      const variance = actualAmount - item.amount;
      const variancePercentage = (variance / item.amount) * 100;
      
      const periodDetails: BudgetVariancePeriodDetail[] = item.periodDistribution.map(period => {
        const periodActualAmount = period.amount * (Math.random() * 0.3 + 0.8);
        const periodVariance = periodActualAmount - period.amount;
        const periodVariancePercentage = (periodVariance / period.amount) * 100;
        
        return {
          id: this.generateId(),
          budgetVarianceItemId: this.generateId(), // This will be replaced below
          periodNumber: period.periodNumber,
          periodName: period.periodName,
          budgetAmount: period.amount,
          actualAmount: periodActualAmount,
          variance: periodVariance,
          variancePercentage: periodVariancePercentage
        };
      });
      
      const varianceItem: BudgetVarianceItem = {
        id: this.generateId(),
        budgetVarianceReportId: this.generateId(), // This will be replaced below
        budgetItemId: item.id,
        accountId: item.accountId,
        name: item.name,
        budgetAmount: item.amount,
        actualAmount,
        variance,
        variancePercentage,
        periodDetails
      };
      
      // Update the budgetVarianceItemId in period details
      varianceItem.periodDetails = varianceItem.periodDetails.map(detail => ({
        ...detail,
        budgetVarianceItemId: varianceItem.id
      }));
      
      return varianceItem;
    });
    
    const totalBudget = items.reduce((sum, item) => sum + item.budgetAmount, 0);
    const totalActual = items.reduce((sum, item) => sum + item.actualAmount, 0);
    const totalVariance = totalActual - totalBudget;
    const variancePercentage = (totalVariance / totalBudget) * 100;
    
    const report: BudgetVarianceReport = {
      id: this.generateId(),
      budgetId,
      name: `Variance Report for ${budget.name}`,
      description: `Budget variance report as of ${reportDate.toLocaleDateString()}`,
      periodType: budget.periodType,
      asOfDate: reportDate,
      createdById: 'user-1', // In a real app, this would be the current user
      createdAt: new Date(),
      totalBudget,
      totalActual,
      totalVariance,
      variancePercentage,
      items
    };
    
    // Update the budgetVarianceReportId in items
    report.items = report.items.map(item => ({
      ...item,
      budgetVarianceReportId: report.id
    }));
    
    return Promise.resolve(report);
  }

  async getBudgetVarianceReportById(id: string): Promise<BudgetVarianceReport | null> {
    // In a real implementation, this would retrieve a stored report
    // For now, we'll simulate not finding the report
    return Promise.resolve(null);
  }

  async generateBudgetVarianceReport(
    budgetId: string,
    asOfDate: Date
  ): Promise<BudgetVarianceReport> {
    return this.getBudgetVarianceReport(budgetId, asOfDate);
  }

  async exportBudgetVarianceReport(
    id: string,
    format: 'PDF' | 'EXCEL' | 'CSV'
  ): Promise<string> {
    // In a real implementation, this would generate a file in the specified format
    // For now, we'll just return a mock file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `budget_variance_report_${id}_${timestamp}.${format.toLowerCase()}`;
    
    return Promise.resolve(`/reports/${fileName}`);
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
    const budgets = await this.getBudgetsByFiscalYear(fiscalYearId);
    
    // Calculate total budget amount
    const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.totalAmount, 0);
    
    // Generate some mock actual amount data
    const totalActualAmount = totalBudgetAmount * 0.85; // 85% utilization for demo
    const varianceAmount = totalActualAmount - totalBudgetAmount;
    const variancePercentage = (varianceAmount / totalBudgetAmount) * 100;
    
    // Group budgets by type
    const budgetsByType: { type: BudgetType; count: number; amount: number }[] = [];
    Object.values(BudgetType).forEach(type => {
      const filteredBudgets = budgets.filter(budget => budget.type === type);
      if (filteredBudgets.length > 0) {
        budgetsByType.push({
          type,
          count: filteredBudgets.length,
          amount: filteredBudgets.reduce((sum, budget) => sum + budget.totalAmount, 0)
        });
      }
    });
    
    // Group budgets by status
    const budgetsByStatus: { status: BudgetStatus; count: number; amount: number }[] = [];
    Object.values(BudgetStatus).forEach(status => {
      const filteredBudgets = budgets.filter(budget => budget.status === status);
      if (filteredBudgets.length > 0) {
        budgetsByStatus.push({
          status,
          count: filteredBudgets.length,
          amount: filteredBudgets.reduce((sum, budget) => sum + budget.totalAmount, 0)
        });
      }
    });
    
    // Generate mock top budget items
    const topBudgetItems: { 
      account: ChartOfAccount; 
      budgetAmount: number; 
      actualAmount: number;
      variance: number;
      variancePercentage: number;
    }[] = [
      {
        account: {
          id: 'acct-tuition-credits',
          accountNumber: '5100',
          name: 'Tuition Credits',
          description: 'Tuition credits for program participants',
          type: AccountType.EXPENSE,
          subType: AccountSubType.PROGRAM_EXPENSE,
          isActive: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          normalBalance: 'DEBIT',
          isCashAccount: false,
          isBankAccount: false,
          allowAdjustingEntries: true,
          hasChildren: false
        },
        budgetAmount: 850000,
        actualAmount: 825000,
        variance: -25000,
        variancePercentage: -2.94
      },
      {
        account: {
          id: 'acct-salaries',
          accountNumber: '5000',
          name: 'Staff Salaries',
          description: 'Salaries for all full-time staff members',
          type: AccountType.EXPENSE,
          subType: AccountSubType.OPERATING_EXPENSE,
          isActive: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          normalBalance: 'DEBIT',
          isCashAccount: false,
          isBankAccount: false,
          allowAdjustingEntries: true,
          hasChildren: false
        },
        budgetAmount: 1500000,
        actualAmount: 1525000,
        variance: 25000,
        variancePercentage: 1.67
      },
      {
        account: {
          id: 'acct-benefits',
          accountNumber: '5050',
          name: 'Employee Benefits',
          description: 'Benefits for all full-time staff members',
          type: AccountType.EXPENSE,
          subType: AccountSubType.OPERATING_EXPENSE,
          isActive: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          normalBalance: 'DEBIT',
          isCashAccount: false,
          isBankAccount: false,
          allowAdjustingEntries: true,
          hasChildren: false
        },
        budgetAmount: 450000,
        actualAmount: 430000,
        variance: -20000,
        variancePercentage: -4.44
      },
      {
        account: {
          id: 'acct-marketing',
          accountNumber: '5300',
          name: 'Marketing and Outreach',
          description: 'Marketing campaigns and community outreach',
          type: AccountType.EXPENSE,
          subType: AccountSubType.PROGRAM_EXPENSE,
          isActive: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          normalBalance: 'DEBIT',
          isCashAccount: false,
          isBankAccount: false,
          allowAdjustingEntries: true,
          hasChildren: false
        },
        budgetAmount: 250000,
        actualAmount: 210000,
        variance: -40000,
        variancePercentage: -16.0
      },
      {
        account: {
          id: 'acct-technology',
          accountNumber: '5400',
          name: 'Technology',
          description: 'Technology, software, and IT support',
          type: AccountType.EXPENSE,
          subType: AccountSubType.ADMINISTRATIVE_EXPENSE,
          isActive: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          normalBalance: 'DEBIT',
          isCashAccount: false,
          isBankAccount: false,
          allowAdjustingEntries: true,
          hasChildren: false
        },
        budgetAmount: 180000,
        actualAmount: 195000,
        variance: 15000,
        variancePercentage: 8.33
      }
    ];
    
    return Promise.resolve({
      totalBudgetAmount,
      totalActualAmount,
      varianceAmount,
      variancePercentage,
      budgetsByType,
      budgetsByStatus,
      topBudgetItems
    });
  }

  // Department, Program, and Project methods
  async getAllDepartments(): Promise<Department[]> {
    return Promise.resolve([...this.mockDepartments]);
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    const department = this.mockDepartments.find(department => department.id === id);
    return Promise.resolve(department || null);
  }

  async createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    const newDepartment: Department = {
      ...department,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockDepartments.push(newDepartment);
    return Promise.resolve(newDepartment);
  }

  async updateDepartment(id: string, departmentData: Partial<Department>): Promise<Department | null> {
    const index = this.mockDepartments.findIndex(department => department.id === id);
    if (index === -1) return Promise.resolve(null);
    
    const updatedDepartment: Department = {
      ...this.mockDepartments[index],
      ...departmentData,
      updatedAt: new Date()
    };
    
    this.mockDepartments[index] = updatedDepartment;
    return Promise.resolve(updatedDepartment);
  }

  async getAllPrograms(): Promise<Program[]> {
    return Promise.resolve([...this.mockPrograms]);
  }

  async getProgramById(id: string): Promise<Program | null> {
    const program = this.mockPrograms.find(program => program.id === id);
    return Promise.resolve(program || null);
  }

  async getProgramsByDepartment(departmentId: string): Promise<Program[]> {
    const programs = this.mockPrograms.filter(program => program.departmentId === departmentId);
    return Promise.resolve(programs);
  }

  async createProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program> {
    const newProgram: Program = {
      ...program,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockPrograms.push(newProgram);
    return Promise.resolve(newProgram);
  }

  async updateProgram(id: string, programData: Partial<Program>): Promise<Program | null> {
    const index = this.mockPrograms.findIndex(program => program.id === id);
    if (index === -1) return Promise.resolve(null);
    
    const updatedProgram: Program = {
      ...this.mockPrograms[index],
      ...programData,
      updatedAt: new Date()
    };
    
    this.mockPrograms[index] = updatedProgram;
    return Promise.resolve(updatedProgram);
  }

  async getAllProjects(): Promise<Project[]> {
    return Promise.resolve([...this.mockProjects]);
  }

  async getProjectById(id: string): Promise<Project | null> {
    const project = this.mockProjects.find(project => project.id === id);
    return Promise.resolve(project || null);
  }

  async getProjectsByProgram(programId: string): Promise<Project[]> {
    const projects = this.mockProjects.filter(project => project.programId === programId);
    return Promise.resolve(projects);
  }

  async getProjectsByDepartment(departmentId: string): Promise<Project[]> {
    const projects = this.mockProjects.filter(project => project.departmentId === departmentId);
    return Promise.resolve(projects);
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockProjects.push(newProject);
    return Promise.resolve(newProject);
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project | null> {
    const index = this.mockProjects.findIndex(project => project.id === id);
    if (index === -1) return Promise.resolve(null);
    
    const updatedProject: Project = {
      ...this.mockProjects[index],
      ...projectData,
      updatedAt: new Date()
    };
    
    this.mockProjects[index] = updatedProject;
    return Promise.resolve(updatedProject);
  }
}

// Create and export singleton instance
export const budgetService = new BudgetService();