'use client';

// src/app/dashboard/page.tsx
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RoleDashboard from '@/components/dashboard/RoleDashboard';
import AccountBalanceWidget from '@/components/dashboard/AccountBalanceWidget';
import TransactionActivityFeed from '@/components/dashboard/TransactionActivityFeed';
import BudgetExpenseChart from '@/components/dashboard/BudgetExpenseChart';
import DateRangeSelector from '@/components/dashboard/DateRangeSelector';
import DataExportPanel from '@/components/dashboard/DataExportPanel';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashboardView, setDashboardView] = useState<'overview' | 'financial' | 'export'>('overview');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-blue border-t-transparent rounded-full mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-dark-blue">Loading...</h2>
        </div>
      </div>
    );
  }

  const handleDateRangeChange = (range: any) => {
    console.log('Date range selected:', range);
    // This would typically update state or fetch new data for the selected range
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark-blue">Financial Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.firstName || user?.name || 'User'}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setDashboardView('overview')}
              className={`px-4 py-2 rounded-md ${
                dashboardView === 'overview' 
                  ? 'bg-primary-blue text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setDashboardView('financial')}
              className={`px-4 py-2 rounded-md ${
                dashboardView === 'financial' 
                  ? 'bg-primary-blue text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Financial
            </button>
            <button 
              onClick={() => setDashboardView('export')}
              className={`px-4 py-2 rounded-md ${
                dashboardView === 'export' 
                  ? 'bg-primary-blue text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Export
            </button>
          </div>
        </div>
        
        {dashboardView === 'overview' && (
          <RoleDashboard 
            userRole={user?.role}
            userName={user?.firstName || user?.name || 'User'}
          />
        )}
        
        {dashboardView === 'financial' && (
          <div className="space-y-6">
            <DateRangeSelector onRangeChange={handleDateRangeChange} />
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8">
                <BudgetExpenseChart fiscalYear="2024-2025" />
              </div>
              <div className="md:col-span-4">
                <AccountBalanceWidget currentBalance={1568432.75} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7">
                <TransactionActivityFeed title="Recent Activity" maxItems={10} />
              </div>
              <div className="md:col-span-5">
                <div className="bg-white rounded-lg shadow-md p-6 h-full">
                  <h2 className="text-lg font-semibold text-dark-blue mb-4">
                    Financial Metrics
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Current Ratio</h3>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-primary-blue">2.4:1</p>
                        <div className="flex items-center text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                          </svg>
                          <span className="text-sm font-medium">+0.3</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-success-green h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Budget Variance</h3>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-primary-blue">-3.2%</p>
                        <div className="flex items-center text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                          </svg>
                          <span className="text-sm font-medium">Good</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-success-green h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Administrative Ratio</h3>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-primary-blue">12.8%</p>
                        <div className="flex items-center text-yellow-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                          </svg>
                          <span className="text-sm font-medium">Watch</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Program Service Ratio</h3>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-primary-blue">82.5%</p>
                        <div className="flex items-center text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                          </svg>
                          <span className="text-sm font-medium">+1.2%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-success-green h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {dashboardView === 'export' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataExportPanel />
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-dark-blue mb-4">
                Scheduled Reports
              </h2>
              
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">Monthly Financial Summary</h3>
                      <p className="text-sm text-gray-500">PDF • Monthly on 1st • All departments</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">Quarterly Budget Analysis</h3>
                      <p className="text-sm text-gray-500">Excel • Quarterly • Finance team</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">Weekly Transaction Log</h3>
                      <p className="text-sm text-gray-500">CSV • Weekly on Friday • Accounting</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-700 w-full flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Create New Scheduled Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}