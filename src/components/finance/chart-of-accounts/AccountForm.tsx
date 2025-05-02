// src/components/finance/chart-of-accounts/AccountForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { 
  AccountType, 
  AccountSubType, 
  ChartOfAccount
} from '@/types/finance';

interface AccountFormProps {
  accountId?: string;
  isEditing?: boolean;
}

export default function AccountForm({ accountId, isEditing = false }: AccountFormProps) {
  const router = useRouter();
  
  const { 
    selectedAccount, 
    accounts,
    accountsLoading, 
    accountError, 
    fetchAccountById,
    fetchAccounts,
    createAccount,
    updateAccount
  } = useFinanceStore();
  
  // Form state
  const [formData, setFormData] = useState<Partial<ChartOfAccount>>({
    accountNumber: '',
    name: '',
    description: '',
    type: AccountType.ASSET,
    subType: AccountSubType.CURRENT_ASSET,
    isActive: true,
    parentAccountId: '',
    normalBalance: 'DEBIT',
    isCashAccount: false,
    isBankAccount: false,
    allowAdjustingEntries: true,
    hasChildren: false
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load account and other accounts for parent selection
  useEffect(() => {
    fetchAccounts();
    
    if (isEditing && accountId) {
      fetchAccountById(accountId);
    }
  }, [isEditing, accountId, fetchAccounts, fetchAccountById]);

  // Populate form when editing existing account
  useEffect(() => {
    if (isEditing && selectedAccount) {
      setFormData({
        accountNumber: selectedAccount.accountNumber,
        name: selectedAccount.name,
        description: selectedAccount.description,
        type: selectedAccount.type,
        subType: selectedAccount.subType,
        isActive: selectedAccount.isActive,
        parentAccountId: selectedAccount.parentAccountId,
        normalBalance: selectedAccount.normalBalance,
        isCashAccount: selectedAccount.isCashAccount,
        isBankAccount: selectedAccount.isBankAccount,
        allowAdjustingEntries: selectedAccount.allowAdjustingEntries,
        hasChildren: selectedAccount.hasChildren,
        fundId: selectedAccount.fundId,
        tags: selectedAccount.tags
      });
    }
  }, [isEditing, selectedAccount]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear the error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Get filtered accounts for parent selection
  const getPotentialParentAccounts = () => {
    // Filter out the current account and any children
    return accounts.filter(account => 
      account.id !== accountId && 
      (!account.parentAccountId || account.parentAccountId !== accountId)
    );
  };

  // Filter subtypes based on selected account type
  const getFilteredSubTypes = () => {
    const type = formData.type;
    if (!type) return [];
    
    return Object.values(AccountSubType).filter(subType => {
      switch (type) {
        case AccountType.ASSET:
          return subType.includes('ASSET');
        case AccountType.LIABILITY:
          return subType.includes('LIABILITY');
        case AccountType.EQUITY:
          return subType.includes('EQUITY');
        case AccountType.REVENUE:
          return subType.includes('REVENUE');
        case AccountType.EXPENSE:
          return subType.includes('EXPENSE');
        default:
          return false;
      }
    });
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.accountNumber?.trim()) {
      errors.accountNumber = 'Account number is required';
    }
    
    if (!formData.name?.trim()) {
      errors.name = 'Account name is required';
    }
    
    if (!formData.type) {
      errors.type = 'Account type is required';
    }
    
    if (!formData.subType) {
      errors.subType = 'Account subtype is required';
    }
    
    if (!formData.normalBalance) {
      errors.normalBalance = 'Normal balance is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && accountId) {
        await updateAccount(accountId, formData);
        router.push(`/finance/chart-of-accounts/${accountId}`);
      } else {
        const newAccount = await createAccount(formData as Omit<ChartOfAccount, 'id' | 'createdAt' | 'updatedAt'>);
        router.push(`/finance/chart-of-accounts/${newAccount.id}`);
      }
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isEditing && accountId) {
      router.push(`/finance/chart-of-accounts/${accountId}`);
    } else {
      router.push('/finance/chart-of-accounts');
    }
  };

  const potentialParents = getPotentialParentAccounts();
  const filteredSubTypes = getFilteredSubTypes();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-dark-blue">
          {isEditing ? 'Edit Account' : 'Create New Account'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditing 
            ? 'Update the account information below' 
            : 'Enter the details for the new account'
          }
        </p>
      </div>
      
      {accountError && (
        <div className="bg-warning-red bg-opacity-10 text-warning-red p-4 rounded-md mb-6">
          {accountError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Account Number *
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                formErrors.accountNumber ? 'border-warning-red' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue`}
            />
            {formErrors.accountNumber && (
              <p className="mt-1 text-sm text-warning-red">{formErrors.accountNumber}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                formErrors.name ? 'border-warning-red' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue`}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-warning-red">{formErrors.name}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                formErrors.type ? 'border-warning-red' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue`}
            >
              {Object.values(AccountType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {formErrors.type && (
              <p className="mt-1 text-sm text-warning-red">{formErrors.type}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="subType" className="block text-sm font-medium text-gray-700 mb-1">
              Account Subtype *
            </label>
            <select
              id="subType"
              name="subType"
              value={formData.subType || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                formErrors.subType ? 'border-warning-red' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue`}
            >
              {filteredSubTypes.map(subType => (
                <option key={subType} value={subType}>
                  {subType.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {formErrors.subType && (
              <p className="mt-1 text-sm text-warning-red">{formErrors.subType}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="normalBalance" className="block text-sm font-medium text-gray-700 mb-1">
              Normal Balance *
            </label>
            <select
              id="normalBalance"
              name="normalBalance"
              value={formData.normalBalance || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                formErrors.normalBalance ? 'border-warning-red' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue`}
            >
              <option value="DEBIT">DEBIT</option>
              <option value="CREDIT">CREDIT</option>
            </select>
            {formErrors.normalBalance && (
              <p className="mt-1 text-sm text-warning-red">{formErrors.normalBalance}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="parentAccountId" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Account
            </label>
            <select
              id="parentAccountId"
              name="parentAccountId"
              value={formData.parentAccountId || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">None</option>
              {potentialParents.map(account => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber} - {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active Account
              </label>
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isCashAccount"
                name="isCashAccount"
                checked={formData.isCashAccount}
                onChange={handleChange}
                className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
              />
              <label htmlFor="isCashAccount" className="ml-2 block text-sm text-gray-700">
                Cash Account
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isBankAccount"
                name="isBankAccount"
                checked={formData.isBankAccount}
                onChange={handleChange}
                className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
              />
              <label htmlFor="isBankAccount" className="ml-2 block text-sm text-gray-700">
                Bank Account
              </label>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="allowAdjustingEntries"
                name="allowAdjustingEntries"
                checked={formData.allowAdjustingEntries}
                onChange={handleChange}
                className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
              />
              <label htmlFor="allowAdjustingEntries" className="ml-2 block text-sm text-gray-700">
                Allow Adjusting Entries
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasChildren"
                name="hasChildren"
                checked={formData.hasChildren}
                onChange={handleChange}
                className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
              />
              <label htmlFor="hasChildren" className="ml-2 block text-sm text-gray-700">
                Has Child Accounts
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isEditing ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}