// src/components/finance/asset-management/AssetList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Asset, AssetType, AssetStatus } from '@/types/finance';
import { useFinanceStore } from '@/store/finance-store';

interface AssetListProps {
  initialAssets?: Asset[];
  title?: string;
  showFilters?: boolean;
  assetStatusFilter?: AssetStatus | 'ALL';
  assetTypeFilter?: AssetType | 'ALL';
  showActions?: boolean;
}

const AssetList: React.FC<AssetListProps> = ({
  initialAssets,
  title = 'Assets',
  showFilters = true,
  assetStatusFilter = 'ALL',
  assetTypeFilter = 'ALL',
  showActions = true
}) => {
  const { assets, assetsLoading, fetchAssets } = useFinanceStore();
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'ALL'>(assetStatusFilter);
  const [typeFilter, setTypeFilter] = useState<AssetType | 'ALL'>(assetTypeFilter);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!initialAssets) {
      fetchAssets();
    }
  }, [fetchAssets, initialAssets]);

  useEffect(() => {
    const assetsToFilter = initialAssets || assets;
    
    let filtered = [...assetsToFilter];
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(asset => asset.type === typeFilter);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(query) ||
        asset.description.toLowerCase().includes(query) ||
        asset.assetNumber.toLowerCase().includes(query) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(query)) ||
        (asset.barcode && asset.barcode.toLowerCase().includes(query))
      );
    }
    
    setFilteredAssets(filtered);
  }, [assets, initialAssets, statusFilter, typeFilter, searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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

  if (assetsLoading && !initialAssets) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        
        {showFilters && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <div className="mb-2 sm:mb-0">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AssetStatus | 'ALL')}
              >
                <option value="ALL">All Statuses</option>
                {Object.values(AssetStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-2 sm:mb-0">
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="type-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as AssetType | 'ALL')}
              >
                <option value="ALL">All Types</option>
                {Object.values(AssetType).map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-2 sm:mb-0 flex-grow">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                id="search"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by name, description, number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              {showActions && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No assets found
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {asset.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {asset.assetNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.type.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(asset.currentValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.location || 'N/A'}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/finance/asset-management/assets/${asset.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        View
                      </Link>
                      <Link href={`/finance/asset-management/assets/${asset.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </Link>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {showActions && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex justify-end">
            <Link href="/finance/asset-management/assets/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Add New Asset
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetList;