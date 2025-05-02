// src/app/finance/tuition-credits/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCreditStatus, ProviderStatus } from '@/types/finance';

export default function TuitionCreditsPage() {
  const router = useRouter();
  const {
    tuitionCredits,
    tuitionCreditBatches,
    providers,
    providerPayments,
    fetchTuitionCredits,
    fetchTuitionCreditBatches,
    fetchProviders,
    fetchProviderPayments,
    tuitionCreditsLoading,
    providersLoading
  } = useFinanceStore();

  useEffect(() => {
    fetchTuitionCredits();
    fetchTuitionCreditBatches();
    fetchProviders();
    fetchProviderPayments();
  }, [fetchTuitionCredits, fetchTuitionCreditBatches, fetchProviders, fetchProviderPayments]);

  // Calculate overview metrics
  const activeProviders = providers.filter(p => p.providerStatus === ProviderStatus.ACTIVE).length;
  const pendingCredits = tuitionCredits.filter(c => c.creditStatus === TuitionCreditStatus.PENDING_APPROVAL).length;
  const approvedCredits = tuitionCredits.filter(c => c.creditStatus === TuitionCreditStatus.APPROVED).length;
  const processingBatches = tuitionCreditBatches.filter(b => b.status === TuitionCreditStatus.PROCESSING).length;
  
  const totalCreditAmount = tuitionCredits.reduce((sum, credit) => sum + credit.dppPortion, 0);
  const pendingAmount = tuitionCredits
    .filter(c => c.creditStatus === TuitionCreditStatus.PENDING_APPROVAL)
    .reduce((sum, credit) => sum + credit.dppPortion, 0);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tuition Credit Management</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Active Providers</CardTitle>
            <CardDescription>Total registered providers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeProviders}</p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => router.push('/finance/tuition-credits/providers')}>
              Manage Providers
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Pending Credits</CardTitle>
            <CardDescription>Credits awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingCredits}</p>
            <p className="text-lg text-muted-foreground">${pendingAmount.toLocaleString()}</p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => router.push('/finance/tuition-credits/credits')}>
              View Credits
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Approved Credits</CardTitle>
            <CardDescription>Credits ready for payment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{approvedCredits}</p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => router.push('/finance/tuition-credits/credits?status=approved')}>
              Process Credits
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Processing Batches</CardTitle>
            <CardDescription>Batches being processed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{processingBatches}</p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => router.push('/finance/tuition-credits/batches')}>
              Manage Batches
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Tuition Credit</CardTitle>
            <CardDescription>Process a new tuition credit for a provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button onClick={() => router.push('/finance/tuition-credits/credits/new')} className="w-full">
                Create Individual Credit
              </Button>
              <Button onClick={() => router.push('/finance/tuition-credits/batches/new')} variant="outline" className="w-full">
                Create Credit Batch
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Process Provider Payments</CardTitle>
            <CardDescription>Generate payments for providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button onClick={() => router.push('/finance/tuition-credits/payments/new')} className="w-full">
                Create Provider Payment
              </Button>
              <Button onClick={() => router.push('/finance/tuition-credits/payments/batches/new')} variant="outline" className="w-full">
                Create Payment Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports and Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Tuition Credit Reporting</CardTitle>
          <CardDescription>Access reports and analytics for tuition credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => router.push('/finance/tuition-credits/reports/provider-summary')} variant="outline" className="w-full">
              Provider Credit Summary
            </Button>
            <Button onClick={() => router.push('/finance/tuition-credits/reports/credit-metrics')} variant="outline" className="w-full">
              Tuition Credit Metrics
            </Button>
            <Button onClick={() => router.push('/finance/tuition-credits/reports/quality-grants')} variant="outline" className="w-full">
              Quality Improvement Grants
            </Button>
          </div>
        </CardContent>
      </Card>

      {(tuitionCreditsLoading || providersLoading) && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}