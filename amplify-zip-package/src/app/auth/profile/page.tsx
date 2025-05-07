// src/app/auth/profile/page.tsx
import { Metadata } from 'next';
import ProfileForm from '@/components/auth/ProfileForm';
import { redirect } from 'next/navigation';
// Unused import removed: import { getServerSession } from 'next-auth/next';
import { getServerSession as nextGetServerSession } from 'next-auth';

export const metadata: Metadata = {
  title: 'Your Profile | DPP Accounting Platform',
  description: 'Manage your DPP Accounting Platform profile and settings',
};

export default async function ProfilePage() {
  const session = await nextGetServerSession();
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/auth/profile');
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-blue">Your Profile</h1>
          <p className="text-gray-600 mt-2">
            View and manage your account information
          </p>
        </div>
        
        <ProfileForm />
        
        <div className="mt-8">
          <h2 className="text-xl font-bold text-dark-blue mb-4">Security Recommendations</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <ul className="space-y-4">
              <li className="flex">
                <svg
                  className="h-6 w-6 text-success-green mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-dark-blue">Use a strong, unique password</h3>
                  <p className="text-sm text-gray-600">
                    Your password should be at least 12 characters long with a mix of letters, numbers, and symbols.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <svg
                  className="h-6 w-6 text-success-green mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-dark-blue">Enable multi-factor authentication</h3>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security to your account with MFA.
                  </p>
                  <a
                    href="/auth/mfa"
                    className="text-sm text-accent-blue hover:underline mt-1 inline-block"
                  >
                    Set up MFA
                  </a>
                </div>
              </li>
              
              <li className="flex">
                <svg
                  className="h-6 w-6 text-success-green mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-dark-blue">Regularly update your password</h3>
                  <p className="text-sm text-gray-600">
                    Change your password every 90 days for enhanced security.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <svg
                  className="h-6 w-6 text-warning-red mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-dark-blue">Never share your credentials</h3>
                  <p className="text-sm text-gray-600">
                    Don't share your login information with anyone, including colleagues.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}