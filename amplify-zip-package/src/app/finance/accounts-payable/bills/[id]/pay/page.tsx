// src/app/finance/accounts-payable/bills/[id]/pay/page.tsx
import PaymentForm from '@/components/finance/accounts-payable/PaymentForm';

export default function PayBillPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Make Payment</h1>
      <PaymentForm billId={params.id} />
    </div>
  );
}