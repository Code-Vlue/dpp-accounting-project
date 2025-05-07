// src/app/finance/tuition-credits/credits/[id]/edit/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';
import { TuitionCreditForm } from '@/components/finance/tuition-credits';
import { TuitionCreditStatus } from '@/types/finance';

export default function EditTuitionCreditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const creditId = params.id;
  
  const { 
    selectedTuitionCredit,
    providers,
    fetchTuitionCreditById,
    fetchProviders,
    updateTuitionCredit,
    updateTuitionCreditDraft,
    tuitionCreditDraft,
    resetTuitionCreditDraft,
    tuitionCreditsLoading,
    providersLoading
  } = useFinanceStore();

  useEffect(() => {
    if (creditId) {
      fetchTuitionCreditById(creditId);
      fetchProviders();
    }
  }, [creditId, fetchTuitionCreditById, fetchProviders]);

  useEffect(() => {
    if (selectedTuitionCredit) {
      // Initialize the draft with the selected credit data
      resetTuitionCreditDraft();
      
      // Update each field individually to match the function signature
      const fields = [
        { name: 'providerId', value: selectedTuitionCredit.providerId },
        { name: 'studentId', value: selectedTuitionCredit.studentId },
        { name: 'studentName', value: selectedTuitionCredit.studentName },
        { name: 'creditPeriodStart', value: selectedTuitionCredit.creditPeriodStart },
        { name: 'creditPeriodEnd', value: selectedTuitionCredit.creditPeriodEnd },
        { name: 'creditAmount', value: selectedTuitionCredit.creditAmount },
        { name: 'familyPortion', value: selectedTuitionCredit.familyPortion },
        { name: 'dppPortion', value: selectedTuitionCredit.dppPortion },
        { name: 'description', value: selectedTuitionCredit.description },
        { name: 'notes', value: selectedTuitionCredit.reference || '' }
      ];
      
      // Update each field
      fields.forEach(field => {
        updateTuitionCreditDraft(field.name, field.value);
      });
    }
  }, [selectedTuitionCredit, resetTuitionCreditDraft, updateTuitionCreditDraft]);

  const handleSubmit = async () => {
    try {
      if (selectedTuitionCredit && tuitionCreditDraft) {
        await updateTuitionCredit(creditId, {
          providerId: tuitionCreditDraft.providerId,
          studentId: tuitionCreditDraft.studentId,
          studentName: tuitionCreditDraft.studentName,
          creditPeriodStart: tuitionCreditDraft.creditPeriodStart,
          creditPeriodEnd: tuitionCreditDraft.creditPeriodEnd,
          creditAmount: tuitionCreditDraft.creditAmount,
          familyPortion: tuitionCreditDraft.familyPortion,
          dppPortion: tuitionCreditDraft.dppPortion,
          description: tuitionCreditDraft.description,
          // Use notes to update the reference field in the backend
          reference: tuitionCreditDraft.notes,
        });
        router.push(`/finance/tuition-credits/credits/${creditId}`);
      }
    } catch (error) {
      console.error('Failed to update tuition credit:', error);
    }
  };

  const isEditable = selectedTuitionCredit?.creditStatus === TuitionCreditStatus.DRAFT;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Tuition Credit</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/finance/tuition-credits/credits/${creditId}`)}
        >
          Cancel
        </Button>
      </div>

      {!isEditable && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">Notice</p>
          <p>This credit cannot be edited because it has already been processed or approved.</p>
        </div>
      )}

      {selectedTuitionCredit && (
        <Card>
          <CardHeader>
            <CardTitle>Tuition Credit Information</CardTitle>
            <CardDescription>Update the tuition credit details</CardDescription>
          </CardHeader>
          <CardContent>
            <TuitionCreditForm 
              providers={providers}
              tuitionCreditDraft={tuitionCreditDraft}
              onUpdate={updateTuitionCreditDraft}
              onSubmit={handleSubmit}
              loading={tuitionCreditsLoading || providersLoading}
              readOnly={!isEditable}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}