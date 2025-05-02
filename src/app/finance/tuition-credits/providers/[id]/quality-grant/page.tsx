// src/app/finance/tuition-credits/providers/[id]/quality-grant/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { QualityImprovementGrantForm } from '@/components/finance/providers/QualityImprovementGrantForm';

export default function ProviderQualityGrantPage() {
  const params = useParams<{ id: string }>();
  const providerId = params.id;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quality Improvement Grant</h1>
      </div>
      
      <QualityImprovementGrantForm providerId={providerId} />
    </div>
  );
}