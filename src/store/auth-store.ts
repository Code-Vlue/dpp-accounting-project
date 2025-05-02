// src/store/auth-store.ts
import { create } from 'zustand';
import { 
  AuthState, 
  SignInParams, 
  SignUpParams, 
  ForgotPasswordParams, 
  ResetPasswordParams,
  ChangePasswordParams,
  MFASetupParams,
  VerifyMFAParams,
} from '@/types/auth';
import { authService } from '@/lib/auth/auth-service';

interface AuthStore extends AuthState {
  // Auth actions
  signIn: (params: SignInParams) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (params: ForgotPasswordParams) => Promise<void>;
  resetPassword: (params: ResetPasswordParams) => Promise<void>;
  changePassword: (params: ChangePasswordParams) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  setupMFA: (params: MFASetupParams) => Promise<void>;
  verifyMFA: (params: VerifyMFAParams) => Promise<void>;
  loadUserSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,

  // Initialize user session
  loadUserSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        set({ isAuthenticated: true, user, isLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user session:', error);
      set({ isAuthenticated: false, user: null, isLoading: false, error: 'Failed to load user session' });
    }
  },

  // Sign in
  signIn: async (params: SignInParams) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signIn(params);
      const user = await authService.getCurrentUser();
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (error: any) {
      console.error('Sign in failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Authentication failed. Please check your credentials.'
      });
    }
  },

  // Sign up
  signUp: async (params: SignUpParams) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signUp(params);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Sign up failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Registration failed. Please try again.'
      });
    }
  },

  // Confirm sign up with verification code
  confirmSignUp: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.confirmSignUp(email, code);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Confirm sign up failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Confirmation failed. Please check your code and try again.'
      });
    }
  },

  // Resend confirmation code
  resendConfirmationCode: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resendConfirmationCode(email);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Resend confirmation code failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to resend confirmation code. Please try again later.'
      });
    }
  },

  // Sign out
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.signOut();
      set({ isAuthenticated: false, user: null, isLoading: false });
    } catch (error: any) {
      console.error('Sign out failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Sign out failed. Please try again.'
      });
    }
  },

  // Forgot password
  forgotPassword: async (params: ForgotPasswordParams) => {
    set({ isLoading: true, error: null });
    try {
      await authService.forgotPassword(params);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to send password reset email. Please try again.'
      });
    }
  },

  // Reset password
  resetPassword: async (params: ResetPasswordParams) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resetPassword(params);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Reset password failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Password reset failed. Please check your code and try again.'
      });
    }
  },

  // Change password
  changePassword: async (params: ChangePasswordParams) => {
    set({ isLoading: true, error: null });
    try {
      await authService.changePassword(params);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Change password failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to change password. Please try again.'
      });
    }
  },

  // Setup MFA
  setupMFA: async (params: MFASetupParams) => {
    set({ isLoading: true, error: null });
    try {
      await authService.setupMFA(params.preferredMFA, params.phoneNumber);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('MFA setup failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to set up MFA. Please try again.'
      });
    }
  },

  // Verify MFA
  verifyMFA: async (params: VerifyMFAParams) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyMFA(params.code);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('MFA verification failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to verify MFA code. Please try again.'
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));