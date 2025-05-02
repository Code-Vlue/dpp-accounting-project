// src/lib/finance/asset-management-service.ts
import {
  Asset,
  AssetType,
  AssetStatus,
  AssetCategory,
  AssetDisposal,
  AssetDisposalMethod,
  AssetMaintenance,
  AssetTransfer,
  AssetDepreciationSchedule,
  DepreciationMethod,
  Transaction,
  TransactionType,
  TransactionStatus,
  TransactionEntry
} from '@/types/finance';
import { financeService } from './finance-service';
import { generalLedgerService } from './general-ledger-service';

// Mock data for development
const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Office Computer - Admin',
    description: 'Dell XPS 15 Laptop for administrative staff',
    assetNumber: 'COMP-2023-001',
    serialNumber: 'DELL-XPS15-123456',
    type: AssetType.COMPUTER_HARDWARE,
    status: AssetStatus.ACTIVE,
    location: 'Main Office - Admin Department',
    department: 'Administration',
    assignedTo: 'Jane Smith',
    purchaseDate: new Date('2023-03-15'),
    inServiceDate: new Date('2023-03-20'),
    purchasePrice: 1800,
    residualValue: 200,
    currentValue: 1550,
    usefulLifeYears: 5,
    usefulLifeMonths: 60,
    depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
    accountId: '201', // Asset Account
    accumulatedDepreciationAccountId: '202', // Accumulated Depreciation Account
    depreciationExpenseAccountId: '601', // Depreciation Expense Account
    lastDepreciationDate: new Date('2024-03-31'),
    warrantyExpirationDate: new Date('2026-03-15'),
    barcode: 'ASSET-001',
    vendorId: '4', // Tech Solutions LLC
    invoiceNumber: 'INV-TECH-12345',
    tags: ['computer', 'admin', 'hardware'],
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2024-03-31'),
    createdById: 'user1'
  },
  {
    id: '2',
    name: 'Office Furniture - Conference Room',
    description: 'Conference table and 10 chairs',
    assetNumber: 'FURN-2023-001',
    type: AssetType.FURNITURE,
    status: AssetStatus.ACTIVE,
    location: 'Main Office - Conference Room',
    purchaseDate: new Date('2023-01-10'),
    inServiceDate: new Date('2023-01-15'),
    purchasePrice: 3500,
    residualValue: 500,
    currentValue: 3200,
    usefulLifeYears: 10,
    usefulLifeMonths: 120,
    depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
    accountId: '201', // Asset Account
    accumulatedDepreciationAccountId: '202', // Accumulated Depreciation Account
    depreciationExpenseAccountId: '601', // Depreciation Expense Account
    lastDepreciationDate: new Date('2024-03-31'),
    tags: ['furniture', 'conference room'],
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2024-03-31'),
    createdById: 'user1'
  },
  {
    id: '3',
    name: 'Office Software - Accounting System',
    description: 'Financial management software license (5 years)',
    assetNumber: 'SOFT-2023-001',
    type: AssetType.COMPUTER_SOFTWARE,
    status: AssetStatus.ACTIVE,
    department: 'Finance',
    purchaseDate: new Date('2023-06-01'),
    inServiceDate: new Date('2023-06-15'),
    purchasePrice: 12000,
    residualValue: 0,
    currentValue: 10800,
    usefulLifeYears: 5,
    usefulLifeMonths: 60,
    depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
    accountId: '205', // Intangible Asset Account
    accumulatedDepreciationAccountId: '206', // Accumulated Amortization Account
    depreciationExpenseAccountId: '602', // Amortization Expense Account
    lastDepreciationDate: new Date('2024-03-31'),
    tags: ['software', 'finance', 'license'],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-03-31'),
    createdById: 'user1'
  }
];

