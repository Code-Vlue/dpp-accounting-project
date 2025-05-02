// src/lib/auth/types.ts

/**
 * Role types for the DPP Accounting Platform
 */
export enum UserRole {
  ADMINISTRATOR = 'administrator',
  ACCOUNTANT = 'accountant',
  MANAGER = 'manager',
  PROVIDER = 'provider',
  READONLY = 'readonly',
}

/**
 * User session with profile information
 */
export interface UserSession {
  user: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    image?: string;
    role?: UserRole;
    organization?: string;
    groups?: string[];
  };
  expires: string;
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * Cognito user attributes interface
 */
export interface CognitoUserAttributes {
  sub: string;
  email: string;
  email_verified: string;
  given_name?: string;
  family_name?: string;
  'custom:role'?: string;
  'custom:organization'?: string;
}

/**
 * Role permissions for different user roles
 */
export interface RolePermissions {
  [key: string]: {
    canView: string[];
    canEdit: string[];
    canCreate: string[];
    canDelete: string[];
    canApprove: string[];
  };
}

/**
 * Auth provider configuration
 */
export interface AuthConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret?: string;
  domain?: string;
}