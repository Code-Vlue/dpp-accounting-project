// src/app/finance/accounts-payable/vendors/[id]/page.tsx
import VendorDetail from '@/components/finance/accounts-payable/VendorDetail';

export default function VendorDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="space-y-6">
      <VendorDetail vendorId={params.id} />
    </div>
  );
}