// src/app/finance/tuition-credits/batches/new/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCreditBatchForm } from '@/components/finance/tuition-credits';
import { TuitionCreditStatus } from '@/types/finance';

export default function NewTuitionCreditBatchPage() {
  const router = useRouter();
  
  const [batchData, setBatchData] = useState({
    name: '',
    description: '',
    periodStart: new Date(),
    periodEnd: new Date(),
    status: TuitionCreditStatus.DRAFT,
    creditIds: [],
    providerIds: [],
    totalAmount: 0
  });
  
  const { 
    tuitionCredits, 
    providers,
    fetchTuitionCredits,
    fetchProviders,
    createTuitionCreditBatch,
    tuitionCreditsLoading,
    providersLoading
  } = useFinanceStore();

  useEffect(() => {
    fetchTuitionCredits();
    fetchProviders();
  }, [fetchTuitionCredits, fetchProviders]);

  // Filter eligible credits (not already in a batch and approved)
  const eligibleCredits = tuitionCredits.filter(credit => 
    !credit.paymentBatchId && 
    credit.creditStatus === TuitionCreditStatus.APPROVED
  );

  const handleUpdateBatch = (updates: Partial<typeof batchData>) => {
    setBatchData({
      ...batchData,
      ...updates
    });
  };

  const handleSubmit = async () => {
    try {
      await createTuitionCreditBatch({
        ...batchData,
        createdById: 'current-user-id', // Replace with actual user ID
        createdAt: new Date(), // Provide required field
        updatedAt: new Date()  // Provide required field
      });
      router.push('/finance/tuition-credits/batches');
    } catch (error) {
      console.error('Failed to create tuition credit batch:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Tuition Credit Batch</h1>
        <Button variant="outline" onClick={() => router.push('/finance/tuition-credits/batches')}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
          <CardDescription>Configure the tuition credit batch</CardDescription>
        </CardHeader>
        <CardContent>
          <TuitionCreditBatchForm
            batchData={batchData}
            onUpdateBatch={handleUpdateBatch}
            onSubmit={handleSubmit}
            eligibleCredits={eligibleCredits}
            providers={providers}
            loading={tuitionCreditsLoading || providersLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}