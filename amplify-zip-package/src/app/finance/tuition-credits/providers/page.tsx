// src/app/finance/tuition-credits/providers/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from '@/store/finance-store';
import { ProviderList } from '@/components/finance/tuition-credits';

export default function ProvidersPage() {
  const router = useRouter();
  const { 
    providers, 
    fetchProviders, 
    providersLoading
  } = useFinanceStore();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Providers Management</h1>
        <Button onClick={() => router.push('/finance/tuition-credits/providers/new')}>
          Add New Provider
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Provider Quick Stats</CardTitle>
          <CardDescription>Overview of registered providers</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Providers</p>
            <p className="text-3xl font-bold">{providers.length}</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Active Providers</p>
            <p className="text-3xl font-bold">
              {providers.filter(p => p.providerStatus === 'ACTIVE').length}
            </p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Pending Providers</p>
            <p className="text-3xl font-bold">
              {providers.filter(p => p.providerStatus === 'PENDING').length}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Providers List</CardTitle>
          <CardDescription>All registered tuition credit providers</CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderList 
            providers={providers} 
            onView={(id) => router.push(`/finance/tuition-credits/providers/${id}`)} 
            onEdit={(id) => router.push(`/finance/tuition-credits/providers/${id}/edit`)}
            onCreateCredit={(id) => router.push(`/finance/tuition-credits/credits/new?providerId=${id}`)}
          />
        </CardContent>
      </Card>

      {providersLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}