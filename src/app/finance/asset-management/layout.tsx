// src/app/finance/asset-management/layout.tsx
import React from 'react';

export default function AssetManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white px-5 py-4 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
        <p className="text-gray-500">Track, depreciate, and manage fixed assets</p>
      </div>
      {children}
    </div>
  );
}