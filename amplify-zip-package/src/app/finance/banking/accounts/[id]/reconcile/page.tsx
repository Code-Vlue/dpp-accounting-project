// /workspace/DPP-Project/src/app/finance/banking/accounts/[id]/reconcile/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { ReconciliationForm } from '@/components/finance/bank-reconciliation';

interface ReconcileAccountPageProps {
  params: {
    id: string;
  };
}

export default function ReconcileAccountPage({ params }: ReconcileAccountPageProps) {
  const router = useRouter();
  
  const handleCancel = () => {
    router.push(`/finance/banking/accounts/${params.id}`);
  };
  
  const handleSuccess = (reconciliationId: string) => {
    router.push(`/finance/banking/reconciliations/${reconciliationId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Start New Reconciliation</h1>
      
      <ReconciliationForm 
        bankAccountId={params.id}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
