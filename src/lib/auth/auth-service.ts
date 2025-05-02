// src/lib/auth/auth-service.ts
import {
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
  ISignUpResult,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { userPool } from './cognito-config';
import { 
  SignUpParams, 
  SignInParams, 
  ForgotPasswordParams, 
  ResetPasswordParams,
  ChangePasswordParams,
  User,
  UserRole
} from '@/types/auth';

class AuthService {
  /**
   * Sign up a new user with Cognito
   * @param params SignUpParams object containing user information
   * @returns Promise with signup result
   */
  async signUp(params: SignUpParams): Promise<ISignUpResult> {
    const { email, password, firstName, lastName, role = UserRole.USER } = params;
    
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];
    
    if (firstName) {
      attributeList.push(new CognitoUserAttribute({ Name: 'custom:firstName', Value: firstName }));
    }
    
    if (lastName) {
      attributeList.push(new CognitoUserAttribute({ Name: 'custom:lastName', Value: lastName }));
    }
    
    attributeList.push(new CognitoUserAttribute({ Name: 'custom:role', Value: role }));
    
    return new Promise((resolve, reject) => {
      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result!);
      });
    });
  }

  /**
   * Confirm a user's registration with verification code
   * @param email User's email
   * @param code Verification code sent to email
   * @returns Promise<any>
   */
  async confirmSignUp(email: string, code: string): Promise<any> {
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
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
   * Resend confirmation code for registration
   * @param email User's email
   * @returns Promise<any>
   */
  async resendConfirmationCode(email: string): Promise<any> {
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    return new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Sign in a user with Cognito
   * @param params SignInParams with email and password
   * @returns Promise with user session
   */
  async signIn(params: SignInParams): Promise<CognitoUserSession> {
    const { email, password } = params;
    
    const authenticationData = {
      Username: email,
      Password: password,
    };
    
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          resolve(session);
        },
        onFailure: (err) => {
          reject(err);
        },
        mfaRequired: (challengeName, challengeParameters) => {
          // Handle MFA if enabled
          reject(new Error('MFA required to complete authentication'));
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password if required
          reject(new Error('New password required'));
        }
      });
    });
  }

  /**
   * Sign out the current user
   * @returns Promise<void>
   */
  async signOut(): Promise<void> {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    return Promise.resolve();
  }

  /**
   * Initiate forgot password flow
   * @param params ForgotPasswordParams containing email
   * @returns Promise<any>
   */
  async forgotPassword(params: ForgotPasswordParams): Promise<any> {
    const { email } = params;
    
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * Complete reset password process with code and new password
   * @param params ResetPasswordParams
   * @returns Promise<any>
   */
  async resetPassword(params: ResetPasswordParams): Promise<any> {
    const { email, code, newPassword } = params;
    
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve({ success: true });
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * Change password for authenticated user
   * @param params ChangePasswordParams
   * @returns Promise<any>
   */
  async changePassword(params: ChangePasswordParams): Promise<any> {
    const { oldPassword, newPassword } = params;
    
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      return Promise.reject(new Error('No authenticated user'));
    }
    
    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        
        cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  /**
   * Get current authenticated user's session
   * @returns Promise with user session
   */
  async getCurrentSession(): Promise<CognitoUserSession> {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      return Promise.reject(new Error('No current user'));
    }
    
    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error('No valid session found'));
          return;
        }
        resolve(session);
      });
    });
  }

  /**
   * Get current authenticated user data
   * @returns Promise with User object
   */
  async getCurrentUser(): Promise<User> {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      return Promise.reject(new Error('No current user'));
    }
    
    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error('No valid session found'));
          return;
        }
        
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!attributes) {
            reject(new Error('No attributes found'));
            return;
          }
          
          // Convert attributes to user object
          const user: Partial<User> = {
            id: cognitoUser.getUsername(),
            isEmailVerified: session.isValid(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Map attributes to user properties
          attributes.forEach(attr => {
            switch (attr.getName()) {
              case 'email':
                user.email = attr.getValue();
                break;
              case 'custom:firstName':
                user.firstName = attr.getValue();
                break;
              case 'custom:lastName':
                user.lastName = attr.getValue();
                break;
              case 'custom:role':
                user.role = attr.getValue() as UserRole;
                break;
            }
          });
          
          resolve(user as User);
        });
      });
    });
  }

  /**
   * Check if current session is valid
   * @returns Promise<boolean>
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return session.isValid();
    } catch (error) {
      return false;
    }
  }

  /**
   * Set up MFA for a user
   * @param preferredMFA MFA method ('SMS' or 'TOTP')
   * @param phoneNumber Phone number for SMS (if applicable)
   * @returns Promise with MFA setup result
   */
  async setupMFA(preferredMFA: 'SMS' | 'TOTP', phoneNumber?: string): Promise<any> {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      return Promise.reject(new Error('No current user'));
    }
    
    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (preferredMFA === 'SMS' && phoneNumber) {
          // Set up SMS MFA
          const attributePhoneNumber = new CognitoUserAttribute({
            Name: 'phone_number',
            Value: phoneNumber
          });
          
          cognitoUser.updateAttributes([attributePhoneNumber], (err) => {
            if (err) {
              reject(err);
              return;
            }
            
            cognitoUser.setUserMfaPreference(
              { Enabled: true, PreferredMfa: true }, // SMS MFA
              null,
              (err, result) => {
                if (err) {
                  reject(err);
                  return;
                }
                resolve(result);
              }
            );
          });
        } else if (preferredMFA === 'TOTP') {
          // Set up TOTP MFA
          cognitoUser.associateSoftwareToken({
            onSuccess: (session) => {
              resolve(session);
            },
            onFailure: (err) => {
              reject(err);
            }
          });
        } else {
          reject(new Error('Invalid MFA method'));
        }
      });
    });
  }

  /**
   * Verify MFA setup with code
   * @param code Verification code
   * @returns Promise with verification result
   */
  async verifyMFA(code: string): Promise<any> {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      return Promise.reject(new Error('No current user'));
    }
    
    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        
        cognitoUser.verifySoftwareToken(code, 'TOTP MFA', {
          onSuccess: (session) => {
            cognitoUser.setUserMfaPreference(
              null, 
              { Enabled: true, PreferredMfa: true }, // TOTP MFA
              (err, result) => {
                if (err) {
                  reject(err);
                  return;
                }
                resolve(result);
              }
            );
          },
          onFailure: (err) => {
            reject(err);
          }
        });
      });
    });
  }
}

// Create and export a singleton instance
export const authService = new AuthService();