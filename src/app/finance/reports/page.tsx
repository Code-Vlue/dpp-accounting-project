'use client';

// src/app/finance/reports/page.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { financeService } from '@/lib/finance/finance-service';
import { FinancialReportConfig } from '@/types/finance';
import Link from 'next/link';

export default function ReportsPage() {
  const [reports, setReports] = useState<FinancialReportConfig[]>([]);
  const [loading, setLoading] = useState(true);
  // Unused variable prefixed with underscore
  const _router = useRouter();

  useEffect(() => {
    async function loadReports() {
      try {
        const reportConfigs = await financeService.getAllFinancialReportConfigs();
        setReports(reportConfigs);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRunReport = async (reportId: string) => {
    try {
      // In a real application, this would generate and download the report
      alert(`Report ${reportId} will be generated and downloaded.`);
    } catch (error) {
      console.error('Error running report:', error);
    }
  };

  const handleScheduleReport = async (reportId: string) => {
    try {
      await financeService.scheduleReport(reportId);
      alert(`Report ${reportId} has been scheduled successfully.`);
    } catch (error) {
      console.error('Error scheduling report:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report configuration?')) {
      return;
    }

    try {
      await financeService.deleteFinancialReportConfig(reportId);
      setReports(reports.filter(report => report.id !== reportId));
      alert('Report configuration deleted successfully.');
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-blue border-t-transparent rounded-full mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-dark-blue">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue">Financial Reports</h1>
          <p className="text-gray-600">View, generate, and manage financial reports</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/finance/reports/custom/new" 
            className="bg-primary-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Custom Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/finance/reports/balance-sheet" className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-dark-blue mb-2">Balance Sheet</h2>
          <p className="text-gray-600 mb-4">View and generate balance sheet reports showing assets, liabilities, and equity</p>
          <div className="flex justify-end">
            <span className="text-primary-blue">View Report →</span>
          </div>
        </Link>

        <Link href="/finance/reports/income-statement" className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-dark-blue mb-2">Income Statement</h2>
          <p className="text-gray-600 mb-4">View and generate income statements showing revenue, expenses, and net income</p>
          <div className="flex justify-end">
            <span className="text-primary-blue">View Report →</span>
          </div>
        </Link>

        <Link href="/finance/reports/budget-vs-actual" className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-dark-blue mb-2">Budget vs. Actual</h2>
          <p className="text-gray-600 mb-4">Compare budgeted amounts to actual spending with variance analysis</p>
          <div className="flex justify-end">
            <span className="text-primary-blue">View Report →</span>
          </div>
        </Link>

        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-dark-blue mb-2">Statement of Functional Expenses</h2>
          <p className="text-gray-600 mb-4">View expenses categorized by program, administrative, and fundraising functions</p>
          <div className="flex justify-end">
            <Link href="/finance/reports/functional-expenses" className="text-primary-blue">View Report →</Link>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-dark-blue mb-4">Scheduled Reports</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No scheduled reports configured. Create a custom report to set up scheduled delivery.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{report.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.scheduledDelivery ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Scheduled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleRunReport(report.id)}
                          className="text-primary-blue hover:text-blue-700"
                          title="Run Report"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleScheduleReport(report.id)}
                          className="text-gray-600 hover:text-gray-800"
                          title={report.scheduledDelivery ? "Edit Schedule" : "Schedule Report"}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                        <Link
                          href={`/finance/reports/custom/${report.id}/edit`}
                          className="text-amber-600 hover:text-amber-800"
                          title="Edit Report"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Report"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-dark-blue mb-4">Export Options</h2>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">PDF Export</h3>
                <p className="text-sm text-gray-500">High-quality document format</p>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Excel Export</h3>
                <p className="text-sm text-gray-500">Editable spreadsheet format</p>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg flex items-center space-x-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">CSV Export</h3>
                <p className="text-sm text-gray-500">Simple data format</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}