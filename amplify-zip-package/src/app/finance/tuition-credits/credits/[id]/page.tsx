// src/app/finance/tuition-credits/credits/[id]/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCreditDetail } from '@/components/finance/tuition-credits';
import { TuitionCreditStatus } from '@/types/finance';

export default function TuitionCreditDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const creditId = params.id;
  
  const { 
    selectedTuitionCredit,
    selectedProvider,
    fetchTuitionCreditById,
    fetchProviderById,
    approveTuitionCredit,
    rejectTuitionCredit,
    tuitionCreditsLoading
  } = useFinanceStore();

  useEffect(() => {
    if (creditId) {
      fetchTuitionCreditById(creditId);
    }
  }, [creditId, fetchTuitionCreditById]);

  useEffect(() => {
    if (selectedTuitionCredit?.providerId) {
      fetchProviderById(selectedTuitionCredit.providerId);
    }
  }, [selectedTuitionCredit?.providerId, fetchProviderById]);

  const handleApprove = async () => {
    if (selectedTuitionCredit) {
      try {
        await approveTuitionCredit(creditId, 'current-user-id'); // Replace with actual user ID
        fetchTuitionCreditById(creditId); // Refresh data
      } catch (error) {
        console.error('Failed to approve tuition credit:', error);
      }
    }
  };

  const handleReject = async () => {
    if (selectedTuitionCredit) {
      try {
        const reason = prompt('Please enter a reason for rejecting this credit:');
        if (reason) {
          await rejectTuitionCredit(creditId, 'current-user-id', reason); // Replace with actual user ID
          fetchTuitionCreditById(creditId); // Refresh data
        }
      } catch (error) {
        console.error('Failed to reject tuition credit:', error);
      }
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Tuition Credit Details
          {selectedProvider && `: ${selectedProvider.name}`}
        </h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push(`/finance/tuition-credits/credits/${creditId}/edit`)}
            variant="outline"
            disabled={selectedTuitionCredit?.creditStatus !== TuitionCreditStatus.DRAFT}
          >
            Edit Credit
          </Button>
          <Button 
            onClick={() => router.push('/finance/tuition-credits/credits')}
            variant="secondary"
          >
            Back to Credits
          </Button>
        </div>
      </div>

      {selectedTuitionCredit && (
        <>
          {selectedTuitionCredit.creditStatus === TuitionCreditStatus.REJECTED && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Credit Rejected</AlertTitle>
              <AlertDescription>
                This credit was rejected. Reason: {selectedTuitionCredit.rejectionReason || 'No reason provided'}
              </AlertDescription>
            </Alert>
          )}
          
          {selectedTuitionCredit.isAdjustment && (
            <Alert className="mb-6">
              <AlertTitle>Adjustment Credit</AlertTitle>
              <AlertDescription>
                This is an adjustment credit for original credit ID: {selectedTuitionCredit.originalCreditId}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tuition Credit Information</CardTitle>
              <CardDescription>Details of the tuition credit</CardDescription>
            </CardHeader>
            <CardContent>
              <TuitionCreditDetail 
              creditId={creditId} 
              credit={selectedTuitionCredit} 
              provider={selectedProvider} 
            />
            </CardContent>
            {selectedTuitionCredit.creditStatus === TuitionCreditStatus.PENDING_APPROVAL && (
              <CardFooter className="flex justify-end gap-2">
                <Button variant="destructive" onClick={handleReject}>
                  Reject Credit
                </Button>
                <Button onClick={handleApprove}>
                  Approve Credit
                </Button>
              </CardFooter>
            )}
          </Card>
        </>
      )}

      {tuitionCreditsLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}