const mockAssetCategories: AssetCategory[] = [
  {
    id: '1',
    name: 'Office Equipment',
    description: 'Computer hardware, printers, phones, etc.',
    defaultDepreciationMethod: DepreciationMethod.STRAIGHT_LINE,
    defaultUsefulLifeYears: 5,
    defaultType: AssetType.EQUIPMENT,
    defaultDepreciationAccountId: '601',
    defaultAssetAccountId: '201',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '2',
    name: 'Furniture and Fixtures',
    description: 'Desks, chairs, cabinets, etc.',
    defaultDepreciationMethod: DepreciationMethod.STRAIGHT_LINE,
    defaultUsefulLifeYears: 10,
    defaultType: AssetType.FURNITURE,
    defaultDepreciationAccountId: '601',
    defaultAssetAccountId: '201',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '3',
    name: 'Software',
    description: 'Software licenses and applications',
    defaultDepreciationMethod: DepreciationMethod.STRAIGHT_LINE,
    defaultUsefulLifeYears: 5,
    defaultType: AssetType.COMPUTER_SOFTWARE,
    defaultDepreciationAccountId: '602',
    defaultAssetAccountId: '205',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
];

const mockAssetDepreciationSchedules: AssetDepreciationSchedule[] = [
  {
    id: '1',
    assetId: '1',
    fiscalYear: '2023',
    fiscalPeriod: '4',
    depreciationDate: new Date('2023-04-30'),
    depreciationAmount: 26.67,
    accumulatedDepreciation: 26.67,
    bookValue: 1773.33,
    journalEntryId: 'je-2023-04-01',
    createdAt: new Date('2023-04-30'),
    updatedAt: new Date('2023-04-30')
  },
  {
    id: '2',
    assetId: '1',
    fiscalYear: '2023',
    fiscalPeriod: '5',
    depreciationDate: new Date('2023-05-31'),
    depreciationAmount: 26.67,
    accumulatedDepreciation: 53.34,
    bookValue: 1746.66,
    journalEntryId: 'je-2023-05-01',
    createdAt: new Date('2023-05-31'),
    updatedAt: new Date('2023-05-31')
  },
  // More depreciation schedule entries would be here in a real system
  {
    id: '13',
    assetId: '1',
    fiscalYear: '2024',
    fiscalPeriod: '3',
    depreciationDate: new Date('2024-03-31'),
    depreciationAmount: 26.67,
    accumulatedDepreciation: 346.71,
    bookValue: 1453.29,
    journalEntryId: 'je-2024-03-01',
    createdAt: new Date('2024-03-31'),
    updatedAt: new Date('2024-03-31')
  }
];

const mockAssetDisposals: AssetDisposal[] = [];
const mockAssetMaintenances: AssetMaintenance[] = [];
const mockAssetTransfers: AssetTransfer[] = [];

// Asset Management Service Class
class AssetManagementService {
  private assets: Asset[] = mockAssets;
  private assetCategories: AssetCategory[] = mockAssetCategories;
  private assetDepreciationSchedules: AssetDepreciationSchedule[] = mockAssetDepreciationSchedules;
  private assetDisposals: AssetDisposal[] = mockAssetDisposals;
  private assetMaintenances: AssetMaintenance[] = mockAssetMaintenances;
  private assetTransfers: AssetTransfer[] = mockAssetTransfers;

  // Asset Methods
  async getAllAssets(): Promise<Asset[]> {
    return Promise.resolve([...this.assets]);
  }

  async getAssetById(id: string): Promise<Asset | null> {
    const asset = this.assets.find(a => a.id === id);
    return Promise.resolve(asset || null);
  }

  async getAssetsByType(type: AssetType): Promise<Asset[]> {
    const filteredAssets = this.assets.filter(a => a.type === type);
    return Promise.resolve(filteredAssets);
  }

  async getAssetsByStatus(status: AssetStatus): Promise<Asset[]> {
    const filteredAssets = this.assets.filter(a => a.status === status);
    return Promise.resolve(filteredAssets);
  }

  async getAssetsByDepartment(department: string): Promise<Asset[]> {
    const filteredAssets = this.assets.filter(a => a.department === department);
    return Promise.resolve(filteredAssets);
  }

  async createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>): Promise<Asset> {
    const newAsset: Asset = {
      ...asset,
      id: (this.assets.length + 1).toString(),
      currentValue: asset.purchasePrice, // Initialize current value to purchase price
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.assets.push(newAsset);
    return Promise.resolve(newAsset);
  }

  async updateAsset(id: string, assetData: Partial<Asset>): Promise<Asset | null> {
    const index = this.assets.findIndex(a => a.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.assets[index] = {
      ...this.assets[index],
      ...assetData,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.assets[index]);
  }

  async changeAssetStatus(id: string, status: AssetStatus, notes?: string): Promise<Asset | null> {
    const index = this.assets.findIndex(a => a.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.assets[index] = {
      ...this.assets[index],
      status,
      notes: notes ? (this.assets[index].notes ? `${this.assets[index].notes}\n${notes}` : notes) : this.assets[index].notes,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.assets[index]);
  }

  // Asset Category Methods
  async getAllAssetCategories(): Promise<AssetCategory[]> {
    return Promise.resolve([...this.assetCategories]);
  }

  async getAssetCategoryById(id: string): Promise<AssetCategory | null> {
    const category = this.assetCategories.find(c => c.id === id);
    return Promise.resolve(category || null);
  }

  async createAssetCategory(category: Omit<AssetCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetCategory> {
    const newCategory: AssetCategory = {
      ...category,
      id: (this.assetCategories.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.assetCategories.push(newCategory);
    return Promise.resolve(newCategory);
  }

  async updateAssetCategory(id: string, categoryData: Partial<AssetCategory>): Promise<AssetCategory | null> {
    const index = this.assetCategories.findIndex(c => c.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.assetCategories[index] = {
      ...this.assetCategories[index],
      ...categoryData,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.assetCategories[index]);
  }

  // Asset Depreciation Methods
  async getAssetDepreciationSchedule(assetId: string): Promise<AssetDepreciationSchedule[]> {
    const schedules = this.assetDepreciationSchedules.filter(s => s.assetId === assetId);
    return Promise.resolve(schedules);
  }

  async generateDepreciationSchedule(assetId: string): Promise<AssetDepreciationSchedule[]> {
    const asset = await this.getAssetById(assetId);
    if (!asset) throw new Error(`Asset with ID ${assetId} not found`);
    
    if (asset.depreciationMethod === DepreciationMethod.NONE) {
      return Promise.resolve([]);
    }
    
    const { currentFiscalYear, currentFiscalPeriod } = await financeService.getCurrentFiscalYearAndPeriod();
    if (!currentFiscalYear || !currentFiscalPeriod) {
      throw new Error('No active fiscal period found');
    }
    
    // Get existing depreciation schedules
    const existingSchedules = await this.getAssetDepreciationSchedule(assetId);
    
    const depreciableValue = asset.purchasePrice - asset.residualValue;
    const totalDepreciationPeriods = asset.usefulLifeMonths;
    
    // Calculate monthly depreciation amount
    let monthlyDepreciationAmount = 0;
    switch(asset.depreciationMethod) {
      case DepreciationMethod.STRAIGHT_LINE:
        monthlyDepreciationAmount = depreciableValue / totalDepreciationPeriods;
        break;
      // Add other depreciation methods as needed
      default:
        throw new Error(`Depreciation method ${asset.depreciationMethod} not implemented`);
    }
    
    // Calculate starting period
    let startDate = new Date(asset.inServiceDate);
    let accumulatedDepreciation = 0;
    let bookValue = asset.purchasePrice;
    
    // If there are existing schedules, start from the last one
    if (existingSchedules.length > 0) {
      const lastSchedule = existingSchedules.sort((a, b) => 
        new Date(b.depreciationDate).getTime() - new Date(a.depreciationDate).getTime()
      )[0];
      
      startDate = new Date(lastSchedule.depreciationDate);
      startDate.setMonth(startDate.getMonth() + 1);
      accumulatedDepreciation = lastSchedule.accumulatedDepreciation;
      bookValue = lastSchedule.bookValue;
    }
    
    // Generate schedule for the next 12 months
    const schedules: AssetDepreciationSchedule[] = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < 12; i++) {
      // Stop if we've depreciated the full amount
      if (accumulatedDepreciation >= depreciableValue) break;
      
      const remainingValue = depreciableValue - accumulatedDepreciation;
      const depreciationAmount = Math.min(monthlyDepreciationAmount, remainingValue);
      
      accumulatedDepreciation += depreciationAmount;
      bookValue -= depreciationAmount;
      
      const schedule: AssetDepreciationSchedule = {
        id: `draft-${assetId}-${i}`,
        assetId,
        fiscalYear: currentFiscalYear.id,
        fiscalPeriod: currentFiscalPeriod.id,
        depreciationDate: new Date(currentDate),
        depreciationAmount,
        accumulatedDepreciation,
        bookValue,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      schedules.push(schedule);
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return Promise.resolve(schedules);
  }

  async recordDepreciation(assetId: string, depreciationDate: Date): Promise<AssetDepreciationSchedule | null> {
    const asset = await this.getAssetById(assetId);
    if (!asset) throw new Error(`Asset with ID ${assetId} not found`);
    
    if (asset.depreciationMethod === DepreciationMethod.NONE) {
      throw new Error(`Asset ${assetId} does not have a depreciation method set`);
    }
    
    // Calculate depreciation amount
    const depreciableValue = asset.purchasePrice - asset.residualValue;
    const monthlyDepreciationAmount = depreciableValue / asset.usefulLifeMonths;
    
    // Get existing depreciation schedules
    let existingSchedules = await this.getAssetDepreciationSchedule(assetId);
    existingSchedules = existingSchedules.sort((a, b) => 
      new Date(b.depreciationDate).getTime() - new Date(a.depreciationDate).getTime()
    );
    
    let accumulatedDepreciation = 0;
    let bookValue = asset.purchasePrice;
    
    if (existingSchedules.length > 0) {
      accumulatedDepreciation = existingSchedules[0].accumulatedDepreciation;
      bookValue = existingSchedules[0].bookValue;
    }
    
    // Check if we've already fully depreciated the asset
    if (accumulatedDepreciation >= depreciableValue) {
      throw new Error(`Asset ${assetId} is already fully depreciated`);
    }
    
    // Calculate remaining depreciation
    const remainingValue = depreciableValue - accumulatedDepreciation;
    const depreciationAmount = Math.min(monthlyDepreciationAmount, remainingValue);
    
    accumulatedDepreciation += depreciationAmount;
    bookValue -= depreciationAmount;
    
    // Get fiscal year and period
    const { currentFiscalYear, currentFiscalPeriod } = await financeService.getCurrentFiscalYearAndPeriod();
    
    // Create depreciation entry
    const newDepreciationEntry: AssetDepreciationSchedule = {
      id: (this.assetDepreciationSchedules.length + 1).toString(),
      assetId,
      fiscalYear: currentFiscalYear?.id || 'unknown',
      fiscalPeriod: currentFiscalPeriod?.id || 'unknown',
      depreciationDate,
      depreciationAmount,
      accumulatedDepreciation,
      bookValue,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create journal entry for depreciation
    try {
      const journalEntry = await generalLedgerService.createJournalEntry({
        date: depreciationDate,
        description: `Depreciation for asset ${asset.name} (${asset.assetNumber})`,
        reference: `DEP-${asset.assetNumber}-${depreciationDate.toISOString().substr(0, 7)}`,
        amount: depreciationAmount,
        type: TransactionType.JOURNAL_ENTRY,
        status: TransactionStatus.POSTED,
        fiscalYearId: currentFiscalYear?.id || 'unknown',
        fiscalPeriodId: currentFiscalPeriod?.id || 'unknown',
        createdById: 'system',
        reason: 'Monthly depreciation',
        recurring: false,
        approvalStatus: 'APPROVED',
        entries: [
          {
            accountId: asset.depreciationExpenseAccountId,
            description: `Depreciation expense for ${asset.name}`,
            debitAmount: depreciationAmount,
            creditAmount: 0
          },
          {
            accountId: asset.accumulatedDepreciationAccountId,
            description: `Accumulated depreciation for ${asset.name}`,
            debitAmount: 0,
            creditAmount: depreciationAmount
          }
        ]
      });
      
      // Update the depreciation entry with the journal entry ID
      newDepreciationEntry.journalEntryId = journalEntry.id;
      
      // Add to depreciation schedules
      this.assetDepreciationSchedules.push(newDepreciationEntry);
      
      // Update asset with new current value and last depreciation date
      await this.updateAsset(assetId, {
        currentValue: bookValue,
        lastDepreciationDate: depreciationDate
      });
      
      return Promise.resolve(newDepreciationEntry);
    } catch (error) {
      console.error('Failed to create depreciation journal entry:', error);
      throw new Error('Failed to record depreciation');
    }
  }

  async runMonthlyDepreciation(asOfDate: Date = new Date()): Promise<{ 
    successful: number; 
    failed: number; 
    skipped: number; 
    details: Array<{ assetId: string; status: 'success' | 'failed' | 'skipped'; message?: string }> 
  }> {
    const activeAssets = await this.getAssetsByStatus(AssetStatus.ACTIVE);
    
    const results = {
      successful: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{ assetId: string; status: 'success' | 'failed' | 'skipped'; message?: string }>
    };
    
    for (const asset of activeAssets) {
      try {
        // Skip assets without depreciation
        if (asset.depreciationMethod === DepreciationMethod.NONE) {
          results.skipped++;
          results.details.push({
            assetId: asset.id,
            status: 'skipped',
            message: 'Asset does not have depreciation method'
          });
          continue;
        }
        
        // Skip assets that haven't been placed in service yet
        if (new Date(asset.inServiceDate) > asOfDate) {
          results.skipped++;
          results.details.push({
            assetId: asset.id,
            status: 'skipped',
            message: 'Asset not yet in service'
          });
          continue;
        }
        
        // Skip assets that have already been depreciated this month
        if (asset.lastDepreciationDate) {
          const lastDepDate = new Date(asset.lastDepreciationDate);
          if (lastDepDate.getMonth() === asOfDate.getMonth() && 
              lastDepDate.getFullYear() === asOfDate.getFullYear()) {
            results.skipped++;
            results.details.push({
              assetId: asset.id,
              status: 'skipped',
              message: 'Asset already depreciated this month'
            });
            continue;
          }
        }
        
        // Record depreciation
        await this.recordDepreciation(asset.id, asOfDate);
        results.successful++;
        results.details.push({
          assetId: asset.id,
          status: 'success'
        });
      } catch (error: any) {
        results.failed++;
        results.details.push({
          assetId: asset.id,
          status: 'failed',
          message: error.message
        });
      }
    }
    
    return Promise.resolve(results);
  }

  // Asset Disposal Methods
  async getAllAssetDisposals(): Promise<AssetDisposal[]> {
    return Promise.resolve([...this.assetDisposals]);
  }

  async getAssetDisposalById(id: string): Promise<AssetDisposal | null> {
    const disposal = this.assetDisposals.find(d => d.id === id);
    return Promise.resolve(disposal || null);
  }

  async getAssetDisposalsByAsset(assetId: string): Promise<AssetDisposal[]> {
    const disposals = this.assetDisposals.filter(d => d.assetId === assetId);
    return Promise.resolve(disposals);
  }

  async disposeAsset(disposalData: Omit<AssetDisposal, 'id' | 'createdAt' | 'updatedAt' | 'gainLoss'>): Promise<AssetDisposal> {
    const asset = await this.getAssetById(disposalData.assetId);
    if (!asset) throw new Error(`Asset with ID ${disposalData.assetId} not found`);
    
    if (asset.status === AssetStatus.DISPOSED) {
      throw new Error(`Asset ${disposalData.assetId} has already been disposed`);
    }
    
    // Calculate gain/loss on disposal
    let salePrice = disposalData.salePrice || 0;
    let disposalCosts = disposalData.disposalCosts || 0;
    let netSaleProceeds = salePrice - disposalCosts;
    let gainLoss = netSaleProceeds - asset.currentValue;
    
    // Create the disposal record
    const newDisposal: AssetDisposal = {
      ...disposalData,
      id: (this.assetDisposals.length + 1).toString(),
      gainLoss,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create journal entry for disposal
    try {
      const { currentFiscalYear, currentFiscalPeriod } = await financeService.getCurrentFiscalYearAndPeriod();
      
      const journalEntryDescription = `Disposal of asset ${asset.name} (${asset.assetNumber})`;
      
      // Calculate accumulated depreciation
      const totalAccumulatedDepreciation = asset.purchasePrice - asset.currentValue;
      
      // Create journal entry
      const journalEntry = await generalLedgerService.createJournalEntry({
        date: disposalData.disposalDate,
        description: journalEntryDescription,
        reference: `DISP-${asset.assetNumber}`,
        amount: asset.purchasePrice,
        type: TransactionType.JOURNAL_ENTRY,
        status: TransactionStatus.POSTED,
        fiscalYearId: currentFiscalYear?.id || 'unknown',
        fiscalPeriodId: currentFiscalPeriod?.id || 'unknown',
        createdById: disposalData.createdById,
        reason: `Asset disposal via ${disposalData.disposalMethod}`,
        recurring: false,
        approvalStatus: 'APPROVED',
        entries: [
          // Remove the asset from books
          {
            accountId: asset.accumulatedDepreciationAccountId,
            description: 'Remove accumulated depreciation',
            debitAmount: totalAccumulatedDepreciation,
            creditAmount: 0
          },
          {
            accountId: asset.accountId,
            description: 'Remove asset cost basis',
            debitAmount: 0,
            creditAmount: asset.purchasePrice
          },
          // Record sale proceeds if applicable
          ...(netSaleProceeds > 0 ? [
            {
              accountId: '101', // Cash or receivable account
              description: 'Sale proceeds',
              debitAmount: netSaleProceeds,
              creditAmount: 0
            }
          ] : []),
          // Record gain/loss
          ...(gainLoss !== 0 ? [
            {
              accountId: gainLoss > 0 ? '701' : '801', // Gain or loss account
              description: `${gainLoss > 0 ? 'Gain' : 'Loss'} on asset disposal`,
              debitAmount: gainLoss < 0 ? Math.abs(gainLoss) : 0,
              creditAmount: gainLoss > 0 ? gainLoss : 0
            }
          ] : [])
        ]
      });
      
      // Update the disposal with the journal entry ID
      newDisposal.journalEntryId = journalEntry.id;
      
      // Add to disposals
      this.assetDisposals.push(newDisposal);
      
      // Update asset status
      await this.updateAsset(asset.id, {
        status: AssetStatus.DISPOSED,
        updatedAt: new Date()
      });
      
      return Promise.resolve(newDisposal);
    } catch (error) {
      console.error('Failed to create disposal journal entry:', error);
      throw new Error('Failed to dispose asset');
    }
  }

  // Asset Maintenance Methods
  async getAllAssetMaintenances(): Promise<AssetMaintenance[]> {
    return Promise.resolve([...this.assetMaintenances]);
  }

  async getAssetMaintenanceById(id: string): Promise<AssetMaintenance | null> {
    const maintenance = this.assetMaintenances.find(m => m.id === id);
    return Promise.resolve(maintenance || null);
  }

  async getAssetMaintenancesByAsset(assetId: string): Promise<AssetMaintenance[]> {
    const maintenances = this.assetMaintenances.filter(m => m.assetId === assetId);
    return Promise.resolve(maintenances);
  }

  async createAssetMaintenance(maintenance: Omit<AssetMaintenance, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetMaintenance> {
    const asset = await this.getAssetById(maintenance.assetId);
    if (!asset) throw new Error(`Asset with ID ${maintenance.assetId} not found`);
    
    const newMaintenance: AssetMaintenance = {
      ...maintenance,
      id: (this.assetMaintenances.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.assetMaintenances.push(newMaintenance);
    
    // If the asset is in MAINTENANCE status, update it back to ACTIVE
    if (asset.status === AssetStatus.MAINTENANCE) {
      await this.updateAsset(asset.id, {
        status: AssetStatus.ACTIVE,
        notes: asset.notes ? `${asset.notes}\nMaintenance completed on ${maintenance.date.toLocaleDateString()}` : `Maintenance completed on ${maintenance.date.toLocaleDateString()}`
      });
    }
    
    return Promise.resolve(newMaintenance);
  }

  async scheduleAssetMaintenance(assetId: string, date: Date, maintenanceType: string, notes?: string): Promise<Asset | null> {
    const asset = await this.getAssetById(assetId);
    if (!asset) throw new Error(`Asset with ID ${assetId} not found`);
    
    await this.updateAsset(assetId, {
      status: AssetStatus.MAINTENANCE,
      maintenanceSchedule: `${maintenanceType} scheduled for ${date.toLocaleDateString()}`,
      notes: notes ? (asset.notes ? `${asset.notes}\n${notes}` : notes) : asset.notes
    });
    
    return this.getAssetById(assetId);
  }

  // Asset Transfer Methods
  async getAllAssetTransfers(): Promise<AssetTransfer[]> {
    return Promise.resolve([...this.assetTransfers]);
  }

  async getAssetTransferById(id: string): Promise<AssetTransfer | null> {
    const transfer = this.assetTransfers.find(t => t.id === id);
    return Promise.resolve(transfer || null);
  }

  async getAssetTransfersByAsset(assetId: string): Promise<AssetTransfer[]> {
    const transfers = this.assetTransfers.filter(t => t.assetId === assetId);
    return Promise.resolve(transfers);
  }

  async transferAsset(transferData: Omit<AssetTransfer, 'id' | 'createdAt' | 'updatedAt' | 'previousDepartment' | 'previousLocation' | 'previousAssignee'>): Promise<AssetTransfer> {
    const asset = await this.getAssetById(transferData.assetId);
    if (!asset) throw new Error(`Asset with ID ${transferData.assetId} not found`);
    
    const newTransfer: AssetTransfer = {
      ...transferData,
      id: (this.assetTransfers.length + 1).toString(),
      previousDepartment: asset.department,
      previousLocation: asset.location,
      previousAssignee: asset.assignedTo,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.assetTransfers.push(newTransfer);
    
    // Update asset with new location, department, assignee
    await this.updateAsset(asset.id, {
      department: transferData.newDepartment,
      location: transferData.newLocation,
      assignedTo: transferData.newAssignee,
      notes: asset.notes ? `${asset.notes}\nTransferred on ${transferData.transferDate.toLocaleDateString()}: ${transferData.reason}` : `Transferred on ${transferData.transferDate.toLocaleDateString()}: ${transferData.reason}`
    });
    
    return Promise.resolve(newTransfer);
  }

  // Asset Reporting Methods
  async getAssetValueSummary(): Promise<{
    totalAssets: number;
    totalCost: number;
    totalAccumulatedDepreciation: number;
    netBookValue: number;
    assetsByType: Array<{ type: AssetType; count: number; totalCost: number; netBookValue: number }>;
    depreciationSummary: { lastMonth: number; lastYear: number; ytd: number };
  }> {
    const activeAssets = await this.getAssetsByStatus(AssetStatus.ACTIVE);
    
    const totalAssets = activeAssets.length;
    const totalCost = activeAssets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
    const totalAccumulatedDepreciation = activeAssets.reduce((sum, asset) => sum + (asset.purchasePrice - asset.currentValue), 0);
    const netBookValue = activeAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
    
    // Group by type
    const assetsByType = Object.values(AssetType).map(type => {
      const assetsOfType = activeAssets.filter(a => a.type === type);
      return {
        type,
        count: assetsOfType.length,
        totalCost: assetsOfType.reduce((sum, asset) => sum + asset.purchasePrice, 0),
        netBookValue: assetsOfType.reduce((sum, asset) => sum + asset.currentValue, 0)
      };
    }).filter(group => group.count > 0);
    
    // Calculate depreciation totals
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const beginningOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Get all depreciation entries
    const allDepreciationEntries = this.assetDepreciationSchedules;
    
    const lastMonthDepreciation = allDepreciationEntries
      .filter(entry => {
        const entryDate = new Date(entry.depreciationDate);
        return entryDate.getMonth() === lastMonth.getMonth() && 
               entryDate.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, entry) => sum + entry.depreciationAmount, 0);
    
    const ytdDepreciation = allDepreciationEntries
      .filter(entry => {
        const entryDate = new Date(entry.depreciationDate);
        return entryDate >= beginningOfYear && entryDate <= now;
      })
      .reduce((sum, entry) => sum + entry.depreciationAmount, 0);
    
    const lastYearDepreciation = allDepreciationEntries
      .filter(entry => {
        const entryDate = new Date(entry.depreciationDate);
        return entryDate.getFullYear() === now.getFullYear() - 1;
      })
      .reduce((sum, entry) => sum + entry.depreciationAmount, 0);
    
    return {
      totalAssets,
      totalCost,
      totalAccumulatedDepreciation,
      netBookValue,
      assetsByType,
      depreciationSummary: {
        lastMonth: lastMonthDepreciation,
        lastYear: lastYearDepreciation,
        ytd: ytdDepreciation
      }
    };
  }

  async getAssetsByReplacementNeeds(yearsThreshold: number = 1): Promise<Asset[]> {
    const activeAssets = await this.getAssetsByStatus(AssetStatus.ACTIVE);
    const now = new Date();
    
    return activeAssets.filter(asset => {
      // Calculate when the asset will be fully depreciated
      const inServiceDate = new Date(asset.inServiceDate);
      const estimatedEndOfLife = new Date(inServiceDate);
      estimatedEndOfLife.setFullYear(estimatedEndOfLife.getFullYear() + asset.usefulLifeYears);
      
      // Check if the asset will reach end of useful life within the threshold
      const msPerYear = 365 * 24 * 60 * 60 * 1000;
      const yearsRemaining = (estimatedEndOfLife.getTime() - now.getTime()) / msPerYear;
      
      return yearsRemaining <= yearsThreshold;
    });
  }

  async generateDepreciationForecast(years: number = 3): Promise<{
    periods: string[];
    depreciation: number[];
    accumulatedDepreciation: number[];
    netBookValue: number[];
  }> {
    const activeAssets = await this.getAssetsByStatus(AssetStatus.ACTIVE);
    
    // Create a map to store depreciation by period
    const depreciationByPeriod = new Map<string, number>();
    const now = new Date();
    let totalCurrentBookValue = activeAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
    let accumulatedDepreciation = activeAssets.reduce((sum, asset) => sum + (asset.purchasePrice - asset.currentValue), 0);
    
    // For each period in the forecast
    for (let i = 0; i < years * 12; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const periodKey = `${forecastDate.getFullYear()}-${(forecastDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      let periodDepreciation = 0;
      
      // Calculate depreciation for each asset
      for (const asset of activeAssets) {
        if (asset.depreciationMethod === DepreciationMethod.NONE) continue;
        
        const inServiceDate = new Date(asset.inServiceDate);
        const estimatedEndOfLife = new Date(inServiceDate);
        estimatedEndOfLife.setFullYear(estimatedEndOfLife.getFullYear() + asset.usefulLifeYears);
        
        // Skip if asset is fully depreciated or not yet in service
        if (forecastDate >= estimatedEndOfLife || forecastDate < inServiceDate) continue;
        
        // Calculate monthly depreciation
        const depreciableValue = asset.purchasePrice - asset.residualValue;
        const monthlyDepreciation = depreciableValue / asset.usefulLifeMonths;
        
        periodDepreciation += monthlyDepreciation;
      }
      
      depreciationByPeriod.set(periodKey, periodDepreciation);
    }
    
    // Convert maps to arrays for the return value
    const periods: string[] = Array.from(depreciationByPeriod.keys()).sort();
    const depreciation: number[] = periods.map(period => depreciationByPeriod.get(period) || 0);
    const accumulatedDepreciationArray: number[] = [];
    const netBookValueArray: number[] = [];
    
    let runningAccumulatedDepreciation = accumulatedDepreciation;
    let runningNetBookValue = totalCurrentBookValue;
    
    for (const amount of depreciation) {
      runningAccumulatedDepreciation += amount;
      runningNetBookValue -= amount;
      
      accumulatedDepreciationArray.push(runningAccumulatedDepreciation);
      netBookValueArray.push(runningNetBookValue);
    }
    
    return {
      periods,
      depreciation,
      accumulatedDepreciation: accumulatedDepreciationArray,
      netBookValue: netBookValueArray
    };
  }

  // Barcode/QR Code Methods
  async assignBarcode(assetId: string, barcode: string): Promise<Asset | null> {
    const asset = await this.getAssetById(assetId);
    if (!asset) return Promise.resolve(null);
    
    // Check if barcode is already assigned to another asset
    const existingAsset = this.assets.find(a => a.barcode === barcode && a.id !== assetId);
    if (existingAsset) {
      throw new Error(`Barcode ${barcode} is already assigned to asset ${existingAsset.name}`);
    }
    
    await this.updateAsset(assetId, { barcode });
    return this.getAssetById(assetId);
  }

  async findAssetByBarcode(barcode: string): Promise<Asset | null> {
    const asset = this.assets.find(a => a.barcode === barcode);
    return Promise.resolve(asset || null);
  }
}

// Create and export singleton instance
export const assetManagementService = new AssetManagementService();