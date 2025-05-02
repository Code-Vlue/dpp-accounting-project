// src/app/finance/accounts-payable/bills/new/page.tsx
import BillForm from '@/components/finance/accounts-payable/BillForm';

export default function NewBillPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Bill</h1>
      <BillForm />
    </div>
  );
}