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
    // 2. Window ENV object from env-config.js
    // 3. Direct window variables 
    // 4. Next.js environment variables
    // 5. Fallback value
    const fromWindow = (window as any).COGNITO_USER_POOL_ID;
    const fromEnv = (window as any).ENV?.COGNITO_USER_POOL_ID;
    const fromNextEnv = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
    
    if (fromWindow && fromWindow !== '__COGNITO_USER_POOL_ID__') {
      console.log('Using Cognito User Pool ID from window global');
      return fromWindow;
    }
    
    if (fromEnv && fromEnv !== '__COGNITO_USER_POOL_ID__') {
      console.log('Using Cognito User Pool ID from ENV object');
      return fromEnv;
    }
    
    if (fromNextEnv) {
      console.log('Using Cognito User Pool ID from Next.js env variables');
      return fromNextEnv;
    }
    
    console.warn('Using fallback Cognito User Pool ID');
    return FALLBACK_USER_POOL_ID;
  } else {
    // Server-side: Use env vars with fallback
    return process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || FALLBACK_USER_POOL_ID;
  }
};

const getClientId = () => {
  if (typeof window !== 'undefined') {
    // Client-side: Try multiple sources in order of priority
    const fromWindow = (window as any).COGNITO_CLIENT_ID;
    const fromEnv = (window as any).ENV?.COGNITO_CLIENT_ID;
    const fromNextEnv = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    
    if (fromWindow && fromWindow !== '__COGNITO_CLIENT_ID__') {
      console.log('Using Cognito Client ID from window global');
      return fromWindow;
    }
    
    if (fromEnv && fromEnv !== '__COGNITO_CLIENT_ID__') {
      console.log('Using Cognito Client ID from ENV object');
      return fromEnv;
    }
    
    if (fromNextEnv) {
      console.log('Using Cognito Client ID from Next.js env variables');
      return fromNextEnv;
    }
    
    console.warn('Using fallback Cognito Client ID');
    return FALLBACK_CLIENT_ID;
  } else {
    // Server-side: Use env vars with fallback
    return process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || FALLBACK_CLIENT_ID;
  }
};

// Get Cognito configuration from environment variables
const userPoolId = getUserPoolId();
const clientId = getClientId();

// Debug environment variable loading
if (typeof window !== 'undefined') {
  console.log('Auth configuration:', { 
    userPoolId: userPoolId === FALLBACK_USER_POOL_ID ? 'FALLBACK' : 'CONFIGURED',
    clientId: clientId === FALLBACK_CLIENT_ID ? 'FALLBACK' : 'CONFIGURED',
  });
  
  // Log all available variables (for debugging only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Available environment sources:', {
      nextPublicVars: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')),
      windowEnv: window.ENV ? 'Available' : 'Not Available',
      windowVars: ['COGNITO_USER_POOL_ID', 'COGNITO_CLIENT_ID', 'REGION'].filter(k => (window as any)[k]),
    });
  }
}

// Try to load environment variables from window.ENV
// This is helpful for Amplify deployments where env-config.js provides variables
if (typeof window !== 'undefined' && (window as any).ENV && !(window as any).ENV_LOADED) {
  try {
    // Check if env-config.js has already been loaded
    if ((window as any).ENV.COGNITO_USER_POOL_ID && (window as any).ENV.COGNITO_USER_POOL_ID !== '__COGNITO_USER_POOL_ID__') {
      console.log('Environment variables already loaded from env-config.js');
    } else {
      // Try to get environment variables from meta tags (Amplify injects these)
      const envVars = document.querySelectorAll('meta[name^="env-"]');
      envVars.forEach(meta => {
        const name = meta.getAttribute('name')?.replace('env-', '') || '';
        const content = meta.getAttribute('content') || '';
        if (name && content) {
          (window as any).ENV[name.toUpperCase()] = content;
          (window as any)[name.toUpperCase()] = content;
        }
      });
    }
    
    // Mark as loaded
    (window as any).ENV_LOADED = true;
  } catch (error) {
    console.warn('Failed to load environment variables from meta tags', error);
  }
}

if (!userPoolId || !clientId || userPoolId === FALLBACK_USER_POOL_ID || clientId === FALLBACK_CLIENT_ID) {
  console.warn('Using fallback Cognito configuration. Authentication may not work correctly in production.');
}

// Initialize Cognito User Pool
export const userPool = new CognitoUserPool({
  UserPoolId: userPoolId,
  ClientId: clientId,
});

export const getRegion = (): string => {
  // Try multiple sources for region
  if (typeof window !== 'undefined') {
    // Client-side
    return (window as any).REGION || 
          (window as any).ENV?.REGION || 
          process.env.AWS_REGION ||
          (userPoolId ? userPoolId.split('_')[0] : 'us-east-1');
  }
  
  // Server-side
  return process.env.AWS_REGION || 
        (userPoolId ? userPoolId.split('_')[0] : 'us-east-1');
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