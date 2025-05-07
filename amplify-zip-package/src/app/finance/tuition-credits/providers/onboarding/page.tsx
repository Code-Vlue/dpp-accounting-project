// src/app/finance/tuition-credits/providers/onboarding/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderForm } from '@/components/finance/tuition-credits';

export default function ProviderOnboardingPage() {
  const router = useRouter();

  const handleSubmit = async (providerData: any) => {
    // This function will be passed to the ProviderForm component
    // In a real implementation, we would do something with the providerData
    console.log('Provider data submitted:', providerData);
    
    // Redirect to the providers list after submission
    router.push('/finance/tuition-credits/providers');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provider Onboarding</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Onboarding Wizard</CardTitle>
          <CardDescription>Follow the steps to onboard a new provider into the system</CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderForm isOnboarding={true} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}