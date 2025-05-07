// src/app/finance/accounts-payable/bills/[id]/page.tsx
import BillDetail from '@/components/finance/accounts-payable/BillDetail';

export default function BillDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="space-y-6">
      <BillDetail billId={params.id} />
    </div>
  );
}