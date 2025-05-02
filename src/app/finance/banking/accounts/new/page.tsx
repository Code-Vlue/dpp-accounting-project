// /workspace/DPP-Project/src/app/finance/banking/accounts/new/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { BankAccountForm } from '@/components/finance/bank-reconciliation';

export default function NewBankAccountPage() {
  const router = useRouter();
  
  const handleCancel = () => {
    router.back();
  };
  
  const handleSuccess = () => {
    router.push('/finance/banking/accounts');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Add Bank Account</h1>
      
      <BankAccountForm 
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
