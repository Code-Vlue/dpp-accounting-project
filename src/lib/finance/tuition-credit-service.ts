// src/lib/finance/tuition-credit-service.ts
import { 
  Provider, 
  ProviderType, 
  ProviderStatus,
  ProviderQualityRating,
  TuitionCredit,
  TuitionCreditStatus,
  TuitionCreditBatch,
  ProviderPayment,
  ProviderPaymentBatch,
  PaymentStatus,
  PaymentMethod,
  PaymentPriority,
  TransactionType,
  TransactionStatus
} from '@/types/finance';
import { v4 as uuidv4 } from 'uuid';
import { generalLedgerService } from './general-ledger-service';

// Mock data storage
const providers: Provider[] = [];
const tuitionCredits: TuitionCredit[] = [];
const tuitionCreditBatches: TuitionCreditBatch[] = [];
const providerPayments: ProviderPayment[] = [];
const providerPaymentBatches: ProviderPaymentBatch[] = [];

/**
 * Service class for managing tuition credits and provider payments
 */
class TuitionCreditService {
  // Provider management
  async getAllProviders(): Promise<Provider[]> {
    return providers;
  }

  async getProviderById(id: string): Promise<Provider | null> {
    const provider = providers.find(p => p.id === id);
    return provider || null;
  }

  async getProvidersByType(type: ProviderType): Promise<Provider[]> {
    return providers.filter(p => p.providerType === type);
  }

  async getProvidersByStatus(status: ProviderStatus): Promise<Provider[]> {
    return providers.filter(p => p.providerStatus === status);
  }

  async getProvidersByQualityRating(rating: ProviderQualityRating): Promise<Provider[]> {
    return providers.filter(p => p.qualityRating === rating);
  }

  async createProvider(provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt' | 'yearToDatePayments' | 'yearToDateCredits'>): Promise<Provider> {
    const newProvider: Provider = {
      ...provider,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      yearToDatePayments: 0,
      yearToDateCredits: 0,
      isProvider: true,
    };
    
    providers.push(newProvider);
    return newProvider;
  }

  async updateProvider(id: string, providerData: Partial<Provider>): Promise<Provider | null> {
    const index = providers.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    const updatedProvider = {
      ...providers[index],
      ...providerData,
      updatedAt: new Date()
    };
    
    providers[index] = updatedProvider;
    return updatedProvider;
  }

  // Tuition Credit Management
  async getAllTuitionCredits(): Promise<TuitionCredit[]> {
    return tuitionCredits;
  }

  async getTuitionCreditById(id: string): Promise<TuitionCredit | null> {
    const credit = tuitionCredits.find(c => c.id === id);
    return credit || null;
  }

  async getTuitionCreditsByProvider(providerId: string): Promise<TuitionCredit[]> {
    return tuitionCredits.filter(c => c.providerId === providerId);
  }

  async getTuitionCreditsByStatus(status: TuitionCreditStatus): Promise<TuitionCredit[]> {
    return tuitionCredits.filter(c => c.creditStatus === status);
  }

  async getTuitionCreditsByPeriod(startDate: Date, endDate: Date): Promise<TuitionCredit[]> {
    return tuitionCredits.filter(c => 
      c.creditPeriodStart >= startDate && c.creditPeriodEnd <= endDate
    );
  }

