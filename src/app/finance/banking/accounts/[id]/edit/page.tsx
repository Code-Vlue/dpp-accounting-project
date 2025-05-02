// /workspace/DPP-Project/src/app/finance/banking/accounts/[id]/edit/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { BankAccountForm } from '@/components/finance/bank-reconciliation';

interface EditBankAccountPageProps {
  params: {
    id: string;
  };
}

export default function EditBankAccountPage({ params }: EditBankAccountPageProps) {
  const router = useRouter();
  
  const handleCancel = () => {
    router.back();
  };
  
  const handleSuccess = () => {
    router.push(`/finance/banking/accounts/${params.id}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Bank Account</h1>
      
      <BankAccountForm 
        bankAccountId={params.id}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
