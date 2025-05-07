// src/app/finance/asset-management/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AssetList } from '@/components/finance/asset-management';
import { AssetStatus, AssetType } from '@/types/finance';

export default function AssetManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'maintenance' | 'disposed'>('all');
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Asset Management Dashboard</h2>
          <div className="flex space-x-3">
            <Link 
              href="/finance/asset-management/assets/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add New Asset
            </Link>
            <Link 
              href="/finance/asset-management/reports"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reports
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
              <div className="text-blue-500 text-lg font-medium mb-2">Total Assets</div>
              <div className="text-3xl font-bold text-blue-700">3</div>
              <div className="text-sm text-blue-500 mt-2">$17,300 total value</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-5 border border-green-100">
              <div className="text-green-500 text-lg font-medium mb-2">Active Assets</div>
              <div className="text-3xl font-bold text-green-700">3</div>
              <div className="text-sm text-green-500 mt-2">$17,300 current value</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-100">
              <div className="text-yellow-500 text-lg font-medium mb-2">In Maintenance</div>
              <div className="text-3xl font-bold text-yellow-700">0</div>
              <div className="text-sm text-yellow-500 mt-2">$0 current value</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <div className="text-gray-500 text-lg font-medium mb-2">This Month's Depreciation</div>
              <div className="text-3xl font-bold text-gray-700">$320</div>
              <div className="text-sm text-gray-500 mt-2">Across all assets</div>
            </div>
          </div>
          
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('all')}
                className={`${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                All Assets
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`${
                  activeTab === 'maintenance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                In Maintenance
              </button>
              <button
                onClick={() => setActiveTab('disposed')}
                className={`${
                  activeTab === 'disposed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Disposed
              </button>
            </nav>
          </div>
          
          {activeTab === 'all' && <AssetList title="All Assets" assetStatusFilter="ALL" />}
          {activeTab === 'active' && <AssetList title="Active Assets" assetStatusFilter={AssetStatus.ACTIVE} />}
          {activeTab === 'maintenance' && <AssetList title="Assets in Maintenance" assetStatusFilter={AssetStatus.MAINTENANCE} />}
          {activeTab === 'disposed' && <AssetList title="Disposed Assets" assetStatusFilter={AssetStatus.DISPOSED} />}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Assets By Type</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-blue-100 w-4 h-4 mr-3"></div>
                  <span className="text-sm text-gray-600">Computer Hardware</span>
                </div>
                <span className="text-sm font-medium">1 asset</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-green-100 w-4 h-4 mr-3"></div>
                  <span className="text-sm text-gray-600">Computer Software</span>
                </div>
                <span className="text-sm font-medium">1 asset</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-yellow-100 w-4 h-4 mr-3"></div>
                  <span className="text-sm text-gray-600">Furniture</span>
                </div>
                <span className="text-sm font-medium">1 asset</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Office Computer - Admin</span> depreciated by <span className="font-medium">$26.67</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">March 31, 2024</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Office Furniture - Conference Room</span> depreciated by <span className="font-medium">$25.00</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">March 31, 2024</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Office Software - Accounting System</span> added to assets
                </p>
                <p className="text-xs text-gray-500 mt-1">June 1, 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Assets Requiring Attention</h3>
          <Link href="/finance/asset-management/reports" className="text-sm text-blue-600 hover:text-blue-800">
            View All Reports
          </Link>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-md p-4 border border-yellow-200">
              <h4 className="text-yellow-800 font-medium mb-2">Upcoming Maintenance</h4>
              <p className="text-yellow-600 text-sm">None scheduled</p>
            </div>
            
            <div className="bg-blue-50 rounded-md p-4 border border-blue-200">
              <h4 className="text-blue-800 font-medium mb-2">Assets Nearing End of Life</h4>
              <p className="text-blue-600 text-sm">None detected</p>
            </div>
            
            <div className="bg-red-50 rounded-md p-4 border border-red-200">
              <h4 className="text-red-800 font-medium mb-2">Overdue Maintenance</h4>
              <p className="text-red-600 text-sm">None detected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}