  async createTuitionCredit(creditData: Omit<TuitionCredit, 'id' | 'createdAt' | 'updatedAt' | 'entries'>): Promise<TuitionCredit> {
    const provider = await this.getProviderById(creditData.providerId);
    if (!provider) {
      throw new Error(`Provider ${creditData.providerId} not found`);
    }
    
    // Create transaction entries for accounting
    const entries = [
      {
        id: uuidv4(),
        transactionId: 'pending',
        accountId: creditData.accountId || '1', // Default account for tuition credits
        description: `Tuition credit for ${creditData.studentName}`,
        debitAmount: creditData.dppPortion,
        creditAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        transactionId: 'pending',
        accountId: '2', // Accounts payable account for provider
        description: `Provider payment for ${creditData.studentName}`,
        debitAmount: 0,
        creditAmount: creditData.dppPortion,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const newCredit: TuitionCredit = {
      ...creditData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      type: TransactionType.TUITION_CREDIT,
      status: TransactionStatus.DRAFT,
      entries,
      isAdjustment: creditData.isAdjustment || false
    };
    
    tuitionCredits.push(newCredit);
    
    // Update provider's year-to-date credits
    await this.updateProvider(provider.id, {
      yearToDateCredits: provider.yearToDateCredits + creditData.dppPortion
    });
    
    return newCredit;
  }

  async updateTuitionCredit(id: string, creditData: Partial<TuitionCredit>): Promise<TuitionCredit | null> {
    const index = tuitionCredits.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    // If amount is changing, update provider's year-to-date credits
    if (creditData.dppPortion && creditData.dppPortion !== tuitionCredits[index].dppPortion) {
      const provider = await this.getProviderById(tuitionCredits[index].providerId);
      if (provider) {
        const difference = creditData.dppPortion - tuitionCredits[index].dppPortion;
        await this.updateProvider(provider.id, {
          yearToDateCredits: provider.yearToDateCredits + difference
        });
      }
    }
    
    const updatedCredit = {
      ...tuitionCredits[index],
      ...creditData,
      updatedAt: new Date()
    };
    
    tuitionCredits[index] = updatedCredit;
    return updatedCredit;
  }

  async approveTuitionCredit(id: string, approverId: string): Promise<TuitionCredit | null> {
    const credit = await this.getTuitionCreditById(id);
    if (!credit) return null;
    
    if (credit.creditStatus !== TuitionCreditStatus.PENDING_APPROVAL) {
      throw new Error(`Cannot approve credit ${id} with status ${credit.creditStatus}`);
    }
    
    const updatedCredit = await this.updateTuitionCredit(id, {
      creditStatus: TuitionCreditStatus.APPROVED,
      approvalDate: new Date(),
      approvedById: approverId,
      approvalChain: [...credit.approvalChain, approverId],
      status: TransactionStatus.APPROVED
    });
    
    return updatedCredit;
  }

  async rejectTuitionCredit(id: string, approverId: string, rejectionReason: string): Promise<TuitionCredit | null> {
    const credit = await this.getTuitionCreditById(id);
    if (!credit) return null;
    
    if (credit.creditStatus !== TuitionCreditStatus.PENDING_APPROVAL) {
      throw new Error(`Cannot reject credit ${id} with status ${credit.creditStatus}`);
    }
    
    const updatedCredit = await this.updateTuitionCredit(id, {
      creditStatus: TuitionCreditStatus.REJECTED,
      approvalDate: new Date(),
      approvedById: approverId,
      rejectionReason,
      approvalChain: [...credit.approvalChain, approverId],
      status: TransactionStatus.VOIDED
    });
    
    // Adjust the provider's year-to-date credits
    const provider = await this.getProviderById(credit.providerId);
    if (provider) {
      await this.updateProvider(provider.id, {
        yearToDateCredits: provider.yearToDateCredits - credit.dppPortion
      });
    }
    
    return updatedCredit;
  }

  async createAdjustmentCredit(originalCreditId: string, adjustmentData: Partial<TuitionCredit>, userId: string): Promise<TuitionCredit | null> {
    const originalCredit = await this.getTuitionCreditById(originalCreditId);
    if (!originalCredit) return null;
    
    // Create adjustment credit based on the original
    const adjustmentCredit: Omit<TuitionCredit, 'id' | 'createdAt' | 'updatedAt' | 'entries'> = {
      ...originalCredit,
      ...adjustmentData,
      isAdjustment: true,
      originalCreditId,
      creditStatus: TuitionCreditStatus.DRAFT,
      status: TransactionStatus.DRAFT,
      approvalChain: [userId],
      createdById: userId
    };
    
    return this.createTuitionCredit(adjustmentCredit);
  }

  // Tuition Credit Batch Management
  async getAllTuitionCreditBatches(): Promise<TuitionCreditBatch[]> {
    return tuitionCreditBatches;
  }

  async getTuitionCreditBatchById(id: string): Promise<TuitionCreditBatch | null> {
    const batch = tuitionCreditBatches.find(b => b.id === id);
    return batch || null;
  }

  async createTuitionCreditBatch(batchData: Omit<TuitionCreditBatch, 'id' | 'createdAt' | 'updatedAt'>): Promise<TuitionCreditBatch> {
    const newBatch: TuitionCreditBatch = {
      ...batchData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    tuitionCreditBatches.push(newBatch);
    return newBatch;
  }

  async updateTuitionCreditBatch(id: string, batchData: Partial<TuitionCreditBatch>): Promise<TuitionCreditBatch | null> {
    const index = tuitionCreditBatches.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    const updatedBatch = {
      ...tuitionCreditBatches[index],
      ...batchData,
      updatedAt: new Date()
    };
    
    tuitionCreditBatches[index] = updatedBatch;
    return updatedBatch;
  }

  async processTuitionCreditBatch(id: string, userId: string): Promise<TuitionCreditBatch | null> {
    const batch = await this.getTuitionCreditBatchById(id);
    if (!batch) return null;
    
    if (batch.status !== TuitionCreditStatus.APPROVED) {
      throw new Error(`Cannot process batch ${id} with status ${batch.status}`);
    }
    
    // Update all credits in the batch
    const updates = batch.creditIds.map(async (creditId) => {
      return this.updateTuitionCredit(creditId, {
        creditStatus: TuitionCreditStatus.PROCESSED,
        paymentBatchId: id
      });
    });
    
    await Promise.all(updates);
    
    // Update the batch
    const updatedBatch = await this.updateTuitionCreditBatch(id, {
      status: TuitionCreditStatus.PROCESSED,
      processedAt: new Date(),
      processedById: userId
    });
    
    return updatedBatch;
  }

  async addCreditToBatch(batchId: string, creditId: string): Promise<TuitionCreditBatch | null> {
    const batch = await this.getTuitionCreditBatchById(batchId);
    if (!batch) return null;
    
    const credit = await this.getTuitionCreditById(creditId);
    if (!credit) throw new Error(`Credit ${creditId} not found`);
    
    if (batch.creditIds.includes(creditId)) {
      return batch; // Credit already in batch
    }
    
    // Add credit to batch
    const updatedCreditIds = [...batch.creditIds, creditId];
    
    // Update the provider IDs if needed
    let updatedProviderIds = [...batch.providerIds];
    if (!updatedProviderIds.includes(credit.providerId)) {
      updatedProviderIds.push(credit.providerId);
    }
    
    // Update the total amount
    const newTotalAmount = batch.totalAmount + credit.dppPortion;
    
    const updatedBatch = await this.updateTuitionCreditBatch(batchId, {
      creditIds: updatedCreditIds,
      providerIds: updatedProviderIds,
      totalAmount: newTotalAmount
    });
    
    // Update the credit
    await this.updateTuitionCredit(creditId, {
      paymentBatchId: batchId
    });
    
    return updatedBatch;
  }

  async removeCreditFromBatch(batchId: string, creditId: string): Promise<TuitionCreditBatch | null> {
    const batch = await this.getTuitionCreditBatchById(batchId);
    if (!batch) return null;
    
    const credit = await this.getTuitionCreditById(creditId);
    if (!credit) throw new Error(`Credit ${creditId} not found`);
    
    if (!batch.creditIds.includes(creditId)) {
      return batch; // Credit not in batch
    }
    
    // Remove credit from batch
    const updatedCreditIds = batch.creditIds.filter(id => id !== creditId);
    
    // Check if we need to remove the provider ID
    const otherProviderCredits = batch.creditIds
      .filter(id => id !== creditId)
      .map(id => tuitionCredits.find(c => c.id === id))
      .filter(c => c && c.providerId === credit.providerId);
    
    let updatedProviderIds = [...batch.providerIds];
    if (otherProviderCredits.length === 0) {
      updatedProviderIds = updatedProviderIds.filter(id => id !== credit.providerId);
    }
    
    // Update the total amount
    const newTotalAmount = batch.totalAmount - credit.dppPortion;
    
    const updatedBatch = await this.updateTuitionCreditBatch(batchId, {
      creditIds: updatedCreditIds,
      providerIds: updatedProviderIds,
      totalAmount: newTotalAmount
    });
    
    // Update the credit
    await this.updateTuitionCredit(creditId, {
      paymentBatchId: undefined
    });
    
    return updatedBatch;
  }

  // Provider Payment Management
  async getAllProviderPayments(): Promise<ProviderPayment[]> {
    return providerPayments;
  }

  async getProviderPaymentById(id: string): Promise<ProviderPayment | null> {
    const payment = providerPayments.find(p => p.id === id);
    return payment || null;
  }

  async getProviderPaymentsByProvider(providerId: string): Promise<ProviderPayment[]> {
    return providerPayments.filter(p => p.providerId === providerId);
  }

  async getProviderPaymentsByStatus(status: PaymentStatus): Promise<ProviderPayment[]> {
    return providerPayments.filter(p => p.status === status);
  }

  async createProviderPayment(paymentData: Omit<ProviderPayment, 'id' | 'createdAt' | 'updatedAt' | 'processedAt' | 'processedById' | 'voidedAt' | 'voidedById'>): Promise<ProviderPayment> {
    const provider = await this.getProviderById(paymentData.providerId);
    if (!provider) {
      throw new Error(`Provider ${paymentData.providerId} not found`);
    }
    
    const newPayment: ProviderPayment = {
      ...paymentData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    providerPayments.push(newPayment);
    return newPayment;
  }

  async updateProviderPayment(id: string, paymentData: Partial<ProviderPayment>): Promise<ProviderPayment | null> {
    const index = providerPayments.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    const updatedPayment = {
      ...providerPayments[index],
      ...paymentData,
      updatedAt: new Date()
    };
    
    providerPayments[index] = updatedPayment;
    return updatedPayment;
  }

  async processProviderPayment(id: string, userId: string): Promise<ProviderPayment | null> {
    const payment = await this.getProviderPaymentById(id);
    if (!payment) return null;
    
    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error(`Cannot process payment ${id} with status ${payment.status}`);
    }
    
    // Process the payment
    const updatedPayment = await this.updateProviderPayment(id, {
      status: PaymentStatus.COMPLETED,
      processedAt: new Date(),
      processedById: userId
    });
    
    // Update the tuition credits associated with this payment
    const updates = payment.tuitionCreditIds.map(async (creditId) => {
      return this.updateTuitionCredit(creditId, {
        creditStatus: TuitionCreditStatus.PAID,
        paymentDate: new Date()
      });
    });
    
    await Promise.all(updates);
    
    return updatedPayment;
  }

  async voidProviderPayment(id: string, userId: string, voidReason: string): Promise<ProviderPayment | null> {
    const payment = await this.getProviderPaymentById(id);
    if (!payment) return null;
    
    if (payment.status === PaymentStatus.VOIDED) {
      return payment; // Already voided
    }
    
    // Void the payment
    const updatedPayment = await this.updateProviderPayment(id, {
      status: PaymentStatus.VOIDED,
      voidedAt: new Date(),
      voidedById: userId,
      voidReason
    });
    
    // Update the tuition credits associated with this payment
    const updates = payment.tuitionCreditIds.map(async (creditId) => {
      return this.updateTuitionCredit(creditId, {
        creditStatus: TuitionCreditStatus.PROCESSED, // Revert to processed state
        paymentDate: undefined
      });
    });
    
    await Promise.all(updates);
    
    return updatedPayment;
  }

  // Provider Payment Batch Management
  async getAllProviderPaymentBatches(): Promise<ProviderPaymentBatch[]> {
    return providerPaymentBatches;
  }

  async getProviderPaymentBatchById(id: string): Promise<ProviderPaymentBatch | null> {
    const batch = providerPaymentBatches.find(b => b.id === id);
    return batch || null;
  }

  async createProviderPaymentBatch(batchData: Omit<ProviderPaymentBatch, 'id' | 'createdAt' | 'updatedAt' | 'processedAt' | 'processedById'>): Promise<ProviderPaymentBatch> {
    const newBatch: ProviderPaymentBatch = {
      ...batchData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    providerPaymentBatches.push(newBatch);
    return newBatch;
  }

  async updateProviderPaymentBatch(id: string, batchData: Partial<ProviderPaymentBatch>): Promise<ProviderPaymentBatch | null> {
    const index = providerPaymentBatches.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    const updatedBatch = {
      ...providerPaymentBatches[index],
      ...batchData,
      updatedAt: new Date()
    };
    
    providerPaymentBatches[index] = updatedBatch;
    return updatedBatch;
  }

  async processProviderPaymentBatch(id: string, userId: string): Promise<ProviderPaymentBatch | null> {
    const batch = await this.getProviderPaymentBatchById(id);
    if (!batch) return null;
    
    if (batch.status !== PaymentStatus.PENDING) {
      throw new Error(`Cannot process batch ${id} with status ${batch.status}`);
    }
    
    // Process all payments in the batch
    const updates = batch.paymentIds.map(async (paymentId) => {
      return this.processProviderPayment(paymentId, userId);
    });
    
    await Promise.all(updates);
    
    // Update the batch
    const updatedBatch = await this.updateProviderPaymentBatch(id, {
      status: PaymentStatus.COMPLETED,
      processedAt: new Date(),
      processedById: userId
    });
    
    return updatedBatch;
  }

  async generatePayfileForBatch(id: string): Promise<ProviderPaymentBatch | null> {
    const batch = await this.getProviderPaymentBatchById(id);
    if (!batch) return null;
    
    if (batch.status !== PaymentStatus.COMPLETED && batch.status !== PaymentStatus.PROCESSING) {
      throw new Error(`Cannot generate payfile for batch ${id} with status ${batch.status}`);
    }
    
    if (batch.payfileGenerated) {
      return batch; // Payfile already generated
    }
    
    // Generate payfile (in a real implementation, this would create an actual file)
    const payfileUrl = `/payfiles/batch-${id}-${new Date().toISOString()}.csv`;
    
    // Update the batch
    const updatedBatch = await this.updateProviderPaymentBatch(id, {
      payfileGenerated: true,
      payfileGeneratedAt: new Date(),
      payfileUrl
    });
    
    return updatedBatch;
  }

  async addPaymentToBatch(batchId: string, paymentId: string): Promise<ProviderPaymentBatch | null> {
    const batch = await this.getProviderPaymentBatchById(batchId);
    if (!batch) return null;
    
    const payment = await this.getProviderPaymentById(paymentId);
    if (!payment) throw new Error(`Payment ${paymentId} not found`);
    
    if (batch.paymentIds.includes(paymentId)) {
      return batch; // Payment already in batch
    }
    
    // Add payment to batch
    const updatedPaymentIds = [...batch.paymentIds, paymentId];
    
    // Update the total amount and provider count
    const totalAmount = batch.totalAmount + payment.amount;
    
    // Check if this is a new provider in the batch
    const otherProviderPayments = batch.paymentIds
      .map(id => providerPayments.find(p => p.id === id))
      .filter(p => p && p.providerId === payment.providerId);
    
    const providerCount = otherProviderPayments.length === 0 ? 
      batch.providerCount + 1 : batch.providerCount;
    
    const updatedBatch = await this.updateProviderPaymentBatch(batchId, {
      paymentIds: updatedPaymentIds,
      totalAmount,
      providerCount
    });
    
    // Update the payment to reference this batch
    await this.updateProviderPayment(paymentId, {
      batchId
    });
    
    return updatedBatch;
  }

  async removePaymentFromBatch(batchId: string, paymentId: string): Promise<ProviderPaymentBatch | null> {
    const batch = await this.getProviderPaymentBatchById(batchId);
    if (!batch) return null;
    
    const payment = await this.getProviderPaymentById(paymentId);
    if (!payment) throw new Error(`Payment ${paymentId} not found`);
    
    if (!batch.paymentIds.includes(paymentId)) {
      return batch; // Payment not in batch
    }
    
    // Remove payment from batch
    const updatedPaymentIds = batch.paymentIds.filter(id => id !== paymentId);
    
    // Update the total amount
    const totalAmount = batch.totalAmount - payment.amount;
    
    // Check if we need to decrease the provider count
    const otherProviderPayments = batch.paymentIds
      .filter(id => id !== paymentId)
      .map(id => providerPayments.find(p => p.id === id))
      .filter(p => p && p.providerId === payment.providerId);
    
    const providerCount = otherProviderPayments.length === 0 ? 
      batch.providerCount - 1 : batch.providerCount;
    
    const updatedBatch = await this.updateProviderPaymentBatch(batchId, {
      paymentIds: updatedPaymentIds,
      totalAmount,
      providerCount
    });
    
    // Update the payment to remove the batch reference
    await this.updateProviderPayment(paymentId, {
      batchId: undefined
    });
    
    return updatedBatch;
  }

  // Tuition Credit Reporting and Analytics
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
    const provider = await this.getProviderById(providerId);
    if (!provider) {
      return {
        provider: null,
        totalCredits: 0,
        paidCredits: 0,
        pendingCredits: 0,
        creditsByStatus: {} as Record<TuitionCreditStatus, number>,
        creditsByMonth: {},
        averageCreditAmount: 0,
        studentCount: 0
      };
    }
    
    // Get all tuition credits for this provider in the date range
    const credits = tuitionCredits.filter(c => 
      c.providerId === providerId && 
      c.creditPeriodStart >= startDate && 
      c.creditPeriodEnd <= endDate
    );
    
    // Calculate summary
    const totalCredits = credits.reduce((sum, c) => sum + c.dppPortion, 0);
    
    const paidCredits = credits
      .filter(c => c.creditStatus === TuitionCreditStatus.PAID)
      .reduce((sum, c) => sum + c.dppPortion, 0);
    
    const pendingCredits = credits
      .filter(c => 
        c.creditStatus === TuitionCreditStatus.PENDING_APPROVAL || 
        c.creditStatus === TuitionCreditStatus.APPROVED || 
        c.creditStatus === TuitionCreditStatus.PROCESSED
      )
      .reduce((sum, c) => sum + c.dppPortion, 0);
    
    // Group by status
    const creditsByStatus = credits.reduce((acc, c) => {
      if (!acc[c.creditStatus]) acc[c.creditStatus] = 0;
      acc[c.creditStatus] += c.dppPortion;
      return acc;
    }, {} as Record<TuitionCreditStatus, number>);
    
    // Group by month
    const creditsByMonth = credits.reduce((acc, c) => {
      const monthYear = `${c.creditPeriodStart.getMonth() + 1}/${c.creditPeriodStart.getFullYear()}`;
      if (!acc[monthYear]) acc[monthYear] = 0;
      acc[monthYear] += c.dppPortion;
      return acc;
    }, {} as Record<string, number>);
    
    // Average credit amount
    const averageCreditAmount = credits.length > 0 ? totalCredits / credits.length : 0;
    
    // Count unique students
    const studentIds = new Set(credits.map(c => c.studentId));
    const studentCount = studentIds.size;
    
    return {
      provider,
      totalCredits,
      paidCredits,
      pendingCredits,
      creditsByStatus,
      creditsByMonth,
      averageCreditAmount,
      studentCount
    };
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
    processingTimeAverage: number; // in days
  }> {
    // Get all tuition credits in the date range
    const credits = tuitionCredits.filter(c => 
      c.creditPeriodStart >= startDate && 
      c.creditPeriodEnd <= endDate
    );
    
    // Calculate metrics
    const totalCreditAmount = credits.reduce((sum, c) => sum + c.dppPortion, 0);
    const totalCreditsCount = credits.length;
    const averageCreditAmount = totalCreditsCount > 0 ? totalCreditAmount / totalCreditsCount : 0;
    
    // Group by provider
    const creditsByProviderMap = credits.reduce((acc, c) => {
      if (!acc[c.providerId]) {
        const provider = providers.find(p => p.id === c.providerId);
        acc[c.providerId] = {
          providerId: c.providerId,
          providerName: provider ? provider.name : 'Unknown Provider',
          amount: 0,
          count: 0
        };
      }
      acc[c.providerId].amount += c.dppPortion;
      acc[c.providerId].count += 1;
      return acc;
    }, {} as Record<string, { providerId: string; providerName: string; amount: number; count: number; }>);
    
    const creditsByProvider = Object.values(creditsByProviderMap)
      .sort((a, b) => b.amount - a.amount);
    
    // Group by status
    const creditsByStatus = credits.reduce((acc, c) => {
      if (!acc[c.creditStatus]) acc[c.creditStatus] = 0;
      acc[c.creditStatus] += c.dppPortion;
      return acc;
    }, {} as Record<TuitionCreditStatus, number>);
    
    // Group by month
    const creditsByMonth = credits.reduce((acc, c) => {
      const monthYear = `${c.creditPeriodStart.getMonth() + 1}/${c.creditPeriodStart.getFullYear()}`;
      if (!acc[monthYear]) acc[monthYear] = 0;
      acc[monthYear] += c.dppPortion;
      return acc;
    }, {} as Record<string, number>);
    
    // Count unique students
    const studentIds = new Set(credits.map(c => c.studentId));
    const totalStudents = studentIds.size;
    
    // Calculate average processing time (approval to payment)
    const processedCredits = credits.filter(c => 
      c.creditStatus === TuitionCreditStatus.PAID && 
      c.approvalDate && 
      c.paymentDate
    );
    
    let totalProcessingDays = 0;
    for (const credit of processedCredits) {
      if (credit.approvalDate && credit.paymentDate) {
        const processingDays = 
          (credit.paymentDate.getTime() - credit.approvalDate.getTime()) / 
          (1000 * 60 * 60 * 24);
        totalProcessingDays += processingDays;
      }
    }
    
    const processingTimeAverage = 
      processedCredits.length > 0 ? totalProcessingDays / processedCredits.length : 0;
    
    return {
      totalCreditAmount,
      totalCreditsCount,
      averageCreditAmount,
      creditsByProvider,
      creditsByStatus,
      creditsByMonth,
      totalStudents,
      processingTimeAverage
    };
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
    // Get all provider payments with quality improvement grants in the date range
    const grantsPayments = providerPayments.filter(p => 
      p.qualityImprovementGrant &&
      p.date >= startDate && 
      p.date <= endDate &&
      p.status === PaymentStatus.COMPLETED
    );
    
    // Calculate metrics
    const totalGrantAmount = grantsPayments.reduce((sum, p) => sum + (p.grantAmount || 0), 0);
    const grantCount = grantsPayments.length;
    
    // Group by provider type
    const grantsByProviderType = grantsPayments.reduce((acc, p) => {
      const provider = providers.find(prov => prov.id === p.providerId);
      if (provider) {
        if (!acc[provider.providerType]) acc[provider.providerType] = 0;
        acc[provider.providerType] += (p.grantAmount || 0);
      }
      return acc;
    }, {} as Record<ProviderType, number>);
    
    // Group by quality rating
    const grantsByQualityRating = grantsPayments.reduce((acc, p) => {
      const provider = providers.find(prov => prov.id === p.providerId);
      if (provider) {
        if (!acc[provider.qualityRating]) acc[provider.qualityRating] = 0;
        acc[provider.qualityRating] += (p.grantAmount || 0);
      }
      return acc;
    }, {} as Record<ProviderQualityRating, number>);
    
    // Group by provider
    const providersWithGrantsMap = grantsPayments.reduce((acc, p) => {
      if (!acc[p.providerId]) {
        const provider = providers.find(prov => prov.id === p.providerId);
        if (provider) {
          acc[p.providerId] = {
            providerId: p.providerId,
            providerName: provider.name,
            grantAmount: 0,
            grantCount: 0,
            providerType: provider.providerType,
            qualityRating: provider.qualityRating
          };
        }
      }
      
      if (acc[p.providerId]) {
        acc[p.providerId].grantAmount += (p.grantAmount || 0);
        acc[p.providerId].grantCount += 1;
      }
      
      return acc;
    }, {} as Record<string, {
      providerId: string;
      providerName: string;
      grantAmount: number;
      grantCount: number;
      providerType: ProviderType;
      qualityRating: ProviderQualityRating;
    }>);
    
    const providersWithGrants = Object.values(providersWithGrantsMap)
      .sort((a, b) => b.grantAmount - a.grantAmount);
    
    return {
      totalGrantAmount,
      grantCount,
      grantsByProviderType,
      grantsByQualityRating,
      providersWithGrants
    };
  }
}

export const tuitionCreditService = new TuitionCreditService();