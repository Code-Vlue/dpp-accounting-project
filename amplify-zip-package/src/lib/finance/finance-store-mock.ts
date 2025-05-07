// src/lib/finance/finance-store-mock.ts
import { BankAccount, BankReconciliation, BankTransaction, Vendor, Invoice, RecurringInvoice, Bill, Customer } from '@/types/finance';

/**
 * This file contains mock implementations for finance store methods that are referenced
 * but not yet fully implemented. Use these as placeholders during TypeScript compliance work.
 */

// Mock vendor analytics implementation
export interface VendorAnalytics {
  totalVendors: number;
  activeVendors: number;
  totalSpend: number;
  vendorsByType: { type: string; count: number }[];
  topVendorsBySpend: { vendor: Vendor; totalSpend: number }[];
}

export const getVendorAnalyticsMock = async (): Promise<VendorAnalytics> => {
  return {
    totalVendors: 0,
    activeVendors: 0,
    totalSpend: 0,
    vendorsByType: [],
    topVendorsBySpend: [],
  };
};

// Mock invoice analytics implementation
export interface InvoiceAnalytics {
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
}

export const getOpenInvoiceAnalyticsMock = async (): Promise<InvoiceAnalytics> => {
  return {
    totalOpenInvoices: 0,
    totalPastDueInvoices: 0,
    totalOpenAmount: 0,
    totalPastDueAmount: 0,
    agingBuckets: {
      current: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90Plus': 0,
    },
  };
};

// Mock aging report for accounts receivable
export interface AgingReportItem {
  customerId: string;
  customerName: string;
  current: number;
  '1-30': number;
  '31-60': number;
  '61-90': number;
  '90Plus': number;
  total: number;
}

export interface AgingReport {
  items: AgingReportItem[];
  totals: {
    current: number;
    '1-30': number;
    '31-60': number;
    '61-90': number;
    '90Plus': number;
    total: number;
  };
  // Additional properties needed for the UI
  customerBreakdown?: AgingReportItem[];
  current: number;
  '1-30': number;
  '31-60': number;
  '61-90': number;
  '90Plus': number;
  total: number;
}

export const getAgingReportMock = async (): Promise<AgingReport> => {
  return {
    items: [],
    totals: {
      current: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90Plus': 0,
      total: 0,
    },
    customerBreakdown: [],
    current: 0,
    '1-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90Plus': 0,
    total: 0
  };
};

// Mock customer functions
export const getCustomerByIdMock = async (id: string): Promise<Customer | null> => {
  return null;
};

// Mock bank account functions
export const getBankAccountMock = async (id: string): Promise<BankAccount | null> => {
  return null;
};

// Mock bank reconciliation functions
export const getBankReconciliationMock = async (id: string): Promise<BankReconciliation | null> => {
  return null;
};

// Mock recurring invoice functions
export const fetchAllRecurringInvoicesMock = async (): Promise<RecurringInvoice[]> => {
  return [];
};

// Mock bank transaction functions
export const matchTransactionsMock = async (
  bankTransactionId: string,
  ledgerTransactionId: string
): Promise<BankTransaction> => {
  throw new Error('Not implemented');
};

export const markTransactionAsReconciledMock = async (
  transactionId: string,
  reconciliationId: string
): Promise<BankTransaction> => {
  throw new Error('Not implemented');
};

export const findMatchCandidatesMock = async (
  transactionId: string
): Promise<{ id: string; description: string; amount: number }[]> => {
  return [];
};

export const createAdjustmentEntryMock = async (data: any): Promise<any> => {
  return {};
};

// Mock asset functions
export const fetchAssetsMock = async (): Promise<any[]> => {
  return [];
};