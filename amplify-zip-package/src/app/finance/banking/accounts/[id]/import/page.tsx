// /workspace/DPP-Project/src/app/finance/banking/accounts/[id]/import/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { ImportTransactionsForm } from '@/components/finance/bank-reconciliation';

interface ImportTransactionsPageProps {
  params: {
    id: string;
  };
}

export default function ImportTransactionsPage({ params }: ImportTransactionsPageProps) {
  const router = useRouter();
  
  const handleCancel = () => {
    router.push(`/finance/banking/accounts/${params.id}`);
  };
  
  const handleSuccess = () => {
    router.push(`/finance/banking/accounts/${params.id}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Import Bank Transactions</h1>
      
      <ImportTransactionsForm 
        bankAccountId={params.id}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
