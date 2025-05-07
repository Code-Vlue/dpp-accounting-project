// src/app/finance/tuition-credits/providers/[id]/edit/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';
import { ProviderForm } from '@/components/finance/tuition-credits';

export default function EditProviderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const providerId = params.id;
  
  const { 
    selectedProvider, 
    fetchProviderById, 
    updateProvider, 
    providersLoading
  } = useFinanceStore();

  useEffect(() => {
    if (providerId) {
      fetchProviderById(providerId);
    }
  }, [providerId, fetchProviderById]);

  const handleSubmit = async (providerData: any) => {
    try {
      await updateProvider(providerId, providerData);
      router.push(`/finance/tuition-credits/providers/${providerId}`);
    } catch (error) {
      console.error('Failed to update provider:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Edit Provider
          {selectedProvider && `: ${selectedProvider.name}`}
        </h1>
        <Button variant="outline" onClick={() => router.push(`/finance/tuition-credits/providers/${providerId}`)}>
          Cancel
        </Button>
      </div>

      {selectedProvider && (
        <Card>
          <CardHeader>
            <CardTitle>Provider Information</CardTitle>
            <CardDescription>Update the provider details</CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderForm provider={selectedProvider} onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      )}

      {providersLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}