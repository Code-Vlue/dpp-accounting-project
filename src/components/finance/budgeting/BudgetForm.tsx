// src/components/finance/budgeting/BudgetForm.tsx
'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { BudgetType, BudgetStatus, BudgetPeriodType } from '@/types/finance';

interface BudgetFormProps {
  budgetId?: string; // If provided, we're editing an existing budget
  budgetType?: BudgetType; // Default to ANNUAL if not provided
}

export default function BudgetForm({ budgetId, budgetType = BudgetType.ANNUAL }: BudgetFormProps) {
  const router = useRouter();
  const { 
    selectedBudget,
    budgetDraft,
    fiscalYears,
    departments,
    programs,
    projects,
    fetchFiscalYears,
    fetchDepartments,
    fetchPrograms,
    fetchProjects,
    setBudgetDraftField,
    createBudget,
    updateBudget,
    fetchBudgetById
  } = useFinanceStore();
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch necessary data on component mount
  useEffect(() => {
    fetchFiscalYears();
    fetchDepartments();
    fetchPrograms();
    fetchProjects();
    
    // If we're editing an existing budget, fetch it
    if (budgetId) {
      fetchBudgetById(budgetId);
    }
  }, [
    budgetId, 
    fetchFiscalYears, 
    fetchDepartments, 
    fetchPrograms, 
    fetchProjects, 
    fetchBudgetById
  ]);
  
  // Set initial form values from the selected budget
  useEffect(() => {
    if (budgetId && selectedBudget) {
      // Set form values from selected budget
      Object.entries(selectedBudget).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          setBudgetDraftField(key, value);
        }
      });
    } else {
      // Set default values for new budget
      setBudgetDraftField('type', budgetType);
      setBudgetDraftField('status', BudgetStatus.DRAFT);
      setBudgetDraftField('periodType', BudgetPeriodType.MONTHLY);
    }
  }, [budgetId, selectedBudget, budgetType, setBudgetDraftField]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBudgetDraftField(name, value);
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value);
    setBudgetDraftField(name, numValue);
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!budgetDraft.name) {
      newErrors.name = 'Budget name is required';
    }
    
    if (!budgetDraft.fiscalYearId) {
      newErrors.fiscalYearId = 'Fiscal year is required';
    }
    
    // Add validation for other required fields based on budget type
    if (budgetDraft.type === BudgetType.PROGRAM && !budgetDraft.programId) {
      newErrors.programId = 'Program is required for program budgets';
    }
    
    if (budgetDraft.type === BudgetType.DEPARTMENT && !budgetDraft.departmentId) {
      newErrors.departmentId = 'Department is required for department budgets';
    }
    
    if (budgetDraft.type === BudgetType.PROJECT && !budgetDraft.projectId) {
      newErrors.projectId = 'Project is required for project budgets';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (budgetId) {
        // Update existing budget
        await updateBudget(budgetId, budgetDraft);
        router.push(`/finance/budgeting/${getBudgetTypePath(budgetDraft.type as BudgetType)}/${budgetId}`);
      } else {
        // Create new budget
        const newBudgetId = await createBudget(budgetDraft as any);
        router.push(`/finance/budgeting/${getBudgetTypePath(budgetDraft.type as BudgetType)}/${newBudgetId}`);
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      setErrors(prev => ({ ...prev, form: 'Failed to save budget. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper to get path segment based on budget type
  const getBudgetTypePath = (type: BudgetType) => {
    switch (type) {
      case BudgetType.ANNUAL: return 'annual';
      case BudgetType.PROGRAM: return 'programs';
      case BudgetType.DEPARTMENT: return 'departments';
      case BudgetType.PROJECT: return 'projects';
      default: return 'annual';
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Error icon */}
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{errors.form}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Budget Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              {budgetId ? 'Edit the budget details.' : 'Create a new budget.'}
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Budget Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={budgetDraft.name || ''}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.name ? 'border-red-300' : ''}`}
                />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="fiscalYearId" className="block text-sm font-medium text-gray-700">
                  Fiscal Year
                </label>
                <select
                  id="fiscalYearId"
                  name="fiscalYearId"
                  value={budgetDraft.fiscalYearId || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.fiscalYearId ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Fiscal Year</option>
                  {fiscalYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
                {errors.fiscalYearId && <p className="mt-2 text-sm text-red-600">{errors.fiscalYearId}</p>}
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Budget Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={budgetDraft.type || BudgetType.ANNUAL}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={!!budgetId} // Can't change type when editing
                >
                  <option value={BudgetType.ANNUAL}>Annual</option>
                  <option value={BudgetType.PROGRAM}>Program</option>
                  <option value={BudgetType.DEPARTMENT}>Department</option>
                  <option value={BudgetType.PROJECT}>Project</option>
                </select>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="periodType" className="block text-sm font-medium text-gray-700">
                  Budget Period
                </label>
                <select
                  id="periodType"
                  name="periodType"
                  value={budgetDraft.periodType || BudgetPeriodType.MONTHLY}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={BudgetPeriodType.MONTHLY}>Monthly</option>
                  <option value={BudgetPeriodType.QUARTERLY}>Quarterly</option>
                  <option value={BudgetPeriodType.ANNUAL}>Annual</option>
                </select>
              </div>
              
              {/* Program, Department, or Project selectors based on budget type */}
              {budgetDraft.type === BudgetType.PROGRAM && (
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="programId" className="block text-sm font-medium text-gray-700">
                    Program
                  </label>
                  <select
                    id="programId"
                    name="programId"
                    value={budgetDraft.programId || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.programId ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                  {errors.programId && <p className="mt-2 text-sm text-red-600">{errors.programId}</p>}
                </div>
              )}
              
              {budgetDraft.type === BudgetType.DEPARTMENT && (
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    value={budgetDraft.departmentId || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.departmentId ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(department => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="mt-2 text-sm text-red-600">{errors.departmentId}</p>}
                </div>
              )}
              
              {budgetDraft.type === BudgetType.PROJECT && (
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
                    Project
                  </label>
                  <select
                    id="projectId"
                    name="projectId"
                    value={budgetDraft.projectId || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.projectId ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && <p className="mt-2 text-sm text-red-600">{errors.projectId}</p>}
                </div>
              )}
              
              <div className="col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={budgetDraft.description || ''}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={budgetDraft.startDate instanceof Date 
                    ? budgetDraft.startDate.toISOString().split('T')[0] 
                    : budgetDraft.startDate || ''}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={budgetDraft.endDate instanceof Date 
                    ? budgetDraft.endDate.toISOString().split('T')[0]
                    : budgetDraft.endDate || ''}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                  Target Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="targetAmount"
                    id="targetAmount"
                    value={budgetDraft.targetAmount || ''}
                    onChange={handleNumberChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (budgetId ? 'Update Budget' : 'Create Budget')}
        </button>
      </div>
    </form>
  );
}