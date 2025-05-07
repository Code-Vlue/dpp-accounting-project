// src/app/finance/tuition-credits/providers/[id]/payments/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { ProviderPaymentHistory } from '@/components/finance/providers/ProviderPaymentHistory';

export default function ProviderPaymentsPage() {
  const params = useParams<{ id: string }>();
  // Unused variable prefixed with underscore
  const _router = useRouter();
  const providerId = params.id;
  
  const { 
    selectedProvider,
    fetchProviderById
  } = useFinanceStore();
  
  useEffect(() => {
    fetchProviderById(providerId);
  }, [providerId, fetchProviderById]);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Provider Payments</h1>
          {selectedProvider && (
            <p className="text-gray-600 mt-1">{selectedProvider.name}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Link
            href={`/finance/tuition-credits/providers/${providerId}`}
            className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 hover:bg-gray-50"
          >
            Back to Provider
          </Link>
          
          <Link
            href={`/finance/tuition-credits/providers/${providerId}/quality-grant`}
            className="px-4 py-2 bg-purple-600 text-white rounded shadow-sm hover:bg-purple-700"
          >
            Create Quality Grant
          </Link>
          
          <Link
            href="/finance/tuition-credits/payment-batches/new"
            className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
          >
            New Payment Batch
          </Link>
        </div>
      </div>
      
      {/* Provider Summary Card */}
      {selectedProvider && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Provider Type</div>
              <div className="mt-1">{selectedProvider.providerType}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedProvider.providerStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                  selectedProvider.providerStatus === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                  selectedProvider.providerStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedProvider.providerStatus}
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-500">Quality Rating</div>
              <div className="mt-1">{selectedProvider.qualityRating || 'Not Rated'}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Full Payment History with no limit */}
      <ProviderPaymentHistory 
        providerId={providerId} 
        limit={0} 
        showViewAll={false} 
      />
    </div>
  );
}