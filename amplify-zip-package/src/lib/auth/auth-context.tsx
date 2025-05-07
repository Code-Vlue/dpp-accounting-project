'use client';

// src/lib/auth/auth-context.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole, UserSession } from '@/lib/auth/types';
import { hasPermission } from '@/lib/auth/permissions';

interface AuthContextType {
  user: {
    id?: string;
    email?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    organization?: string;
    groups?: string[];
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken?: string | null;
  signOut: () => Promise<void>;
  hasPermission: (
    permission: 'canView' | 'canEdit' | 'canCreate' | 'canDelete' | 'canApprove',
    resource: string
  ) => boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  accessToken: null,
  signOut: async () => {},
  hasPermission: () => false,
});

// Provider component that wraps the app and makes auth available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState<Omit<AuthContextType, 'hasPermission' | 'signOut'>>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    accessToken: null,
  });

  useEffect(() => {
    if (status === 'loading') {
      setAuthState({
        user: null,
        isLoading: true,
        isAuthenticated: false,
        accessToken: null,
      });
      return;
    }

    if (!session) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
      });
      return;
    }

    const userSession = session as unknown as UserSession;
    
    setAuthState({
      user: userSession.user,
      isLoading: false,
      isAuthenticated: true,
      accessToken: userSession.accessToken,
    });
  }, [session, status]);

  // Add permission checker method to context
  const checkPermission = (
    permission: 'canView' | 'canEdit' | 'canCreate' | 'canDelete' | 'canApprove',
    resource: string
  ): boolean => {
    if (!authState.user?.role) return false;
    return hasPermission(authState.user.role, permission, resource);
  };
  
  // Sign out implementation
  const signOut = async (): Promise<void> => {
    try {
      // Reset auth state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
      });
      
      // Use NextAuth's signOut if integrated, or implement your own
      // You may want to add a call to your auth service to invalidate tokens
      // await authService.signOut();
      
      // Redirect to login page can be handled in the component using this
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    ...authState,
    hasPermission: checkPermission,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}