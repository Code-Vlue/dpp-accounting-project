// src/app/finance/asset-management/assets/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { AssetList } from '@/components/finance/asset-management';

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white px-5 py-4 shadow-md rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset List</h1>
          <p className="text-gray-500">View and manage all assets</p>
        </div>
        <Link 
          href="/finance/asset-management/assets/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add New Asset
        </Link>
      </div>
      
      <AssetList title="All Assets" showFilters={true} />
    </div>
  );
}