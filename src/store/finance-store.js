"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFinanceStore = void 0;
// src/store/finance-store.ts
var zustand_1 = require("zustand");
var finance_1 = require("@/types/finance");
var finance_service_1 = require("@/lib/finance/finance-service");
var accounts_receivable_service_1 = require("@/lib/finance/accounts-receivable-service");
var finance_store_mock_1 = require("@/lib/finance/finance-store-mock");
exports.useFinanceStore = (0, zustand_1.create)(function (set, get) { return ({
    // Accounts Receivable state
    agingReport: null,
    agingReportLoading: false,
    customers: [],
    selectedCustomer: null,
    customersLoading: false,
    customerError: null,
    invoices: [],
    selectedInvoice: null,
    invoicesLoading: false,
    invoiceError: null,
    recurringInvoices: [],
    selectedRecurringInvoice: null,
    recurringInvoicesLoading: false,
    recurringInvoiceError: null,
    receivablePayments: [],
    selectedReceivablePayment: null,
    receivablePaymentsLoading: false,
    receivablePaymentError: null,
    receipts: [],
    selectedReceipt: null,
    receiptsLoading: false,
    receiptError: null,
    // Asset Management state
    assets: [],
    selectedAsset: null,
    assetsLoading: false,
    assetError: null,
    assetCategories: [],
    selectedAssetCategory: null,
    assetCategoriesLoading: false,
    assetCategoryError: null,
    assetDisposals: [],
    selectedAssetDisposal: null,
    assetDisposalsLoading: false,
    assetDisposalError: null,
    assetMaintenances: [],
    selectedAssetMaintenance: null,
    assetMaintenancesLoading: false,
    assetMaintenanceError: null,
    assetTransfers: [],
    selectedAssetTransfer: null,
    assetTransfersLoading: false,
    assetTransferError: null,
    assetDepreciationSchedules: [],
    selectedAssetDepreciationSchedule: null,
    assetDepreciationSchedulesLoading: false,
    assetDepreciationScheduleError: null,
    // Provider Payment Batch state
    providerPaymentBatches: [],
    selectedProviderPaymentBatch: null,
    providerPaymentBatchesLoading: false,
    providerPaymentBatchError: null,
    // Bank Reconciliation state
    bankAccounts: [],
    selectedBankAccount: null,
    bankAccountsLoading: false,
    bankAccountError: null,
    bankTransactions: [],
    selectedBankTransaction: null,
    bankTransactionsLoading: false,
    bankTransactionError: null,
    bankReconciliations: [],
    selectedBankReconciliation: null,
    bankReconciliationsLoading: false,
    bankReconciliationError: null,
    // Chart of Accounts state
    accounts: [],
    selectedAccount: null,
    accountsLoading: false,
    accountError: null,
    // Funds state
    funds: [],
    selectedFund: null,
    fundsLoading: false,
    fundError: null,
    // Fund Accounting state
    fundTransfers: [],
    fundAllocations: [],
    fundBalanceSheets: [],
    fundRestrictionReport: [],
    selectedFundActivityReport: null,
    fundReconciliation: null,
    fundAccountingLoading: false,
    fundAccountingError: null,
    // Tuition Credit Management state
    providers: [],
    selectedProvider: null,
    providersLoading: false,
    providerError: null,
    tuitionCredits: [],
    selectedTuitionCredit: null,
    tuitionCreditsLoading: false,
    tuitionCreditError: null,
    tuitionCreditBatches: [],
    selectedTuitionCreditBatch: null,
    tuitionCreditBatchesLoading: false,
    tuitionCreditBatchError: null,
    providerPayments: [],
    selectedProviderPayment: null,
    providerPaymentsLoading: false,
    providerPaymentError: null,
    // Tuition Credit form state
    tuitionCreditDraft: {
        providerId: '',
        studentId: '',
        studentName: '',
        creditPeriodStart: new Date(),
        creditPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        creditAmount: 0,
        familyPortion: 0,
        dppPortion: 0,
        accountId: '',
        description: '',
        reference: '',
        isAdjustment: false,
        originalCreditId: undefined,
        adjustmentNotes: undefined
    },
    // Provider Payment form state
    providerPaymentDraft: {
        providerId: '',
        amount: 0,
        date: new Date(),
        method: finance_1.PaymentMethod.ACH,
        description: '',
        reference: undefined,
        accountId: '',
        tuitionCreditIds: [],
        qualityImprovementGrant: false,
        grantAmount: undefined,
        grantReason: undefined,
        notes: undefined,
        paymentPriority: finance_1.PaymentPriority.NORMAL
    },
    // Fund transfer form state
    fundTransferDraft: {
        sourceId: '',
        destinationId: '',
        amount: 0,
        description: '',
        date: new Date()
    },
    // Fund allocation form state
    fundAllocationDraft: {
        description: '',
        date: new Date(),
        entries: [
            {
                accountId: '',
                fundId: '',
                description: '',
                debitAmount: 0,
                creditAmount: 0
            }
        ]
    },
    // General Ledger state
    transactions: [],
    selectedTransaction: null,
    transactionsLoading: false,
    transactionError: null,
    // Fiscal periods state
    fiscalYears: [],
    currentFiscalYear: null,
    fiscalPeriods: [],
    currentFiscalPeriod: null,
    fiscalLoading: false,
    fiscalError: null,
    // Journal Entry form state
    journalEntryDraft: {
        date: new Date(),
        description: '',
        reference: '',
        entries: [
            {
                accountId: '',
                debitAmount: 0,
                creditAmount: 0,
                description: ''
            }
        ]
    },
    // Accounts Payable state
    vendors: [],
    selectedVendor: null,
    vendorsLoading: false,
    vendorError: null,
    bills: [],
    selectedBill: null,
    billsLoading: false,
    billError: null,
    recurringBills: [],
    selectedRecurringBill: null,
    recurringBillsLoading: false,
    recurringBillError: null,
    payments: [],
    selectedPayment: null,
    paymentsLoading: false,
    paymentError: null,
    // Bill form state
    billDraft: {
        vendorId: '',
        invoiceNumber: '',
        invoiceDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
        description: '',
        reference: '',
        items: [
            {
                description: '',
                quantity: 1,
                unitPrice: 0,
                accountId: '',
                expenseCategory: finance_1.ExpenseCategory.GENERAL,
                taxable: false,
                fundId: undefined,
                departmentId: undefined,
                projectId: undefined
            }
        ]
    },
    // Invoice form state
    invoiceDraft: {
        customerId: '',
        invoiceNumber: '',
        invoiceDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
        description: '',
        reference: '',
        paymentTerms: 'NET 30',
        sendReceipt: true,
        customerNotes: undefined,
        termsAndConditions: undefined,
        items: [
            {
                description: '',
                quantity: 1,
                unitPrice: 0,
                accountId: '',
                revenueCategory: finance_1.RevenueCategory.GENERAL,
                taxable: false,
                fundId: undefined,
                departmentId: undefined,
                projectId: undefined,
                discountPercent: undefined
            }
        ]
    },
    // Budgeting System state
    budgets: [],
    selectedBudget: null,
    budgetsLoading: false,
    budgetError: null,
    budgetItems: [],
    selectedBudgetItem: null,
    budgetItemsLoading: false,
    budgetItemError: null,
    budgetRevisions: [],
    selectedBudgetRevision: null,
    budgetRevisionsLoading: false,
    budgetRevisionError: null,
    budgetTemplates: [],
    selectedBudgetTemplate: null,
    budgetTemplatesLoading: false,
    budgetTemplateError: null,
    departments: [],
    selectedDepartment: null,
    departmentsLoading: false,
    departmentError: null,
    programs: [],
    selectedProgram: null,
    programsLoading: false,
    programError: null,
    projects: [],
    selectedProject: null,
    projectsLoading: false,
    projectError: null,
    // Budget form state
    budgetDraft: {
        name: '',
        description: '',
        fiscalYearId: '',
        type: finance_1.BudgetType.OPERATIONAL,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        departmentId: undefined,
        programId: undefined,
        projectId: undefined,
        fundId: undefined,
        periodType: finance_1.BudgetPeriodType.MONTHLY,
        notes: undefined
    },
    // Budget Item form state
    budgetItemDraft: {
        budgetId: '',
        accountId: '',
        name: '',
        description: '',
        amount: 0,
        notes: undefined,
        departmentId: undefined,
        programId: undefined,
        projectId: undefined,
        fundId: undefined
    },
    // Budget Revision form state
    budgetRevisionDraft: {
        budgetId: '',
        description: '',
        reason: '',
        changes: [
            {
                budgetItemId: undefined,
                accountId: undefined,
                changeType: 'MODIFY',
                description: '',
                previousAmount: 0,
                newAmount: 0
            }
        ]
    },
    // Data Import/Export state
    validateImportLoading: false,
    importDataLoading: false,
    exportDataLoading: false,
    validateImportError: null,
    importDataError: null,
    exportDataError: null,
    importLoading: false,
    exportLoading: false,
    importError: null,
    exportError: null,
    // Chart of Accounts actions
    fetchAccounts: function () { return __awaiter(void 0, void 0, void 0, function () {
        var accounts, error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ accountsLoading: true, accountError: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, finance_service_1.financeService.getAccounts()];
                case 2:
                    accounts = _a.sent();
                    set({ accounts: accounts, accountsLoading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error occurred';
                    set({
                        accountsLoading: false,
                        accountError: errorMessage || 'Failed to fetch accounts'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    fetchAccountsByType: function (type) { return __awaiter(void 0, void 0, void 0, function () {
        var accounts, error_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ accountsLoading: true, accountError: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, finance_service_1.financeService.getAccountsByType(type)];
                case 2:
                    accounts = _a.sent();
                    set({ accounts: accounts, accountsLoading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error occurred';
                    set({
                        accountsLoading: false,
                        accountError: errorMessage || "Failed to fetch accounts for type ".concat(type)
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    fetchAccountById: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var account, error_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ accountsLoading: true, accountError: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, finance_service_1.financeService.getAccountById(id)];
                case 2:
                    account = _a.sent();
                    set({ selectedAccount: account, accountsLoading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    errorMessage = error_3 instanceof Error ? error_3.message : 'Unknown error occurred';
                    set({
                        accountsLoading: false,
                        accountError: errorMessage || "Failed to fetch account ".concat(id)
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    createAccount: function (account) { return __awaiter(void 0, void 0, void 0, function () {
        var newAccount, currentAccounts, error_4, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ accountsLoading: true, accountError: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, finance_service_1.financeService.createAccount(account)];
                case 2:
                    newAccount = _a.sent();
                    currentAccounts = get().accounts;
                    set({
                        accounts: __spreadArray(__spreadArray([], currentAccounts, true), [newAccount], false),
                        selectedAccount: newAccount,
                        accountsLoading: false
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    errorMessage = error_4 instanceof Error ? error_4.message : 'Unknown error occurred';
                    set({
                        accountsLoading: false,
                        accountError: errorMessage || 'Failed to create account'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    updateAccount: function (id, accountData) { return __awaiter(void 0, void 0, void 0, function () {
        var updatedAccount_1, currentAccounts, error_5, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ accountsLoading: true, accountError: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, finance_service_1.financeService.updateAccount(id, accountData)];
                case 2:
                    updatedAccount_1 = _a.sent();
                    currentAccounts = get().accounts;
                    set({
                        accounts: currentAccounts.map(function (acc) { return acc.id === id ? updatedAccount_1 : acc; }),
                        selectedAccount: updatedAccount_1,
                        accountsLoading: false
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    errorMessage = error_5 instanceof Error ? error_5.message : 'Unknown error occurred';
                    set({
                        accountsLoading: false,
                        accountError: errorMessage || "Failed to update account ".concat(id)
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    // Customer functions
    fetchCustomers: function () { return __awaiter(void 0, void 0, void 0, function () {
        var customers, error_6, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ customersLoading: true, customerError: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, accounts_receivable_service_1.accountsReceivableService.getCustomers()];
                case 2:
                    customers = _a.sent();
                    set({ customers: customers, customersLoading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    errorMessage = error_6 instanceof Error ? error_6.message : 'Unknown error occurred';
                    set({
                        customersLoading: false,
                        customerError: errorMessage || 'Failed to fetch customers'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    fetchCustomerById: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var customer, error_7, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ customersLoading: true, customerError: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, accounts_receivable_service_1.accountsReceivableService.getCustomerById(id)];
                case 2:
                    customer = _a.sent();
                    set({ selectedCustomer: customer, customersLoading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    errorMessage = error_7 instanceof Error ? error_7.message : 'Unknown error occurred';
                    set({
                        customersLoading: false,
                        customerError: errorMessage || "Failed to fetch customer ".concat(id)
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    // Accounts receivable aging report
    getAgingReport: function () { return __awaiter(void 0, void 0, void 0, function () {
        var agingReport, error_8, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ agingReportLoading: true });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, finance_store_mock_1.getAgingReportMock)()];
                case 2:
                    agingReport = _a.sent();
                    set({ agingReport: agingReport, agingReportLoading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _a.sent();
                    errorMessage = error_8 instanceof Error ? error_8.message : 'Unknown error occurred';
                    set({
                        agingReportLoading: false,
                        customerError: errorMessage || 'Failed to generate aging report'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    // Get customer by ID (using mock for now)
    getCustomerById: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_9, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, finance_store_mock_1.getCustomerByIdMock)(id)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_9 = _a.sent();
                    errorMessage = error_9 instanceof Error ? error_9.message : 'Unknown error occurred';
                    set({ customerError: errorMessage || "Failed to get customer ".concat(id) });
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    // Get revenue by customer
    getRevenueByCustomer: function (startDate, endDate) { return __awaiter(void 0, void 0, void 0, function () {
        var errorMessage;
        return __generator(this, function (_a) {
            try {
                // This would call a real service in production
                return [2 /*return*/, [{
                            customer: { id: '1', name: 'Customer 1' },
                            totalRevenue: 10000,
                            invoiceCount: 5
                        }]];
            }
            catch (error) {
                errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                set({ customerError: errorMessage || 'Failed to get revenue by customer' });
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    }); },
    // Get revenue by category
    getRevenueByCategory: function (startDate, endDate) { return __awaiter(void 0, void 0, void 0, function () {
        var errorMessage;
        return __generator(this, function (_a) {
            try {
                // This would call a real service in production
                return [2 /*return*/, [{
                            category: finance_1.RevenueCategory.TUITION,
                            totalRevenue: 10000,
                            percentage: 80
                        }]];
            }
            catch (error) {
                errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                set({ customerError: errorMessage || 'Failed to get revenue by category' });
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    }); },
    // Get customer payment summary
    getCustomerPaymentSummary: function (customerId, year) { return __awaiter(void 0, void 0, void 0, function () {
        var customer, error_10, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, get().getCustomerById(customerId)];
                case 1:
                    customer = _a.sent();
                    return [2 /*return*/, {
                            customer: customer,
                            totalRevenue: 10000,
                            invoices: [],
                            payments: [],
                            receiptHistory: []
                        }];
                case 2:
                    error_10 = _a.sent();
                    errorMessage = error_10 instanceof Error ? error_10.message : 'Unknown error occurred';
                    set({ customerError: errorMessage || 'Failed to get customer payment summary' });
                    return [2 /*return*/, {
                            customer: null,
                            totalRevenue: 0,
                            invoices: [],
                            payments: [],
                            receiptHistory: []
                        }];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    // Get accounts receivable analytics
    getAccountsReceivableAnalytics: function () { return __awaiter(void 0, void 0, void 0, function () {
        var errorMessage;
        return __generator(this, function (_a) {
            try {
                // This would call a real service in production
                return [2 /*return*/, {
                        totalCustomers: 100,
                        activeCustomers: 80,
                        totalReceivables: 50000,
                        totalOverdueAmount: 5000,
                        customersByType: [
                            { type: finance_1.CustomerType.BUSINESS, count: 30 },
                            { type: finance_1.CustomerType.INDIVIDUAL, count: 50 },
                            { type: finance_1.CustomerType.NONPROFIT, count: 20 }
                        ],
                        topCustomersByRevenue: []
                    }];
            }
            catch (error) {
                errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                set({ customerError: errorMessage || 'Failed to get accounts receivable analytics' });
                return [2 /*return*/, {
                        totalCustomers: 0,
                        activeCustomers: 0,
                        totalReceivables: 0,
                        totalOverdueAmount: 0,
                        customersByType: [],
                        topCustomersByRevenue: []
                    }];
            }
            return [2 /*return*/];
        });
    }); },
    // Accounts Payable analytics
    getVendorAnalytics: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // This would be implemented with a real service in production
            return [2 /*return*/, {
                    totalVendors: 50,
                    activeVendors: 30,
                    totalPayables: 25000,
                    payablesByStatus: {
                        draft: 5000,
                        pending: 10000,
                        paid: 5000,
                        void: 0
                    },
                    vendorsByType: [
                        { type: 'Service Provider', count: 20 },
                        { type: 'Supplier', count: 15 },
                        { type: 'Contractor', count: 10 },
                        { type: 'Other', count: 5 }
                    ],
                    topVendorsBySpend: [
                        { vendor: { id: '1', name: 'ABC Corp' }, totalSpend: 10000 },
                        { vendor: { id: '2', name: 'XYZ Inc' }, totalSpend: 8000 },
                        { vendor: { id: '3', name: 'Acme LLC' }, totalSpend: 5000 }
                    ]
                }];
        });
    }); },
    getOpenInvoiceAnalytics: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // This would be implemented with a real service in production
            return [2 /*return*/, {
                    totalOpenInvoices: 25,
                    totalOpenAmount: 15000,
                    invoicesByDueDate: {
                        overdue: 5,
                        dueThisWeek: 10,
                        dueNextWeek: 5,
                        dueLater: 5
                    },
                    invoicesByStatus: {
                        draft: 5,
                        pending: 15,
                        paid: 0,
                        void: 0
                    }
                }];
        });
    }); },
    // Fetch recurring invoices
    fetchRecurringInvoices: function () { return __awaiter(void 0, void 0, void 0, function () {
        var errorMessage;
        return __generator(this, function (_a) {
            set({ recurringInvoicesLoading: true });
            try {
                // This would call accountsReceivableService.getRecurringInvoices() in production
                set({
                    recurringInvoices: [],
                    recurringInvoicesLoading: false
                });
            }
            catch (error) {
                errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                set({ recurringInvoicesLoading: false });
            }
            return [2 /*return*/];
        });
    }); },
    // Generate invoice from recurring
    generateInvoiceFromRecurring: function (recurringInvoiceId) { return __awaiter(void 0, void 0, void 0, function () {
        var errorMessage;
        return __generator(this, function (_a) {
            try {
                // In production, this would call accountsReceivableService.generateInvoiceFromRecurring()
                // Mock implementation
            }
            catch (error) {
                errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            }
            return [2 /*return*/];
        });
    }); },
    // Error handling
    clearErrors: function () {
        set({
            accountError: null,
            vendorError: null,
            customerError: null,
            transactionError: null,
            assetError: null,
            fundError: null,
            providerError: null,
            tuitionCreditError: null,
            importError: null,
            exportError: null,
            bankAccountError: null
        });
    }
}); });
