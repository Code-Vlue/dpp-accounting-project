// /workspace/DPP-Project/src/app/finance/banking/reconciliations/[id]/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { ReconciliationDetail } from '@/components/finance/bank-reconciliation';

interface ReconciliationDetailPageProps {
  params: {
    id: string;
  };
}

export default function ReconciliationDetailPage({ params }: ReconciliationDetailPageProps) {
  const router = useRouter();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => router.push('/finance/banking/reconciliations')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Reconciliations
        </button>
      </div>
      
      <ReconciliationDetail reconciliationId={params.id} />
    </div>
  );
}
