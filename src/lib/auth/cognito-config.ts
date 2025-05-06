/**
 * src/lib/auth/cognito-config.ts
 * 
 * Configuration for AWS Cognito authentication.
 * Handles loading and configuring Cognito User Pool for authentication.
 */
import { CognitoUserPool } from 'amazon-cognito-identity-js';

// Use fallback values for testing/development
const FALLBACK_USER_POOL_ID = 'us-east-1_example';
const FALLBACK_CLIENT_ID = 'example-client-id';

// Safely access environment variables or window globals
const getUserPoolId = () => {
  if (typeof window !== 'undefined') {
    // Client-side: Try multiple sources in order of priority
    // 1. Amplify global variables injected at runtime
    // 2. Environment variables
    // 3. Hardcoded window variables (for static deployments)
    // 4. Fallback value
    return (window as any).COGNITO_USER_POOL_ID || 
           process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 
           (window as any).ENV_COGNITO_USER_POOL_ID ||
           FALLBACK_USER_POOL_ID;
  } else {
    // Server-side: Use env vars with fallback
    return process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || FALLBACK_USER_POOL_ID;
  }
};

const getClientId = () => {
  if (typeof window !== 'undefined') {
    // Client-side: Try multiple sources in order of priority
    return (window as any).COGNITO_CLIENT_ID || 
           process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || 
           (window as any).ENV_COGNITO_CLIENT_ID ||
           FALLBACK_CLIENT_ID;
  } else {
    // Server-side: Use env vars with fallback
    return process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || FALLBACK_CLIENT_ID;
  }
};

// Get Cognito configuration from environment variables
const userPoolId = getUserPoolId();
const clientId = getClientId();

// For static builds, try to load environment variables from window
// This is useful for Amplify deployments where env vars are injected at runtime
if (typeof window !== 'undefined' && !(window as any).ENV_LOADED) {
  try {
    // Try to get environment variables from meta tags (Amplify injects these)
    const envVars = document.querySelectorAll('meta[name^="env-"]');
    envVars.forEach(meta => {
      const name = meta.getAttribute('name')?.replace('env-', '') || '';
      const content = meta.getAttribute('content') || '';
      if (name && content) {
        (window as any)[`ENV_${name.toUpperCase()}`] = content;
      }
    });
    
    // Mark as loaded
    (window as any).ENV_LOADED = true;
    
    console.log('Environment variables loaded from meta tags');
  } catch (error) {
    console.warn('Failed to load environment variables from meta tags', error);
  }
}

if (!userPoolId || !clientId) {
  console.warn('Cognito User Pool ID or Client ID is not defined in environment variables.');
}

// Initialize Cognito User Pool
export const userPool = new CognitoUserPool({
  UserPoolId: userPoolId,
  ClientId: clientId,
});

export const getRegion = (): string => {
  // Extract region from User Pool ID (format: region_id)
  if (userPoolId) {
    return userPoolId.split('_')[0];
  }
  return process.env.AWS_REGION || 'us-east-1';
};

// Other Cognito configuration options
export const cognitoConfig = {
  region: getRegion(),
  userPoolId,
  clientId,
  // Define custom attributes here
  customAttributes: [
    { name: 'custom:role', type: 'String', mutable: true },
    { name: 'custom:firstName', type: 'String', mutable: true },
    { name: 'custom:lastName', type: 'String', mutable: true },
  ],
  // MFA configuration
  mfaSettings: {
    enabled: true,
    preferredMFA: 'TOTP', // Time-based One-Time Password
  },
  // Password policy
  passwordPolicy: {
    minimumLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
};