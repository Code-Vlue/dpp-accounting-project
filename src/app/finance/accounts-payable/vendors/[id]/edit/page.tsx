// src/app/finance/accounts-payable/vendors/[id]/edit/page.tsx
import VendorForm from '@/components/finance/accounts-payable/VendorForm';

export default function EditVendorPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Vendor</h1>
      <VendorForm vendorId={params.id} isEdit={true} />
    </div>
  );
}