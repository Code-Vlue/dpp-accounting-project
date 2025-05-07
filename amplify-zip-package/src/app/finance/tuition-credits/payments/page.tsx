// src/app/finance/tuition-credits/payments/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';
import { ProviderPaymentBatchList } from '@/components/finance/tuition-credits';
import { PaymentStatus } from '@/types/finance';

export default function ProviderPaymentsPage() {
  const router = useRouter();
  
  const { 
    providerPayments, 
    providerPaymentBatches,
    fetchProviderPayments,
    fetchProviderPaymentBatches,
    providerPaymentsLoading,
    providerPaymentBatchesLoading
  } = useFinanceStore();

  useEffect(() => {
    fetchProviderPayments();
    fetchProviderPaymentBatches();
  }, [fetchProviderPayments, fetchProviderPaymentBatches]);

  // Calculate statistics
  const totalPayments = providerPayments.length;
  const pendingPayments = providerPayments.filter(payment => 
    payment.status === PaymentStatus.PENDING).length;
  const completedPayments = providerPayments.filter(payment => 
    payment.status === PaymentStatus.COMPLETED).length;
  
  const totalBatches = providerPaymentBatches.length;
  const pendingBatches = providerPaymentBatches.filter(batch => 
    batch.status === PaymentStatus.PENDING).length;
  const processingBatches = providerPaymentBatches.filter(batch => 
    batch.status === PaymentStatus.PROCESSING).length;
  
  // Calculate total amounts
  const totalPaymentAmount = providerPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalBatchAmount = providerPaymentBatches.reduce((sum, batch) => sum + batch.totalAmount, 0);

  const loading = providerPaymentsLoading || providerPaymentBatchesLoading;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provider Payments</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/finance/tuition-credits/payments/new')}>
            Create Payment
          </Button>
          <Button variant="outline" onClick={() => router.push('/finance/tuition-credits/payments/batches/new')}>
            Create Payment Batch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Individual Payments</CardTitle>
            <CardDescription>Provider payment statistics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Payments</p>
              <p className="text-3xl font-bold">{totalPayments}</p>
              <p className="text-lg text-muted-foreground">${totalPaymentAmount.toLocaleString()}</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <div className="flex justify-around mt-2">
                <div>
                  <p className="text-sm">Pending</p>
                  <p className="text-2xl font-bold">{pendingPayments}</p>
                </div>
                <div>
                  <p className="text-sm">Completed</p>
                  <p className="text-2xl font-bold">{completedPayments}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Batches</CardTitle>
            <CardDescription>Payment batch statistics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Batches</p>
              <p className="text-3xl font-bold">{totalBatches}</p>
              <p className="text-lg text-muted-foreground">${totalBatchAmount.toLocaleString()}</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Batch Status</p>
              <div className="flex justify-around mt-2">
                <div>
                  <p className="text-sm">Pending</p>
                  <p className="text-2xl font-bold">{pendingBatches}</p>
                </div>
                <div>
                  <p className="text-sm">Processing</p>
                  <p className="text-2xl font-bold">{processingBatches}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Batches</CardTitle>
          <CardDescription>All provider payment batches in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderPaymentBatchList 
            batches={providerPaymentBatches}
            onView={(id) => router.push(`/finance/tuition-credits/payments/batches/${id}`)}
            onProcess={(id) => router.push(`/finance/tuition-credits/payments/batches/${id}/process`)}
            onGeneratePayfile={(id) => router.push(`/finance/tuition-credits/payments/batches/${id}/generate-payfile`)}
          />
        </CardContent>
      </Card>

      {loading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}