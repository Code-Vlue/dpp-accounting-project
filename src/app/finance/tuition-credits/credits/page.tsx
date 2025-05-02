// src/app/finance/tuition-credits/credits/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCreditList } from '@/components/finance/tuition-credits';
import { TuitionCreditStatus } from '@/types/finance';

export default function TuitionCreditsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  
  const [statusFilter, setStatusFilter] = useState<string>(statusParam || 'all');

  const { 
    tuitionCredits, 
    fetchTuitionCredits,
    tuitionCreditsLoading 
  } = useFinanceStore();

  useEffect(() => {
    fetchTuitionCredits();
  }, [fetchTuitionCredits]);

  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [statusParam]);

  // Apply filters
  const filteredCredits = tuitionCredits.filter(credit => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return credit.creditStatus === TuitionCreditStatus.PENDING_APPROVAL;
    if (statusFilter === 'approved') return credit.creditStatus === TuitionCreditStatus.APPROVED;
    if (statusFilter === 'processed') return credit.creditStatus === TuitionCreditStatus.PROCESSED;
    if (statusFilter === 'paid') return credit.creditStatus === TuitionCreditStatus.PAID;
    if (statusFilter === 'rejected') return credit.creditStatus === TuitionCreditStatus.REJECTED;
    if (statusFilter === 'voided') return credit.creditStatus === TuitionCreditStatus.VOIDED;
    if (statusFilter === 'adjustments') return credit.isAdjustment === true;
    return true;
  });

  const totalAmount = filteredCredits.reduce((sum, credit) => sum + credit.dppPortion, 0);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    
    // Update URL to reflect filter
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    
    router.push(`/finance/tuition-credits/credits?${params.toString()}`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tuition Credits</h1>
        <Button onClick={() => router.push('/finance/tuition-credits/credits/new')}>
          Create New Credit
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Credits Overview</CardTitle>
          <CardDescription>Summary of tuition credits</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Credits</p>
            <p className="text-3xl font-bold">{filteredCredits.length}</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-3xl font-bold">
              {tuitionCredits.filter(c => c.creditStatus === TuitionCreditStatus.PENDING_APPROVAL).length}
            </p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Ready for Payment</p>
            <p className="text-3xl font-bold">
              {tuitionCredits.filter(c => c.creditStatus === TuitionCreditStatus.APPROVED).length}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Tuition Credits List</CardTitle>
            <CardDescription>All tuition credits in the system</CardDescription>
          </div>
          <div className="w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Credits</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="voided">Voided</SelectItem>
                <SelectItem value="adjustments">Adjustments Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <TuitionCreditList 
            credits={filteredCredits}
            onView={(id) => router.push(`/finance/tuition-credits/credits/${id}`)}
            onEdit={(id) => router.push(`/finance/tuition-credits/credits/${id}/edit`)}
          />
        </CardContent>
      </Card>

      {tuitionCreditsLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}