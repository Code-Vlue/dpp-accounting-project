// src/components/finance/asset-management/AssetDepreciationSchedule.tsx
'use client';

import React, { useState } from 'react';
import { AssetDepreciationSchedule as DepreciationSchedule } from '@/types/finance';
import { useFinanceStore } from '@/store/finance-store';

interface AssetDepreciationScheduleProps {
  assetId: string;
}

const AssetDepreciationSchedule: React.FC<AssetDepreciationScheduleProps> = ({ assetId }) => {
  const { 
    assetDepreciationSchedules, 
    selectedAsset,
    assetDepreciationSchedulesLoading,
    generateAssetDepreciationSchedule,
    recordAssetDepreciation
  } = useFinanceStore();
  
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [recordingDepreciation, setRecordingDepreciation] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleGenerateSchedule = async () => {
    setGeneratingSchedule(true);
    try {
      await generateAssetDepreciationSchedule(assetId);
    } catch (error) {
      console.error('Error generating depreciation schedule:', error);
      alert('Failed to generate depreciation schedule');
    } finally {
      setGeneratingSchedule(false);
    }
  };

  const handleRecordDepreciation = async () => {
    setRecordingDepreciation(true);
    try {
      await recordAssetDepreciation(assetId, new Date());
    } catch (error) {
      console.error('Error recording depreciation:', error);
      alert('Failed to record depreciation');
    } finally {
      setRecordingDepreciation(false);
    }
  };

  if (assetDepreciationSchedulesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">Depreciation Schedule</h4>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleGenerateSchedule}
            disabled={generatingSchedule}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {generatingSchedule ? 'Generating...' : 'Generate Schedule'}
          </button>
          
          {selectedAsset?.status === 'ACTIVE' && (
            <button
              type="button"
              onClick={handleRecordDepreciation}
              disabled={recordingDepreciation}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {recordingDepreciation ? 'Processing...' : 'Record Depreciation'}
            </button>
          )}
        </div>
      </div>
      
      {assetDepreciationSchedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No depreciation schedule available</p>
          <button
            type="button"
            onClick={handleGenerateSchedule}
            disabled={generatingSchedule}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {generatingSchedule ? 'Generating...' : 'Generate Depreciation Schedule'}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiscal Year
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiscal Period
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depreciation
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accumulated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assetDepreciationSchedules
                .sort((a, b) => new Date(a.depreciationDate).getTime() - new Date(b.depreciationDate).getTime())
                .map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(schedule.depreciationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.fiscalYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.fiscalPeriod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(schedule.depreciationAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(schedule.accumulatedDepreciation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(schedule.bookValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.journalEntryId ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Posted
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Projected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Depreciation Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Projected entries show the expected depreciation schedule. Posted entries have been recorded and will appear in the general ledger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDepreciationSchedule;