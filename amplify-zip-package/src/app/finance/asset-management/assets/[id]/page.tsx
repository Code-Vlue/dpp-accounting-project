// src/app/finance/asset-management/assets/[id]/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { AssetDetail } from '@/components/finance/asset-management';

interface AssetPageProps {
  params: {
    id: string;
  };
}

export default function AssetPage({ params }: AssetPageProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white px-5 py-4 shadow-md rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Details</h1>
          <p className="text-gray-500">View asset information</p>
        </div>
        <Link 
          href="/finance/asset-management/assets"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Assets
        </Link>
      </div>
      
      <AssetDetail assetId={params.id} />
    </div>
  );
}