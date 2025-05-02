// src/types/auth.ts
export enum UserRole {
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  MANAGER = 'MANAGER',
  READONLY = 'READONLY',
  USER = 'USER'
}

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
};

export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
};

export type SignInParams = {
  email: string;
  password: string;
};

export type ForgotPasswordParams = {
  email: string;
};

export type ResetPasswordParams = {
  email: string;
  code: string;
  newPassword: string;
};

export type ChangePasswordParams = {
  oldPassword: string;
  newPassword: string;
};

export type MFASetupParams = {
  preferredMFA: 'SMS' | 'TOTP';
  phoneNumber?: string;
};

export type VerifyMFAParams = {
  code: string;
};