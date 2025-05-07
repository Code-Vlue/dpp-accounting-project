// src/app/finance/tuition-credits/providers/new/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';
import { ProviderForm } from '@/components/finance/tuition-credits';

export default function NewProviderPage() {
  const router = useRouter();
  const { createProvider } = useFinanceStore();

  const handleSubmit = async (providerData: any) => {
    try {
      await createProvider({
        ...providerData,
        isProvider: true,
      });
      router.push('/finance/tuition-credits/providers');
    } catch (error) {
      console.error('Failed to create provider:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add New Provider</h1>
        <Button variant="outline" onClick={() => router.push('/finance/tuition-credits/providers')}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Information</CardTitle>
          <CardDescription>Enter the details for the new provider</CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}