// src/app/finance/tuition-credits/payments/new/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';
import { ProviderPaymentForm } from '@/components/finance/tuition-credits';
import { TuitionCreditStatus } from '@/types/finance';

export default function NewProviderPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batchId');
  const providerId = searchParams.get('providerId');
  
  const { 
    providers,
    tuitionCredits,
    providerPaymentDraft,
    fetchProviders,
    fetchTuitionCredits,
    updateProviderPaymentDraft,
    resetProviderPaymentDraft,
    submitProviderPayment,
    providersLoading,
    tuitionCreditsLoading
  } = useFinanceStore();

  useEffect(() => {
    fetchProviders();
    fetchTuitionCredits();
    resetProviderPaymentDraft();
    
    // If providerId is provided in URL, pre-populate the draft
    if (providerId) {
      updateProviderPaymentDraft('providerId', providerId);
      
      // Find all processed credits for this provider
      const providerCredits = tuitionCredits.filter(credit => 
        credit.providerId === providerId && 
        credit.creditStatus === TuitionCreditStatus.PROCESSED
      );
      
      if (providerCredits.length > 0) {
        const creditIds = providerCredits.map(credit => credit.id);
        const totalAmount = providerCredits.reduce((sum, credit) => sum + credit.dppPortion, 0);
        
        // Update credit IDs and amount separately
        updateProviderPaymentDraft('tuitionCreditIds', creditIds);
        updateProviderPaymentDraft('amount', totalAmount);
      }
    }
    
    // If batchId is provided in URL, find all credits in that batch
    if (batchId) {
      const batchCredits = tuitionCredits.filter(credit => 
        credit.paymentBatchId === batchId && 
        credit.creditStatus === TuitionCreditStatus.PROCESSED
      );
      
      if (batchCredits.length > 0) {
        // Group credits by provider
        const creditsByProvider: Record<string, {
          credits: typeof batchCredits,
          totalAmount: number
        }> = {};
        
        batchCredits.forEach(credit => {
          if (!creditsByProvider[credit.providerId]) {
            creditsByProvider[credit.providerId] = {
              credits: [],
              totalAmount: 0
            };
          }
          
          creditsByProvider[credit.providerId].credits.push(credit);
          creditsByProvider[credit.providerId].totalAmount += credit.dppPortion;
        });
        
        // If there's only one provider in the batch, select it automatically
        const providerIds = Object.keys(creditsByProvider);
        if (providerIds.length === 1) {
          const providerId = providerIds[0];
          const providerData = creditsByProvider[providerId];
          
          // Update provider ID, credit IDs and amount separately
          updateProviderPaymentDraft('providerId', providerId);
          updateProviderPaymentDraft('tuitionCreditIds', providerData.credits.map(credit => credit.id));
          updateProviderPaymentDraft('amount', providerData.totalAmount);
        }
      }
    }
  }, [
    fetchProviders, 
    fetchTuitionCredits, 
    resetProviderPaymentDraft, 
    updateProviderPaymentDraft, 
    providerId, 
    batchId,
    tuitionCredits
  ]);

  // Filter eligible credits (processed but not yet paid)
  const eligibleCredits = tuitionCredits.filter(credit => 
    credit.creditStatus === TuitionCreditStatus.PROCESSED &&
    !credit.paymentDate
  );

  const handleSubmit = async () => {
    try {
      await submitProviderPayment('current-user-id'); // Replace with actual user ID
      router.push('/finance/tuition-credits/payments');
    } catch (error) {
      console.error('Failed to create provider payment:', error);
    }
  };

  const loading = providersLoading || tuitionCreditsLoading;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Provider Payment</h1>
        <Button variant="outline" onClick={() => router.push('/finance/tuition-credits/payments')}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>Configure the provider payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderPaymentForm
            providers={providers}
            eligibleCredits={eligibleCredits}
            paymentDraft={providerPaymentDraft}
            onUpdatePayment={updateProviderPaymentDraft}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}