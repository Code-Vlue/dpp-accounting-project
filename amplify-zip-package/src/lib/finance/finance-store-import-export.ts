// src/lib/finance/finance-store-import-export.ts
import { create } from 'zustand';
import {
  ImportTarget,
  ExportTarget,
  FileFormat,
  ImportConfig,
  ExportConfig,
  ImportValidationResult,
  ImportResult,
  ExportResult,
  DataMapping
} from '@/types/finance';
import { financeService } from './finance-service';

interface DataImportExportState {
  // Import state
  validateImportLoading: boolean;
  importDataLoading: boolean;
  validateImportError: string | null;
  importDataError: string | null;
  
  // Export state
  exportDataLoading: boolean;
  exportDataError: string | null;
  
  // Import actions
  validateImport: (file: File, config: ImportConfig) => Promise<ImportValidationResult>;
  importData: (file: File, config: ImportConfig) => Promise<ImportResult>;
  
  // Export actions
  exportData: (config: ExportConfig) => Promise<ExportResult>;
  
  // Mapping actions
  getDataMappingForTarget: (target: ImportTarget) => Promise<DataMapping>;
  
  // Scheduled import actions
  scheduleAutomatedImport: (sourceUrl: string, schedule: string, config: ImportConfig) => Promise<string>;
  getScheduledImports: () => Promise<{
    id: string;
    sourceUrl: string;
    schedule: string;
    lastRun?: Date;
    nextRun?: Date;
    config: ImportConfig;
    status: 'ACTIVE' | 'PAUSED' | 'ERROR';
    errorMessage?: string;
  }[]>;
  pauseScheduledImport: (id: string) => Promise<boolean>;
  resumeScheduledImport: (id: string) => Promise<boolean>;
  deleteScheduledImport: (id: string) => Promise<boolean>;
  
  // Bank transactions import
  importBankTransactions: (
    file: File, 
    bankAccountId: string, 
    format: string, 
    options?: { 
      dateFormat?: string;
      allowDuplicates?: boolean; 
      defaultCategoryId?: string;
    }
  ) => Promise<ImportResult>;
}

export const useDataImportExportStore = create<DataImportExportState>((set, get) => ({
  // Import state
  validateImportLoading: false,
  importDataLoading: false,
  validateImportError: null,
  importDataError: null,
  
  // Export state
  exportDataLoading: false,
  exportDataError: null,
  
  // Import actions
  validateImport: async (file: File, config: ImportConfig) => {
    set({ validateImportLoading: true, validateImportError: null });
    
    try {
      const result = await financeService.validateImport(file, config);
      set({ validateImportLoading: false });
      return result;
    } catch (error) {
      console.error('Error validating import:', error);
      set({ 
        validateImportLoading: false, 
        validateImportError: error instanceof Error ? error.message : 'Unknown error validating import'
      });
      throw error;
    }
  },
  
  importData: async (file: File, config: ImportConfig) => {
    set({ importDataLoading: true, importDataError: null });
    
    try {
      const result = await financeService.importData(file, config);
      set({ importDataLoading: false });
      return result;
    } catch (error) {
      console.error('Error importing data:', error);
      set({ 
        importDataLoading: false, 
        importDataError: error instanceof Error ? error.message : 'Unknown error importing data'
      });
      throw error;
    }
  },
  
  // Export actions
  exportData: async (config: ExportConfig) => {
    set({ exportDataLoading: true, exportDataError: null });
    
    try {
      const result = await financeService.exportData(config);
      set({ exportDataLoading: false });
      
      // If successful and in a browser environment, trigger download
      if (result.success && typeof window !== 'undefined' && result.fileUrl) {
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = result.fileUrl;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      return result;
    } catch (error) {
      console.error('Error exporting data:', error);
      set({ 
        exportDataLoading: false, 
        exportDataError: error instanceof Error ? error.message : 'Unknown error exporting data'
      });
      throw error;
    }
  },
  
  // Mapping actions
  getDataMappingForTarget: async (target: ImportTarget) => {
    try {
      return await financeService.getDataMappingForTarget(target);
    } catch (error) {
      console.error('Error getting data mapping:', error);
      throw error;
    }
  },
  
  // Scheduled import actions
  scheduleAutomatedImport: async (sourceUrl: string, schedule: string, config: ImportConfig) => {
    try {
      return await financeService.scheduleAutomatedImport(sourceUrl, schedule, config);
    } catch (error) {
      console.error('Error scheduling import:', error);
      throw error;
    }
  },
  
  getScheduledImports: async () => {
    try {
      return await financeService.getScheduledImports();
    } catch (error) {
      console.error('Error getting scheduled imports:', error);
      throw error;
    }
  },
  
  pauseScheduledImport: async (id: string) => {
    try {
      return await financeService.pauseScheduledImport(id);
    } catch (error) {
      console.error('Error pausing scheduled import:', error);
      throw error;
    }
  },
  
  resumeScheduledImport: async (id: string) => {
    try {
      return await financeService.resumeScheduledImport(id);
    } catch (error) {
      console.error('Error resuming scheduled import:', error);
      throw error;
    }
  },
  
  deleteScheduledImport: async (id: string) => {
    try {
      return await financeService.deleteScheduledImport(id);
    } catch (error) {
      console.error('Error deleting scheduled import:', error);
      throw error;
    }
  },
  
  // Bank transactions import
  importBankTransactions: async (
    file: File, 
    bankAccountId: string, 
    format: string, 
    options?: { 
      dateFormat?: string;
      allowDuplicates?: boolean; 
      defaultCategoryId?: string;
    }
  ) => {
    set({ importDataLoading: true, importDataError: null });
    
    try {
      const result = await financeService.importBankTransactions(file, bankAccountId, format, options);
      set({ importDataLoading: false });
      return result;
    } catch (error) {
      console.error('Error importing bank transactions:', error);
      set({ 
        importDataLoading: false, 
        importDataError: error instanceof Error ? error.message : 'Unknown error importing bank transactions'
      });
      throw error;
    }
  }
}));