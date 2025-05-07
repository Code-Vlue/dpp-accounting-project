// src/components/finance/asset-management/AssetDetail.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Asset, 
  AssetStatus, 
  AssetDepreciationSchedule,
  AssetMaintenance,
  AssetTransfer
} from '@/types/finance';
import { useFinanceStore } from '@/store/finance-store';
import { AssetDepreciationSchedule as DepreciationScheduleComponent } from './';

interface AssetDetailProps {
  assetId: string;
}

const AssetDetail: React.FC<AssetDetailProps> = ({ assetId }) => {
  const { 
    selectedAsset, 
    fetchAssetById,
    assetMaintenances,
    assetTransfers,
    assetDepreciationSchedules,
    fetchAssetMaintenancesByAsset,
    fetchAssetTransfersByAsset,
    fetchAssetDepreciationSchedule
  } = useFinanceStore();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'depreciation' | 'maintenance' | 'transfers' | 'documents'>('overview');
  
  useEffect(() => {
    const loadAssetData = async () => {
      setLoading(true);
      try {
        await fetchAssetById(assetId);
        await fetchAssetMaintenancesByAsset(assetId);
        await fetchAssetTransfersByAsset(assetId);
        await fetchAssetDepreciationSchedule(assetId);
      } catch (error) {
        console.error('Error loading asset data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAssetData();
  }, [
    assetId, 
    fetchAssetById, 
    fetchAssetMaintenancesByAsset, 
    fetchAssetTransfersByAsset, 
    fetchAssetDepreciationSchedule
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case AssetStatus.DISPOSED:
        return 'bg-red-100 text-red-800';
      case AssetStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case AssetStatus.MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800';
      case AssetStatus.PENDING:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  if (!selectedAsset) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Asset not found</p>
        <Link href="/finance/asset-management/assets" className="text-blue-600 hover:text-blue-900 mt-4 inline-block">
          Back to Assets
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Asset Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {selectedAsset.assetNumber}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/finance/asset-management/assets/${assetId}/edit`} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Edit
          </Link>
          {selectedAsset.status === AssetStatus.ACTIVE && (
            <>
              <Link href={`/finance/asset-management/assets/${assetId}/maintenance/new`} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Maintenance
              </Link>
              <Link href={`/finance/asset-management/assets/${assetId}/transfer`} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Transfer
              </Link>
              <Link href={`/finance/asset-management/assets/${assetId}/dispose`} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Dispose
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="border-b border-gray-200">
        <div className="sm:hidden px-4 py-2">
          <select
            id="tabs"
            name="tabs"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
          >
            <option value="overview">Overview</option>
            <option value="depreciation">Depreciation</option>
            <option value="maintenance">Maintenance</option>
            <option value="transfers">Transfers</option>
            <option value="documents">Documents</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('depreciation')}
              className={`${
                activeTab === 'depreciation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Depreciation
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`${
                activeTab === 'transfers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Transfers
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Documents
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div className="px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedAsset.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedAsset.status)}`}>
                  {selectedAsset.status}
                </span>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Asset Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedAsset.assetNumber}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedAsset.serialNumber || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedAsset.type.replace(/_/g, ' ')}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedAsset.location || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedAsset.department || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedAsset.assignedTo || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedAsset.purchaseDate)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">In Service Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedAsset.inServiceDate)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Purchase Price</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatCurrency(selectedAsset.purchasePrice)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Current Value</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatCurrency(selectedAsset.currentValue)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Useful Life</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedAsset.usefulLifeYears} years ({selectedAsset.usefulLifeMonths} months)</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Depreciation Method</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedAsset.depreciationMethod.replace(/_/g, ' ')}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Last Depreciation Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedAsset.lastDepreciationDate)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Warranty Expiration</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedAsset.warrantyExpirationDate)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{selectedAsset.description}</dd>
            </div>
            {selectedAsset.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedAsset.notes}</dd>
              </div>
            )}
            {selectedAsset.tags && selectedAsset.tags.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Tags</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {selectedAsset.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
      
      {activeTab === 'depreciation' && (
        <div className="px-4 py-5 sm:px-6">
          <DepreciationScheduleComponent assetId={assetId} />
        </div>
      )}
      
      {activeTab === 'maintenance' && (
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Maintenance History</h4>
            <Link href={`/finance/asset-management/assets/${assetId}/maintenance/new`} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Record Maintenance
            </Link>
          </div>
          
          {assetMaintenances.length === 0 ? (
            <p className="text-gray-500 italic">No maintenance records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assetMaintenances.map((maintenance) => (
                    <tr key={maintenance.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(maintenance.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maintenance.maintenanceType}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{maintenance.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maintenance.provider}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(maintenance.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'transfers' && (
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Transfer History</h4>
            <Link href={`/finance/asset-management/assets/${assetId}/transfer`} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Transfer Asset
            </Link>
          </div>
          
          {assetTransfers.length === 0 ? (
            <p className="text-gray-500 italic">No transfer records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assetTransfers.map((transfer) => (
                    <tr key={transfer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transfer.transferDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          {transfer.previousDepartment && <div>Dept: {transfer.previousDepartment}</div>}
                          {transfer.previousLocation && <div>Location: {transfer.previousLocation}</div>}
                          {transfer.previousAssignee && <div>Assignee: {transfer.previousAssignee}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          {transfer.newDepartment && <div>Dept: {transfer.newDepartment}</div>}
                          {transfer.newLocation && <div>Location: {transfer.newLocation}</div>}
                          {transfer.newAssignee && <div>Assignee: {transfer.newAssignee}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{transfer.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'documents' && (
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Documents</h4>
            <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Upload Document
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-500">Document management feature coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;