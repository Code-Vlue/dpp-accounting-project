// src/lib/auth/permissions.ts
import { UserRole, RolePermissions } from './types';

/**
 * Role permissions for different user roles
 * This defines what sections each role can view, edit, create, delete, and approve
 */
export const rolePermissions: RolePermissions = {
  // Administrator has full access to everything
  [UserRole.ADMINISTRATOR]: {
    canView: ['*'],
    canEdit: ['*'],
    canCreate: ['*'],
    canDelete: ['*'],
    canApprove: ['*'],
  },

  // Accountant has access to financial data and transactions
  [UserRole.ACCOUNTANT]: {
    canView: [
      'dashboard',
      'chart-of-accounts',
      'general-ledger',
      'accounts-payable',
      'accounts-receivable',
      'budgeting',
      'fund-accounting',
      'tuition-credits',
      'providers',
      'financial-reports',
      'bank-reconciliation',
      'data-import-export',
    ],
    canEdit: [
      'chart-of-accounts',
      'general-ledger',
      'accounts-payable',
      'accounts-receivable',
      'budgeting',
      'fund-accounting',
      'tuition-credits',
      'bank-reconciliation',
      'data-import-export',
    ],
    canCreate: [
      'chart-of-accounts',
      'general-ledger',
      'accounts-payable',
      'accounts-receivable',
      'budgeting',
      'fund-accounting',
      'tuition-credits',
      'bank-reconciliation',
      'data-import-export',
    ],
    canDelete: [
      'chart-of-accounts',
      'general-ledger',
      'accounts-payable',
      'accounts-receivable',
      'budgeting',
      'fund-accounting',
      'tuition-credits',
      'bank-reconciliation',
    ],
    canApprove: [
      'accounts-payable',
      'tuition-credits',
    ],
  },

  // Manager has access to reports and approvals
  [UserRole.MANAGER]: {
    canView: [
      'dashboard',
      'chart-of-accounts',
      'general-ledger',
      'accounts-payable',
      'accounts-receivable',
      'budgeting',
      'fund-accounting',
      'tuition-credits',
      'providers',
      'financial-reports',
    ],
    canEdit: [
      'budgeting',
    ],
    canCreate: [
      'budgeting',
    ],
    canDelete: [],
    canApprove: [
      'accounts-payable',
      'tuition-credits',
      'budgeting',
    ],
  },

  // Provider has limited access to their own data
  [UserRole.PROVIDER]: {
    canView: [
      'dashboard',
      'tuition-credits',
      'providers',
    ],
    canEdit: [
      'providers',
    ],
    canCreate: [],
    canDelete: [],
    canApprove: [],
  },

  // Read-only role has view access only
  [UserRole.READONLY]: {
    canView: [
      'dashboard',
      'chart-of-accounts',
      'general-ledger',
      'accounts-payable',
      'accounts-receivable',
      'budgeting',
      'fund-accounting',
      'tuition-credits',
      'providers',
      'financial-reports',
    ],
    canEdit: [],
    canCreate: [],
    canDelete: [],
    canApprove: [],
  },
};

/**
 * Check if a user has permission to perform an action on a resource
 * 
 * @param role - The user's role
 * @param permission - The permission type (canView, canEdit, canCreate, canDelete, canApprove)
 * @param resource - The resource to check permission for
 * @returns boolean - Whether the user has permission
 */
export function hasPermission(
  role: UserRole | string | undefined,
  permission: 'canView' | 'canEdit' | 'canCreate' | 'canDelete' | 'canApprove',
  resource: string
): boolean {
  if (!role) return false;
  
  const userRole = role as UserRole;
  const permissions = rolePermissions[userRole];

  if (!permissions) return false;

  // Check if user has wildcard permission
  if (permissions[permission].includes('*')) {
    return true;
  }

  // Check if user has specific permission
  return permissions[permission].includes(resource);
}