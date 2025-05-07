// src/app/finance/asset-management/assets/[id]/edit/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { AssetForm } from '@/components/finance/asset-management';

interface EditAssetPageProps {
  params: {
    id: string;
  };
}

export default function EditAssetPage({ params }: EditAssetPageProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white px-5 py-4 shadow-md rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Asset</h1>
          <p className="text-gray-500">Update asset information</p>
        </div>
        <Link 
          href={`/finance/asset-management/assets/${params.id}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </Link>
      </div>
      
      <AssetForm assetId={params.id} />
    </div>
  );
}