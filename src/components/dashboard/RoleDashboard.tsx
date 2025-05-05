'use client';

// src/components/dashboard/RoleDashboard.tsx
import { useState } from 'react';
import { UserRole } from '@/types/auth';
import AccountBalanceWidget from './AccountBalanceWidget';
import TransactionActivityFeed from './TransactionActivityFeed';
import BudgetExpenseChart from './BudgetExpenseChart';
import DateRangeSelector from './DateRangeSelector';
import Link from 'next/link';

interface RoleDashboardProps {
  userRole?: UserRole | string;
  userName?: string;
}

export default function RoleDashboard({ 
  userRole = UserRole.READONLY,
  userName = 'User'
}: RoleDashboardProps) {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    label: 'Last 30 Days'
  });
  
  // Render different dashboard layouts based on user role
  const renderDashboardByRole = () => {
    switch(userRole) {
      case 'ADMIN':
      case UserRole.ADMIN:
        return renderAdministratorDashboard();
      case 'ACCOUNTANT':
      case UserRole.ACCOUNTANT:
        return renderAccountantDashboard();
      case 'MANAGER':
      case UserRole.MANAGER:
        return renderManagerDashboard();
      case 'PROVIDER':
        return renderProviderDashboard();
      case 'READONLY':
      case UserRole.READONLY:
      default:
        return renderReadOnlyDashboard();
    }
  };
  
  // Administrator dashboard with comprehensive view
  const renderAdministratorDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-8">
          <AccountBalanceWidget currentBalance={1568432.75} />
        </div>
        <div className="md:col-span-4">
          <TransactionActivityFeed maxItems={6} />
        </div>
      </div>
      
      <div className="mb-6">
        <BudgetExpenseChart />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-dark-blue mb-4">
            System Status
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span>AWS Cognito Authentication</span>
              </div>
              <span className="text-green-500 font-medium">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span>Database Services</span>
              </div>
              <span className="text-green-500 font-medium">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span>API Services</span>
              </div>
              <span className="text-green-500 font-medium">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                <span>Data Import Services</span>
              </div>
              <span className="text-amber-500 font-medium">Maintenance</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-dark-blue mb-4">
            User Activity
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span>Active Users</span>
              <span className="font-medium">24</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span>New Accounts (30 days)</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span>Total Providers</span>
              <span className="font-medium">142</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Staff</span>
              <span className="font-medium">18</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-dark-blue mb-4">Financial Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/finance/chart-of-accounts" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-3">📒</span>
              <h3 className="text-lg font-medium text-dark-blue">Chart of Accounts</h3>
              <p className="mt-2 text-sm text-gray-600">Manage accounts structure</p>
            </div>
          </Link>
          
          <Link href="/finance/general-ledger" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-3">📝</span>
              <h3 className="text-lg font-medium text-dark-blue">General Ledger</h3>
              <p className="mt-2 text-sm text-gray-600">View transactions</p>
            </div>
          </Link>
          
          <Link href="/finance/general-ledger/new" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-3">➕</span>
              <h3 className="text-lg font-medium text-dark-blue">New Entry</h3>
              <p className="mt-2 text-sm text-gray-600">Create journal entries</p>
            </div>
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6 opacity-70">
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-3">📊</span>
              <h3 className="text-lg font-medium text-dark-blue">Reports</h3>
              <p className="mt-2 text-sm text-gray-600">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
  
  // Accountant dashboard with financial focus
  const renderAccountantDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <AccountBalanceWidget currentBalance={1568432.75} />
        <div className="col-span-2">
          <BudgetExpenseChart />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TransactionActivityFeed maxItems={8} />
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-dark-blue mb-4">
            Pending Approvals
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <div>
                <p className="font-medium">Invoices Requiring Approval</p>
                <p className="text-sm text-gray-600">12 pending items</p>
              </div>
              <button className="px-3 py-1 bg-white text-primary-blue border border-primary-blue rounded-md hover:bg-blue-50">
                Review
              </button>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Tuition Credits Pending</p>
                <p className="text-sm text-gray-600">5 pending batches</p>
              </div>
              <button className="px-3 py-1 bg-white text-primary-blue border border-primary-blue rounded-md hover:bg-blue-50">
                Process
              </button>
            </div>
            
            <Link href="/finance/general-ledger" className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Journal Entries for Review</p>
                <p className="text-sm text-gray-600">3 pending entries</p>
              </div>
              <div className="px-3 py-1 bg-white text-primary-blue border border-primary-blue rounded-md hover:bg-blue-50">
                Review
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/finance/chart-of-accounts" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-blue">Chart of Accounts</h2>
            <span className="text-3xl">📒</span>
          </div>
          <p className="mt-2 text-gray-600">Manage and view the organization's chart of accounts</p>
        </Link>
        
        <Link href="/finance/general-ledger" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-blue">General Ledger</h2>
            <span className="text-3xl">📝</span>
          </div>
          <p className="mt-2 text-gray-600">View and create journal entries and transactions</p>
        </Link>
        
        <Link href="/finance/general-ledger/new" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-blue">New Journal Entry</h2>
            <span className="text-3xl">➕</span>
          </div>
          <p className="mt-2 text-gray-600">Create a new journal entry in the general ledger</p>
        </Link>
      </div>
    </>
  );
  
  // Manager dashboard with oversight focus
  const renderManagerDashboard = () => (
    <>
      <div className="mb-6">
        <BudgetExpenseChart />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <AccountBalanceWidget currentBalance={1568432.75} />
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-dark-blue mb-4">
            Approvals Dashboard
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-4xl font-bold text-primary-blue">18</p>
              <p className="text-sm text-gray-600">Pending Approvals</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-4xl font-bold text-success-green">146</p>
              <p className="text-sm text-gray-600">Approved This Month</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button className="w-full py-2 bg-blue-100 text-primary-blue rounded-md hover:bg-blue-200 transition-colors">
              Review Budget Changes
            </button>
            <button className="w-full py-2 bg-amber-100 text-amber-600 rounded-md hover:bg-amber-200 transition-colors">
              Approve Pending Invoices
            </button>
            <button className="w-full py-2 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors">
              Review Provider Payments
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <TransactionActivityFeed maxItems={6} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-dark-blue mb-4">
            Reports & Analytics
          </h2>
          
          <div className="space-y-3">
            <button className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span>Financial Summary</span>
              <span>📊</span>
            </button>
            <button className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span>Budget Analysis</span>
              <span>💰</span>
            </button>
            <button className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span>Provider Activity</span>
              <span>👥</span>
            </button>
            <button className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span>Tuition Credit Summary</span>
              <span>🎓</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
  
  // Provider dashboard with limited view
  const renderProviderDashboard = () => (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-dark-blue mb-4">
          Provider Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-primary-blue">$24,680.75</p>
            <p className="text-sm text-gray-600">Current Balance</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-success-green">$5,280.00</p>
            <p className="text-sm text-gray-600">Last Payment</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">12</p>
            <p className="text-sm text-gray-600">Active Students</p>
          </div>
        </div>
        
        <h3 className="font-medium text-gray-700 mb-3">Recent Payments</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-500">Apr 15, 2025</td>
                <td className="px-4 py-3 text-sm text-gray-800">Tuition Credit Payment</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right">$5,280.00</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-500">Mar 15, 2025</td>
                <td className="px-4 py-3 text-sm text-gray-800">Tuition Credit Payment</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right">$5,120.00</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-500">Feb 15, 2025</td>
                <td className="px-4 py-3 text-sm text-gray-800">Tuition Credit Payment</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right">$4,960.00</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-500">Jan 15, 2025</td>
                <td className="px-4 py-3 text-sm text-gray-800">Quality Improvement Grant</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right">$2,500.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-dark-blue mb-4">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors flex flex-col items-center">
            <span className="text-3xl mb-2">📋</span>
            <span className="text-primary-blue">Submit Enrollment</span>
          </button>
          <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors flex flex-col items-center">
            <span className="text-3xl mb-2">📊</span>
            <span className="text-success-green">Payment History</span>
          </button>
          <button className="bg-amber-50 hover:bg-amber-100 p-4 rounded-lg transition-colors flex flex-col items-center">
            <span className="text-3xl mb-2">📝</span>
            <span className="text-amber-600">Update Information</span>
          </button>
          <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors flex flex-col items-center">
            <span className="text-3xl mb-2">📞</span>
            <span className="text-purple-600">Contact Support</span>
          </button>
        </div>
      </div>
    </>
  );
  
  // Read-only dashboard with limited functionality
  const renderReadOnlyDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <AccountBalanceWidget currentBalance={1568432.75} />
        </div>
        <div>
          <TransactionActivityFeed maxItems={5} />
        </div>
      </div>
      
      <div className="mb-6">
        <BudgetExpenseChart />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-dark-blue mb-4">
          Available Reports
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center">
            <span className="text-3xl mb-2">📊</span>
            <span className="text-center text-primary-blue">Balance Sheet</span>
          </div>
          <div className="bg-green-50 p-4 rounded-lg flex flex-col items-center">
            <span className="text-3xl mb-2">📈</span>
            <span className="text-center text-success-green">Income Statement</span>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg flex flex-col items-center">
            <span className="text-3xl mb-2">💵</span>
            <span className="text-center text-amber-600">Cash Flow</span>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center">
            <span className="text-3xl mb-2">🔎</span>
            <span className="text-center text-purple-600">Audit Report</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-blue">
          Welcome, {userName}
          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-primary-blue">
            {userRole}
          </span>
        </h1>
        
        <DateRangeSelector 
          onRangeChange={setDateRange}
          className="w-full md:w-auto"
        />
      </div>
      
      {renderDashboardByRole()}
    </div>
  );
}