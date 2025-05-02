// src/app/finance/tuition-credits/providers/[id]/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';
import { ProviderDetail } from '@/components/finance/tuition-credits';
import { TuitionCreditList } from '@/components/finance/tuition-credits';
import { ProviderPaymentHistory } from '@/components/finance/providers/ProviderPaymentHistory';

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const providerId = params.id;
  
  const { 
    selectedProvider, 
    tuitionCredits,
    fetchProviderById, 
    fetchTuitionCreditsByProvider,
    providersLoading,
    tuitionCreditsLoading
  } = useFinanceStore();

  useEffect(() => {
    if (providerId) {
      fetchProviderById(providerId);
      fetchTuitionCreditsByProvider(providerId);
    }
  }, [providerId, fetchProviderById, fetchTuitionCreditsByProvider]);

  const providerCredits = tuitionCredits.filter(credit => credit.providerId === providerId);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Provider Details
          {selectedProvider && `: ${selectedProvider.name}`}
        </h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push(`/finance/tuition-credits/providers/${providerId}/edit`)}
            variant="outline"
          >
            Edit Provider
          </Button>
          <Button 
            onClick={() => router.push(`/finance/tuition-credits/credits/new?providerId=${providerId}`)}
          >
            Create Credit
          </Button>
          <Button 
            onClick={() => router.push('/finance/tuition-credits/providers')}
            variant="secondary"
          >
            Back to Providers
          </Button>
        </div>
      </div>

      {selectedProvider && (
        <>
          {/* Action Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="hover:bg-gray-50 cursor-pointer" onClick={() => 
              router.push(`/finance/tuition-credits/providers/${providerId}/quality-grant`)
            }>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Quality Improvement</h3>
                    <p className="text-sm text-gray-500 mt-1">Create a quality improvement grant</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600">✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-gray-50 cursor-pointer" onClick={() => 
              router.push(`/finance/tuition-credits/providers/${providerId}/tax-information`)
            }>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Tax Information</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage provider tax details</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600">📄</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-gray-50 cursor-pointer" onClick={() => 
              router.push(`/finance/tuition-credits/providers/${providerId}/communication`)
            }>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Communication</h3>
                    <p className="text-sm text-gray-500 mt-1">Send messages to this provider</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600">✉</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
              <CardDescription>Detailed information about the provider</CardDescription>
            </CardHeader>
            <CardContent>
              <ProviderDetail provider={selectedProvider} />
            </CardContent>
          </Card>
          
          {/* Payment History */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Recent payments made to this provider</CardDescription>
              </div>
              <Link 
                href={`/finance/tuition-credits/providers/${providerId}/payments`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All Payments
              </Link>
            </CardHeader>
            <CardContent>
              <ProviderPaymentHistory providerId={providerId} limit={5} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tuition Credits History</CardTitle>
                <CardDescription>Credits issued to this provider</CardDescription>
              </div>
              <Link 
                href={`/finance/tuition-credits/credits?providerId=${providerId}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All Credits
              </Link>
            </CardHeader>
            <CardContent>
              <TuitionCreditList 
                credits={providerCredits}
                onView={(id) => router.push(`/finance/tuition-credits/credits/${id}`)}
                onEdit={(id) => router.push(`/finance/tuition-credits/credits/${id}/edit`)}
              />
            </CardContent>
          </Card>
        </>
      )}

      {(providersLoading || tuitionCreditsLoading) && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}