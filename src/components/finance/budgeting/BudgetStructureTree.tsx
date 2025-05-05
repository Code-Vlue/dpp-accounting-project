// src/components/finance/budgeting/BudgetStructureTree.tsx
'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { BudgetStatus, BudgetType } from '@/types/finance';

interface BudgetStructureTreeProps {
  fiscalYearId?: string;
}

export default function BudgetStructureTree({ fiscalYearId }: BudgetStructureTreeProps) {
  const {
    budgets,
    departments,
    programs,
    projects,
    fetchBudgets,
    fetchDepartments,
    fetchPrograms,
    fetchProjects,
    budgetsLoading,
    budgetError
  } = useFinanceStore();

  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());

  // Fetch necessary data on component mount
  useEffect(() => {
    fetchBudgets();
    fetchDepartments();
    fetchPrograms();
    fetchProjects();
  }, [fetchBudgets, fetchDepartments, fetchPrograms, fetchProjects]);

  // Filter budgets by fiscal year if provided
  const filteredBudgets = fiscalYearId 
    ? budgets.filter(budget => budget.fiscalYearId === fiscalYearId)
    : budgets;

  // Toggle expanded state for departments
  const toggleDepartment = (departmentId: string) => {
    setExpandedDepartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(departmentId)) {
        newSet.delete(departmentId);
      } else {
        newSet.add(departmentId);
      }
      return newSet;
    });
  };

  // Toggle expanded state for programs
  const toggleProgram = (programId: string) => {
    setExpandedPrograms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(programId)) {
        newSet.delete(programId);
      } else {
        newSet.add(programId);
      }
      return newSet;
    });
  };

  // Get status class for badge
  const getStatusClass = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.DRAFT:
        return 'bg-gray-200 text-gray-800';
      case BudgetStatus.PENDING_APPROVAL:
        return 'bg-yellow-100 text-yellow-800';
      case BudgetStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case BudgetStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800';
      case BudgetStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      case BudgetStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Group budgets by department
  const departmentBudgets = departments.map(department => {
    const departmentBudgets = filteredBudgets.filter(
      budget => budget.type === BudgetType.DEPARTMENT && budget.departmentId === department.id
    );
    
    // Get department's programs
    const departmentPrograms = programs.filter(program => program.departmentId === department.id);
    
    return {
      department,
      budgets: departmentBudgets,
      programs: departmentPrograms.map(program => {
        const programBudgets = filteredBudgets.filter(
          budget => budget.type === BudgetType.PROGRAM && budget.programId === program.id
        );
        
        // Get program's projects
        const programProjects = projects.filter(project => project.programId === program.id);
        
        return {
          program,
          budgets: programBudgets,
          projects: programProjects.map(project => {
            const projectBudgets = filteredBudgets.filter(
              budget => budget.type === BudgetType.PROJECT && budget.projectId === project.id
            );
            
            return {
              project,
              budgets: projectBudgets
            };
          })
        };
      })
    };
  });

  // Get annual budgets
  const annualBudgets = filteredBudgets.filter(budget => budget.type === BudgetType.ANNUAL);

  // Loading state
  if (budgetsLoading) {
    return <div className="text-center py-4">Loading budget structure...</div>;
  }

  // Error state
  if (budgetError) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {budgetError}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Annual Budgets</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Organization-wide budgets for fiscal years
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {annualBudgets.length === 0 ? (
              <li className="px-4 py-4 sm:px-6">
                <div className="text-sm text-gray-500">No annual budgets found</div>
              </li>
            ) : (
              annualBudgets.map(budget => (
                <li key={budget.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{budget.name}</span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(budget.status as BudgetStatus)}`}>
                            {budget.status}
                          </span>
                          {budget.isCurrent && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {budget.fiscalYearId}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(budget.totalAmount)}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Departmental Structure</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Budgets organized by departments, programs, and projects
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {departmentBudgets.length === 0 ? (
              <li className="px-4 py-4 sm:px-6">
                <div className="text-sm text-gray-500">No departmental structure defined</div>
              </li>
            ) : (
              departmentBudgets.map(({ department, budgets: deptBudgets, programs: deptPrograms }) => (
                <li key={department.id} className="px-4 py-4 sm:px-6">
                  {/* Department row */}
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => toggleDepartment(department.id)}
                  >
                    <div className="flex items-center">
                      <div className="mr-2">
                        {expandedDepartments.has(department.id) ? (
                          <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{department.name}</span>
                          <span className="ml-2 text-xs text-gray-500">({department.code})</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {deptPrograms.length} programs, {deptBudgets.length} budgets
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(deptBudgets.reduce((sum, budget) => sum + (budget.totalAmount || 0), 0))}
                    </div>
                  </div>

                  {/* Department budgets and programs */}
                  {expandedDepartments.has(department.id) && (
                    <div className="pl-8 mt-2">
                      {/* Department budgets */}
                      {deptBudgets.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Department Budgets</h4>
                          <ul className="space-y-2">
                            {deptBudgets.map(budget => (
                              <li key={budget.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                                <div className="flex items-center">
                                  <div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-900">{budget.name}</span>
                                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(budget.status as BudgetStatus)}`}>
                                        {budget.status}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {budget.fiscalYearId}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {formatCurrency(budget.totalAmount)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Programs */}
                      {deptPrograms.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Programs</h4>
                          <ul className="space-y-4">
                            {deptPrograms.map(({ program, budgets: programBudgets, projects: programProjects }) => (
                              <li key={program.id}>
                                {/* Program row */}
                                <div 
                                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                                  onClick={() => toggleProgram(program.id)}
                                >
                                  <div className="flex items-center">
                                    <div className="mr-2">
                                      {expandedPrograms.has(program.id) ? (
                                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-900">{program.name}</span>
                                        <span className="ml-2 text-xs text-gray-500">({program.code})</span>
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {programProjects.length} projects, {programBudgets.length} budgets
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatCurrency(programBudgets.reduce((sum, budget) => sum + (budget.totalAmount || 0), 0))}
                                  </div>
                                </div>

                                {/* Program budgets and projects */}
                                {expandedPrograms.has(program.id) && (
                                  <div className="pl-8 mt-2">
                                    {/* Program budgets */}
                                    {programBudgets.length > 0 && (
                                      <div className="mb-4">
                                        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Program Budgets</h5>
                                        <ul className="space-y-2">
                                          {programBudgets.map(budget => (
                                            <li key={budget.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                                              <div className="flex items-center">
                                                <div>
                                                  <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900">{budget.name}</span>
                                                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(budget.status as BudgetStatus)}`}>
                                                      {budget.status}
                                                    </span>
                                                  </div>
                                                  <div className="text-sm text-gray-500">
                                                    {budget.fiscalYearId}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(budget.totalAmount)}
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Projects */}
                                    {programProjects.length > 0 && (
                                      <div>
                                        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Projects</h5>
                                        <ul className="space-y-2">
                                          {programProjects.map(({ project, budgets: projectBudgets }) => (
                                            <li key={project.id}>
                                              {/* Project row */}
                                              <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                                                <div className="flex items-center">
                                                  <div>
                                                    <div className="flex items-center">
                                                      <span className="text-sm font-medium text-gray-900">{project.name}</span>
                                                      <span className="ml-2 text-xs text-gray-500">({project.code})</span>
                                                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {project.status}
                                                      </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                      {projectBudgets.length} budgets
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                  {formatCurrency(projectBudgets.reduce((sum, budget) => sum + (budget.totalAmount || 0), 0))}
                                                </div>
                                              </div>

                                              {/* Project budgets */}
                                              {projectBudgets.length > 0 && (
                                                <div className="pl-8 mt-2">
                                                  <ul className="space-y-2">
                                                    {projectBudgets.map(budget => (
                                                      <li key={budget.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                                                        <div className="flex items-center">
                                                          <div>
                                                            <div className="flex items-center">
                                                              <span className="text-sm font-medium text-gray-900">{budget.name}</span>
                                                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(budget.status as BudgetStatus)}`}>
                                                                {budget.status}
                                                              </span>
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                              {budget.fiscalYearId}
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                          {formatCurrency(budget.totalAmount)}
                                                        </div>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}