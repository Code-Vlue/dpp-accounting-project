// src/app/finance/tuition-credits/batches/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCreditBatchList } from '@/components/finance/tuition-credits';
import { TuitionCreditStatus } from '@/types/finance';

export default function TuitionCreditBatchesPage() {
  // Unused variable prefixed with underscore
  const _router = useRouter();
  
  const { 
    tuitionCreditBatches, 
    fetchTuitionCreditBatches,
    tuitionCreditBatchesLoading 
  } = useFinanceStore();

  useEffect(() => {
    fetchTuitionCreditBatches();
  }, [fetchTuitionCreditBatches]);

  // Calculate batch statistics
  const totalBatches = tuitionCreditBatches.length;
  const pendingBatches = tuitionCreditBatches.filter(batch => 
    batch.status === TuitionCreditStatus.PENDING_APPROVAL).length;
  // Unused variable prefixed with underscore
  const _approvedBatches = tuitionCreditBatches.filter(batch => 
    batch.status === TuitionCreditStatus.APPROVED).length;
  const processedBatches = tuitionCreditBatches.filter(batch => 
    batch.status === TuitionCreditStatus.PROCESSED).length;

  // Calculate total amount
  const totalAmount = tuitionCreditBatches.reduce((sum, batch) => sum + batch.totalAmount, 0);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tuition Credit Batches</h1>
        <Button onClick={() => _router.push('/finance/tuition-credits/batches/new')}>
          Create New Batch
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Batches Overview</CardTitle>
          <CardDescription>Summary of tuition credit batches</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Batches</p>
            <p className="text-3xl font-bold">{totalBatches}</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-3xl font-bold">{pendingBatches}</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Processed Batches</p>
            <p className="text-3xl font-bold">{processedBatches}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tuition Credit Batches</CardTitle>
          <CardDescription>All tuition credit batches in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <TuitionCreditBatchList 
            batches={tuitionCreditBatches}
            onView={(id) => _router.push(`/finance/tuition-credits/batches/${id}`)}
            onProcess={(id) => _router.push(`/finance/tuition-credits/batches/${id}/process`)}
          />
        </CardContent>
      </Card>

      {tuitionCreditBatchesLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}