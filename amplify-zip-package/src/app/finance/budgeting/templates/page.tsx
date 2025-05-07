// src/app/finance/budgeting/templates/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { BudgetType } from '@/types/finance';

export default function BudgetTemplatesPage() {
  const router = useRouter();
  const {
    budgetTemplates,
    budgetTemplatesLoading,
    budgetTemplatesError,
    fetchBudgetTemplates,
    deleteBudgetTemplate
  } = useFinanceStore();
  
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  
  // Fetch budget templates on component mount
  useEffect(() => {
    fetchBudgetTemplates();
  }, [fetchBudgetTemplates]);
  
  // Get budget type name
  const getBudgetTypeName = (type: BudgetType) => {
    const typeNames = {
      [BudgetType.ANNUAL]: 'Annual',
      [BudgetType.PROGRAM]: 'Program',
      [BudgetType.DEPARTMENT]: 'Department',
      [BudgetType.PROJECT]: 'Project'
    };
    
    return typeNames[type] || 'Unknown';
  };
  
  // Format date
  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return 'N/A';
    
    const date = dateInput instanceof Date 
      ? dateInput 
      : new Date(dateInput);
      
    return date.toLocaleDateString();
  };
  
  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Handle delete button click
  const handleDeleteClick = (templateId: string) => {
    setShowConfirmDelete(templateId);
  };
  
  // Handle delete cancellation
  const handleCancelDelete = () => {
    setShowConfirmDelete(null);
  };
  
  // Handle delete confirmation
  const handleConfirmDelete = async (templateId: string) => {
    await deleteBudgetTemplate(templateId);
    setShowConfirmDelete(null);
  };
  
  // Handle create budget from template
  const handleCreateFromTemplate = (templateId: string) => {
    router.push(`/finance/budgeting/templates/${templateId}/create-budget`);
  };
  
  // Loading state
  if (budgetTemplatesLoading) {
    return <div className="text-center py-4">Loading budget templates...</div>;
  }
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Budget Templates</h1>
            <p className="text-sm text-gray-500">
              Create and manage budget templates for faster budget creation.
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/finance/budgeting"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Budgets
            </Link>
            <Link
              href="/finance/budgeting/templates/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              New Template
            </Link>
          </div>
        </div>
        
        {/* Error message */}
        {budgetTemplatesError && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {budgetTemplatesError}</span>
          </div>
        )}
        
        {/* Template list */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Available Templates</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Use these templates to quickly create new budgets.
            </p>
          </div>
          <div className="border-t border-gray-200">
            {budgetTemplates.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center">
                <p className="text-gray-500">No budget templates found</p>
                <div className="mt-4">
                  <Link
                    href="/finance/budgeting/templates/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create First Template
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {budgetTemplates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getBudgetTypeName(template.type as BudgetType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {template.itemCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(template.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                          {formatDate(template.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {showConfirmDelete === template.id ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleConfirmDelete(template.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={handleCancelDelete}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleCreateFromTemplate(template.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Use Template
                              </button>
                              <Link
                                href={`/finance/budgeting/templates/${template.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </Link>
                              <Link
                                href={`/finance/budgeting/templates/${template.id}/edit`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteClick(template.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}