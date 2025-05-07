// src/app/finance/tuition-credits/credits/new/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCreditForm } from '@/components/finance/tuition-credits';

export default function NewTuitionCreditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams.get('providerId');
  
  const { 
    providers,
    fetchProviders,
    updateTuitionCreditDraft,
    tuitionCreditDraft,
    resetTuitionCreditDraft,
    submitTuitionCredit,
    providersLoading
  } = useFinanceStore();

  useEffect(() => {
    fetchProviders();
    resetTuitionCreditDraft();
    
    // If providerId is provided in URL, pre-populate the draft
    if (providerId) {
      updateTuitionCreditDraft('providerId', providerId);
    }
  }, [fetchProviders, resetTuitionCreditDraft, providerId, updateTuitionCreditDraft]);

  const handleSubmit = async (userId: string) => {
    try {
      await submitTuitionCredit(userId);
      router.push('/finance/tuition-credits/credits');
    } catch (error) {
      console.error('Failed to create tuition credit:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Tuition Credit</h1>
        <Button variant="outline" onClick={() => router.push('/finance/tuition-credits/credits')}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tuition Credit Information</CardTitle>
          <CardDescription>Enter the details for the new tuition credit</CardDescription>
        </CardHeader>
        <CardContent>
          <TuitionCreditForm 
            providers={providers}
            tuitionCreditDraft={tuitionCreditDraft}
            onUpdate={updateTuitionCreditDraft}
            onSubmit={() => handleSubmit('current-user-id')} // Replace with actual user ID from auth context
            loading={providersLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}