// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import { getCognitoConfig } from '@/lib/auth/cognito';
import { UserRole, UserSession } from '@/lib/auth/types';

const cognitoConfig = getCognitoConfig();

/**
 * NextAuth configuration
 */
const authConfig: AuthOptions = {
  providers: [
    CognitoProvider({
      clientId: cognitoConfig.clientId,
      clientSecret: cognitoConfig.clientSecret || '',
      issuer: `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`,
      idToken: true,
      checks: ['pkce', 'state'],
      client: {
        authorization_endpoint: `https://${cognitoConfig.domain}/oauth2/authorize`,
        token_endpoint: `https://${cognitoConfig.domain}/oauth2/token`,
        userinfo_endpoint: `https://${cognitoConfig.domain}/oauth2/userInfo`,
      },
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.given_name && profile.family_name 
            ? `${profile.given_name} ${profile.family_name}` 
            : profile.name || profile.email,
          firstName: profile.given_name,
          lastName: profile.family_name,
          image: profile.picture,
          role: profile['custom:role'] || UserRole.READONLY,
          organization: profile['custom:organization'] || 'Denver Preschool Program',
          groups: profile['cognito:groups'] || [],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          user: {
            ...user,
          },
        };
      }

      // Return previous token if the access token has not expired yet
      return token;
    },
    async session({ session, token }) {
      // Add user info, role, and tokens to the session
      const customSession = session as UserSession;
      
      if (token.user) {
        customSession.user = token.user as any;
      }
      
      if (token.accessToken) {
        customSession.accessToken = token.accessToken as string;
      }
      
      if (token.idToken) {
        customSession.idToken = token.idToken as string;
      }
      
      if (token.refreshToken) {
        customSession.refreshToken = token.refreshToken as string;
      }
      
      return customSession;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/auth/register',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 hour
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };