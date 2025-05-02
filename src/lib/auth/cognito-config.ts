// src/lib/auth/cognito-config.ts
import { CognitoUserPool } from 'amazon-cognito-identity-js';

// Get Cognito configuration from environment variables
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '';
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';

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