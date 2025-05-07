// src/components/finance/bank-reconciliation/BankAccountForm.tsx
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BankAccount, BankAccountType, BankAccountStatus, ChartOfAccount, AccountType } from '@/types/finance';
import { financeService } from '@/lib/finance/finance-service';

interface BankAccountFormProps {
  bankAccountId?: string;
  isEdit?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function BankAccountForm({ bankAccountId, isEdit = false, onCancel, onSuccess }: BankAccountFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [glAccounts, setGlAccounts] = useState<ChartOfAccount[]>([]);

  const [formData, setFormData] = useState<{
    accountId: string;
    name: string;
    description: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    type: BankAccountType;
    status: BankAccountStatus;
    openingBalance: number;
    currentBalance: number;
    asOfDate: string;
    defaultCategoryId?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
    allowManualReconciliation: boolean;
    allowAutomaticImport: boolean;
    isDefault: boolean;
  }>({
    accountId: '',
    name: '',
    description: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    type: BankAccountType.CHECKING,
    status: BankAccountStatus.ACTIVE,
    openingBalance: 0,
    currentBalance: 0,
    asOfDate: new Date().toISOString().slice(0, 10),
    defaultCategoryId: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
    allowManualReconciliation: true,
    allowAutomaticImport: false,
    isDefault: false
  });

  // Load bank account data if editing
  useEffect(() => {
    async function loadBankAccount() {
      if (!bankAccountId || !isEdit) return;

      try {
        setLoading(true);
        const account = await financeService.getBankAccountById(bankAccountId);
        
        if (!account) {
          setError('Bank account not found');
          return;
        }

        setFormData({
          accountId: account.accountId,
          name: account.name,
          description: account.description || '',
          accountNumber: account.accountNumber,
          routingNumber: account.routingNumber || '',
          bankName: account.bankName,
          type: account.type,
          status: account.status,
          openingBalance: account.openingBalance,
          currentBalance: account.currentBalance,
          asOfDate: new Date(account.asOfDate).toISOString().slice(0, 10),
          defaultCategoryId: account.defaultCategoryId,
          contactName: account.contactName || '',
          contactPhone: account.contactPhone || '',
          contactEmail: account.contactEmail || '',
          notes: account.notes || '',
          allowManualReconciliation: account.allowManualReconciliation,
          allowAutomaticImport: account.allowAutomaticImport,
          isDefault: account.isDefault
        });
      } catch (err) {
        console.error('Error loading bank account:', err);
        setError('Failed to load bank account details');
      } finally {
        setLoading(false);
      }
    }

    loadBankAccount();
  }, [bankAccountId, isEdit]);

  // Load GL accounts
  useEffect(() => {
    async function loadGLAccounts() {
      try {
        setLoading(true);
        // Get only cash/bank accounts
        const accounts = await financeService.getAllAccounts();
        const filteredAccounts = accounts.filter(account => 
          account.type === AccountType.ASSET && (account.isCashAccount || account.isBankAccount)
        );
        setGlAccounts(filteredAccounts);
        
        // Set default accountId if there are accounts and we're not editing
        if (filteredAccounts.length > 0 && !isEdit && !formData.accountId) {
          setFormData(prev => ({
            ...prev,
            accountId: filteredAccounts[0].id
          }));
        }
      } catch (err) {
        console.error('Error loading GL accounts:', err);
        setError('Failed to load general ledger accounts');
      } finally {
        setLoading(false);
      }
    }

    loadGLAccounts();
  }, [isEdit, formData.accountId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const accountData = {
        accountId: formData.accountId,
        name: formData.name,
        description: formData.description,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
        bankName: formData.bankName,
        type: formData.type,
        status: formData.status,
        openingBalance: formData.openingBalance,
        currentBalance: isEdit ? formData.currentBalance : formData.openingBalance,
        asOfDate: new Date(formData.asOfDate),
        defaultCategoryId: formData.defaultCategoryId || undefined,
        contactName: formData.contactName || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactEmail: formData.contactEmail || undefined,
        notes: formData.notes || undefined,
        allowManualReconciliation: formData.allowManualReconciliation,
        allowAutomaticImport: formData.allowAutomaticImport,
        isDefault: formData.isDefault
      };

      if (isEdit && bankAccountId) {
        await financeService.updateBankAccount(bankAccountId, accountData);
        setSuccessMessage('Bank account updated successfully');
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        const newAccount = await financeService.createBankAccount(accountData as any);
        setSuccessMessage('Bank account created successfully');
        
        // Redirect to account detail page after short delay
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          setTimeout(() => {
            router.push(`/finance/banking/accounts/${newAccount.id}`);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error saving bank account:', err);
      setError('Failed to save bank account. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
        {isEdit ? 'Edit Bank Account' : 'Add New Bank Account'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bank Account Information */}
          <fieldset className="space-y-4 col-span-2">
            <legend className="text-lg font-medium text-gray-900 border-b pb-2">Account Information</legend>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
                  GL Account
                </label>
                <select
                  id="accountId"
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select GL Account</option>
                  {glAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {account.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Connect this bank account to a GL account</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Operating Account"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Purpose and usage of this account"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="First National Bank"
                />
              </div>

              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Last 4 digits or masked number"
                />
                <p className="mt-1 text-xs text-gray-500">For security, use masked format (e.g., ****1234)</p>
              </div>

              <div>
                <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number
                </label>
                <input
                  type="text"
                  id="routingNumber"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.values(BankAccountType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.values(BankAccountStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="defaultCategoryId" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Expense Category
                </label>
                <select
                  id="defaultCategoryId"
                  name="defaultCategoryId"
                  value={formData.defaultCategoryId || ''}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">No Default Category</option>
                  {glAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {account.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Used for auto-categorizing imported transactions</p>
              </div>
            </div>
          </fieldset>

          {/* Balance Information */}
          <fieldset className="space-y-4 col-span-2">
            <legend className="text-lg font-medium text-gray-900 border-b pb-2">Balance Information</legend>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="openingBalance" className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Balance
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="openingBalance"
                    name="openingBalance"
                    value={formData.openingBalance}
                    onChange={handleChange}
                    required
                    className="w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    disabled={isEdit} // Can't change opening balance once created
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Initial balance when account was opened</p>
              </div>

              {isEdit && (
                <div>
                  <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Balance
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="currentBalance"
                      name="currentBalance"
                      value={formData.currentBalance}
                      onChange={handleChange}
                      required
                      className="w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Current account balance</p>
                </div>
              )}

              <div>
                <label htmlFor="asOfDate" className="block text-sm font-medium text-gray-700 mb-1">
                  As of Date
                </label>
                <input
                  type="date"
                  id="asOfDate"
                  name="asOfDate"
                  value={formData.asOfDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Balance verification date</p>
              </div>
            </div>
          </fieldset>

          {/* Contact Information */}
          <fieldset className="space-y-4 col-span-2">
            <legend className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</legend>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Bank representative name"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="representative@bank.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Additional information about this account"
              />
            </div>
          </fieldset>

          {/* Settings & Preferences */}
          <fieldset className="space-y-4 col-span-2">
            <legend className="text-lg font-medium text-gray-900 border-b pb-2">Settings & Preferences</legend>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowManualReconciliation"
                  name="allowManualReconciliation"
                  checked={formData.allowManualReconciliation}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowManualReconciliation: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowManualReconciliation" className="ml-2 block text-sm text-gray-900">
                  Allow manual reconciliation
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowAutomaticImport"
                  name="allowAutomaticImport"
                  checked={formData.allowAutomaticImport}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowAutomaticImport: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowAutomaticImport" className="ml-2 block text-sm text-gray-900">
                  Allow automatic transaction import
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                  Set as default bank account
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="flex justify-end space-x-3 pt-5 border-t">
          <button
            type="button"
            onClick={() => onCancel ? onCancel() : router.back()}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}