// src/app/finance/accounts-payable/vendors/new/page.tsx
import VendorForm from '@/components/finance/accounts-payable/VendorForm';

export default function NewVendorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add New Vendor</h1>
      <VendorForm />
    </div>
  );
}