// src/app/finance/tuition-credits/providers/[id]/tax-information/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProviderTaxInformationForm } from '@/components/finance/providers/ProviderTaxInformationForm';

export default function ProviderTaxInformationPage() {
  const params = useParams<{ id: string }>();
  const providerId = params.id;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provider Tax Information</h1>
      </div>
      
      <ProviderTaxInformationForm providerId={providerId} />
    </div>
  );
}