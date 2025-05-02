// src/app/finance/tuition-credits/batches/[id]/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCreditList } from '@/components/finance/tuition-credits';
import { TuitionCreditStatus } from '@/types/finance';

export default function TuitionCreditBatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const batchId = params.id;
  
  const { 
    selectedTuitionCreditBatch,
    tuitionCredits,
    providers,
    fetchTuitionCreditBatchById,
    fetchTuitionCredits,
    fetchProviders,
    processTuitionCreditBatch,
    tuitionCreditBatchesLoading,
    tuitionCreditsLoading,
    providersLoading
  } = useFinanceStore();

  useEffect(() => {
    if (batchId) {
      fetchTuitionCreditBatchById(batchId);
      fetchTuitionCredits();
      fetchProviders();
    }
  }, [batchId, fetchTuitionCreditBatchById, fetchTuitionCredits, fetchProviders]);

  // Filter credits that belong to this batch
  const batchCredits = tuitionCredits.filter(credit => 
    selectedTuitionCreditBatch?.creditIds.includes(credit.id)
  );

  const handleProcess = async () => {
    if (selectedTuitionCreditBatch) {
      try {
        await processTuitionCreditBatch(batchId, 'current-user-id'); // Replace with actual user ID
        fetchTuitionCreditBatchById(batchId); // Refresh data
      } catch (error) {
        console.error('Failed to process tuition credit batch:', error);
      }
    }
  };

  // Get the status badge color based on batch status
  const getStatusBadgeVariant = (status: TuitionCreditStatus) => {
    switch (status) {
      case TuitionCreditStatus.DRAFT: return 'secondary';
      case TuitionCreditStatus.PENDING_APPROVAL: return 'warning';
      case TuitionCreditStatus.APPROVED: return 'default';
      case TuitionCreditStatus.PROCESSED: return 'success';
      case TuitionCreditStatus.PAID: return 'success';
      case TuitionCreditStatus.REJECTED: return 'destructive';
      case TuitionCreditStatus.VOIDED: return 'destructive';
      default: return 'secondary';
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const loading = tuitionCreditBatchesLoading || tuitionCreditsLoading || providersLoading;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Tuition Credit Batch Details
          {selectedTuitionCreditBatch && `: ${selectedTuitionCreditBatch.name}`}
        </h1>
        <div className="flex gap-2">
          {selectedTuitionCreditBatch?.status === TuitionCreditStatus.APPROVED && (
            <Button onClick={handleProcess}>
              Process Batch
            </Button>
          )}
          <Button 
            onClick={() => router.push('/finance/tuition-credits/batches')}
            variant="secondary"
          >
            Back to Batches
          </Button>
        </div>
      </div>

      {selectedTuitionCreditBatch && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
              <CardDescription>Details of the tuition credit batch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <dl className="grid grid-cols-3 gap-4">
                    <dt className="col-span-1 font-medium text-muted-foreground">Batch Name</dt>
                    <dd className="col-span-2">{selectedTuitionCreditBatch.name}</dd>
                    
                    <dt className="col-span-1 font-medium text-muted-foreground">Description</dt>
                    <dd className="col-span-2">{selectedTuitionCreditBatch.description || 'N/A'}</dd>
                    
                    <dt className="col-span-1 font-medium text-muted-foreground">Status</dt>
                    <dd className="col-span-2">
                      <Badge variant={getStatusBadgeVariant(selectedTuitionCreditBatch.status)}>
                        {selectedTuitionCreditBatch.status}
                      </Badge>
                    </dd>
                    
                    <dt className="col-span-1 font-medium text-muted-foreground">Created</dt>
                    <dd className="col-span-2">
                      {formatDate(selectedTuitionCreditBatch.createdAt)}
                    </dd>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Credit Details</h3>
                  <dl className="grid grid-cols-3 gap-4">
                    <dt className="col-span-1 font-medium text-muted-foreground">Period</dt>
                    <dd className="col-span-2">
                      {formatDate(selectedTuitionCreditBatch.periodStart)} - 
                      {formatDate(selectedTuitionCreditBatch.periodEnd)}
                    </dd>
                    
                    <dt className="col-span-1 font-medium text-muted-foreground">Total Amount</dt>
                    <dd className="col-span-2">${selectedTuitionCreditBatch.totalAmount.toLocaleString()}</dd>
                    
                    <dt className="col-span-1 font-medium text-muted-foreground">Credit Count</dt>
                    <dd className="col-span-2">{selectedTuitionCreditBatch.creditIds.length}</dd>
                    
                    <dt className="col-span-1 font-medium text-muted-foreground">Provider Count</dt>
                    <dd className="col-span-2">{selectedTuitionCreditBatch.providerIds.length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            {selectedTuitionCreditBatch.status === TuitionCreditStatus.PROCESSED && (
              <CardFooter>
                <div className="w-full flex justify-end">
                  <Button onClick={() => router.push(`/finance/tuition-credits/payments/new?batchId=${batchId}`)}>
                    Generate Payment
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credits in Batch</CardTitle>
              <CardDescription>Tuition credits included in this batch</CardDescription>
            </CardHeader>
            <CardContent>
              <TuitionCreditList 
                credits={batchCredits}
                onView={(id) => router.push(`/finance/tuition-credits/credits/${id}`)}
                showProvider={true}
                showStatus={true}
                providers={providers}
              />
            </CardContent>
          </Card>
        </>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}