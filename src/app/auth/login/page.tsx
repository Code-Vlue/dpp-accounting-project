// src/app/auth/login/page.tsx
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Import the client component with no SSR
const LoginClient = dynamic(() => import('./page.client'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Login | DPP Accounting Platform',
  description: 'Sign in to your DPP Accounting Platform account',
};

export default function LoginPage() {
  // Return the client component which will only render on the client side
  return <LoginClient />;
}