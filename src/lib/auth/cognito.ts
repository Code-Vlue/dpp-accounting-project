// src/lib/auth/cognito.ts
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  ICognitoUserPoolData,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { AuthConfig, CognitoUserAttributes } from './types';

/**
 * Initialize Cognito configuration from environment variables
 */
export function getCognitoConfig(): AuthConfig {
  const requiredEnvVars = [
    'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
    'NEXT_PUBLIC_COGNITO_CLIENT_ID',
    'NEXT_PUBLIC_COGNITO_REGION',
  ];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      console.warn(`Missing required environment variable: ${varName}`);
    }
  });

  return {
    region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
    clientSecret: process.env.COGNITO_CLIENT_SECRET,
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
  };
}

/**
 * Get Cognito User Pool data
 */
export function getUserPoolData(): ICognitoUserPoolData {
  const config = getCognitoConfig();
  return {
    UserPoolId: config.userPoolId,
    ClientId: config.clientId,
  };
}

/**
 * Get Cognito User Pool instance
 */
export function getUserPool(): CognitoUserPool {
  return new CognitoUserPool(getUserPoolData());
}

/**
 * Sign in with Cognito
 * 
 * @param email - User email
 * @param password - User password
 * @returns Promise<CognitoUserSession> - User session
 */
export function signIn(email: string, password: string): Promise<CognitoUserSession> {
  const userPool = getUserPool();
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Handle new password required
        reject(new Error('New password required'));
      },
    });
  });
}

/**
 * Sign up with Cognito
 * 
 * @param email - User email
 * @param password - User password
 * @param attributes - User attributes
 * @returns Promise<any> - Sign up result
 */
export function signUp(
  email: string,
  password: string,
  attributes: { [key: string]: string }
): Promise<any> {
  const userPool = getUserPool();
  
  const attributeList = Object.entries(attributes).map(
    ([key, value]) => new CognitoUserAttribute({ Name: key, Value: value })
  );

  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

/**
 * Confirm sign up with Cognito
 * 
 * @param email - User email
 * @param code - Verification code
 * @returns Promise<any> - Confirm result
 */
export function confirmSignUp(email: string, code: string): Promise<any> {
  const userPool = getUserPool();
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

/**
 * Get current authenticated user
 * 
 * @returns CognitoUser | null - Current user
 */
export function getCurrentUser(): CognitoUser | null {
  const userPool = getUserPool();
  return userPool.getCurrentUser();
}

/**
 * Get current user session
 * 
 * @returns Promise<CognitoUserSession> - User session
 */
export function getCurrentSession(): Promise<CognitoUserSession> {
  const cognitoUser = getCurrentUser();
  
  if (!cognitoUser) {
    return Promise.reject(new Error('No current user'));
  }

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session) {
        reject(err || new Error('No valid session'));
        return;
      }
      resolve(session);
    });
  });
}

/**
 * Get current user attributes
 * 
 * @returns Promise<CognitoUserAttributes> - User attributes
 */
export function getUserAttributes(): Promise<CognitoUserAttributes> {
  const cognitoUser = getCurrentUser();
  
  if (!cognitoUser) {
    return Promise.reject(new Error('No current user'));
  }

  return new Promise((resolve, reject) => {
    cognitoUser.getUserAttributes((err, attributes) => {
      if (err || !attributes) {
        reject(err || new Error('Failed to get user attributes'));
        return;
      }

      const userAttributes: { [key: string]: string } = {};
      
      attributes.forEach((attribute) => {
        userAttributes[attribute.getName()] = attribute.getValue();
      });

      resolve(userAttributes as CognitoUserAttributes);
    });
  });
}

/**
 * Sign out current user
 */
export function signOut(): void {
  const cognitoUser = getCurrentUser();
  
  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

/**
 * Change password for current user
 * 
 * @param oldPassword - Old password
 * @param newPassword - New password
 * @returns Promise<string> - Success message
 */
export function changePassword(oldPassword: string, newPassword: string): Promise<string> {
  const cognitoUser = getCurrentUser();
  
  if (!cognitoUser) {
    return Promise.reject(new Error('No current user'));
  }

  return new Promise((resolve, reject) => {
    cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result || 'Password changed successfully');
    });
  });
}

/**
 * Request password reset for user
 * 
 * @param email - User email
 * @returns Promise<string> - Success message
 */
export function forgotPassword(email: string): Promise<string> {
  const userPool = getUserPool();
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Confirm password reset for user
 * 
 * @param email - User email
 * @param code - Verification code
 * @param newPassword - New password
 * @returns Promise<string> - Success message
 */
export function confirmPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<string> {
  const userPool = getUserPool();
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve('Password reset successful');
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Set up MFA for user
 * 
 * @returns Promise<string> - MFA secret
 */
export function setupMFA(): Promise<string> {
  const cognitoUser = getCurrentUser();
  
  if (!cognitoUser) {
    return Promise.reject(new Error('No current user'));
  }

  return new Promise((resolve, reject) => {
    cognitoUser.associateSoftwareToken({
      associateSecretCode: (secretCode) => {
        resolve(secretCode);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Verify MFA setup
 * 
 * @param code - MFA code
 * @returns Promise<string> - Success message
 */
export function verifyMFA(code: string): Promise<string> {
  const cognitoUser = getCurrentUser();
  
  if (!cognitoUser) {
    return Promise.reject(new Error('No current user'));
  }

  return new Promise((resolve, reject) => {
    cognitoUser.verifySoftwareToken(code, 'MFA', {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}