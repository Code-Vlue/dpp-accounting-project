// src/components/finance/tuition-credits/ProviderList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/finance-store';
import { Provider, ProviderType, ProviderStatus, ProviderQualityRating } from '@/types/finance';

interface ProviderListProps {
  searchTerm?: string;
  providerType?: ProviderType;
  status?: ProviderStatus;
  qualityRating?: ProviderQualityRating;
  providers?: Provider[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCreateCredit?: (id: string) => void;
}

export default function ProviderList({ 
  searchTerm = '', 
  providerType, 
  status, 
  qualityRating,
  providers: externalProviders,
  onView,
  onEdit,
  onCreateCredit
}: ProviderListProps) {
  const { providers: storeProviders, providersLoading, providerError, fetchProviders } = useFinanceStore();
  
  // Use externally provided providers if available, otherwise use the ones from the store
  const providersList = externalProviders || storeProviders;
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  
  useEffect(() => {
    // Only fetch providers from the store if we're not using external providers
    if (!externalProviders) {
      fetchProviders();
    }
  }, [fetchProviders, externalProviders]);
  
  useEffect(() => {
    let filtered = [...providersList];
    
    // Filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(term) || 
        provider.vendorNumber.toLowerCase().includes(term) ||
        (provider.contactName && provider.contactName.toLowerCase().includes(term)) ||
        (provider.licenseNumber && provider.licenseNumber.toLowerCase().includes(term))
      );
    }
    
    // Filter by provider type if provided
    if (providerType) {
      filtered = filtered.filter(provider => provider.providerType === providerType);
    }
    
    // Filter by status if provided
    if (status) {
      filtered = filtered.filter(provider => provider.providerStatus === status);
    }
    
    // Filter by quality rating if provided
    if (qualityRating) {
      filtered = filtered.filter(provider => provider.qualityRating === qualityRating);
    }
    
    setFilteredProviders(filtered);
  }, [providersList, searchTerm, providerType, status, qualityRating]);
  
  // Only show loading if we're not using external providers and the store is still loading
  if (!externalProviders && providersLoading) {
    return <div className="p-4 text-center">Loading providers...</div>;
  }
  
  // Only show error if we're not using external providers and there's an error from the store
  if (!externalProviders && providerError) {
    return <div className="p-4 text-center text-red-500">Error loading providers: {providerError}</div>;
  }
  
  if (filteredProviders.length === 0) {
    return <div className="p-4 text-center">No providers found.</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Provider</th>
            <th className="py-2 px-4 border-b text-left">Type</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Quality Rating</th>
            <th className="py-2 px-4 border-b text-left">YTD Credits</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProviders.map((provider) => (
            <tr key={provider.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">
                <div className="font-medium">{provider.name}</div>
                <div className="text-sm text-gray-500">ID: {provider.vendorNumber}</div>
                {provider.licenseNumber && (
                  <div className="text-sm text-gray-500">License: {provider.licenseNumber}</div>
                )}
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getProviderTypeColor(provider.providerType)}`}>
                  {formatProviderType(provider.providerType)}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getProviderStatusColor(provider.providerStatus)}`}>
                  {formatProviderStatus(provider.providerStatus)}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getQualityRatingColor(provider.qualityRating)}`}>
                  {formatQualityRating(provider.qualityRating)}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="font-medium">${provider.yearToDateCredits.toLocaleString()}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="flex space-x-2">
                  {onView ? (
                    <button 
                      onClick={() => onView(provider.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  ) : (
                    <Link 
                      href={`/finance/tuition-credits/providers/${provider.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  )}
                  
                  {onEdit ? (
                    <button 
                      onClick={() => onEdit(provider.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Edit
                    </button>
                  ) : (
                    <Link 
                      href={`/finance/tuition-credits/providers/${provider.id}/edit`}
                      className="text-green-600 hover:text-green-800"
                    >
                      Edit
                    </Link>
                  )}
                  
                  {onCreateCredit ? (
                    <button 
                      onClick={() => onCreateCredit(provider.id)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Credits
                    </button>
                  ) : (
                    <Link 
                      href={`/finance/tuition-credits/providers/${provider.id}/credits`}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Credits
                    </Link>
                  )}
                  
                  <Link 
                    href={`/finance/tuition-credits/providers/${provider.id}/payments`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Payments
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatProviderType(type: ProviderType): string {
  switch (type) {
    case ProviderType.CENTER:
      return 'Center';
    case ProviderType.HOME:
      return 'Home';
    case ProviderType.SCHOOL:
      return 'School';
    case ProviderType.OTHER:
      return 'Other';
    default:
      return type;
  }
}

function getProviderTypeColor(type: ProviderType): string {
  switch (type) {
    case ProviderType.CENTER:
      return 'bg-blue-100 text-blue-800';
    case ProviderType.HOME:
      return 'bg-green-100 text-green-800';
    case ProviderType.SCHOOL:
      return 'bg-purple-100 text-purple-800';
    case ProviderType.OTHER:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatProviderStatus(status: ProviderStatus): string {
  switch (status) {
    case ProviderStatus.ACTIVE:
      return 'Active';
    case ProviderStatus.INACTIVE:
      return 'Inactive';
    case ProviderStatus.PENDING:
      return 'Pending';
    case ProviderStatus.SUSPENDED:
      return 'Suspended';
    default:
      return status;
  }
}

function getProviderStatusColor(status: ProviderStatus): string {
  switch (status) {
    case ProviderStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case ProviderStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800';
    case ProviderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case ProviderStatus.SUSPENDED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatQualityRating(rating: ProviderQualityRating): string {
  switch (rating) {
    case ProviderQualityRating.LEVEL_1:
      return 'Level 1';
    case ProviderQualityRating.LEVEL_2:
      return 'Level 2';
    case ProviderQualityRating.LEVEL_3:
      return 'Level 3';
    case ProviderQualityRating.LEVEL_4:
      return 'Level 4';
    case ProviderQualityRating.LEVEL_5:
      return 'Level 5';
    case ProviderQualityRating.UNRATED:
      return 'Unrated';
    default:
      return rating;
  }
}

function getQualityRatingColor(rating: ProviderQualityRating): string {
  switch (rating) {
    case ProviderQualityRating.LEVEL_1:
      return 'bg-gray-100 text-gray-800';
    case ProviderQualityRating.LEVEL_2:
      return 'bg-blue-100 text-blue-800';
    case ProviderQualityRating.LEVEL_3:
      return 'bg-teal-100 text-teal-800';
    case ProviderQualityRating.LEVEL_4:
      return 'bg-indigo-100 text-indigo-800';
    case ProviderQualityRating.LEVEL_5:
      return 'bg-purple-100 text-purple-800';
    case ProviderQualityRating.UNRATED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}