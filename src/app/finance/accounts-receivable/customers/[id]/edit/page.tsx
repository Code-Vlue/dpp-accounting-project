// src/app/finance/accounts-receivable/customers/[id]/edit/page.tsx
'use client';

import CustomerForm from '@/components/finance/accounts-receivable/CustomerForm';

interface EditCustomerPageProps {
  params: {
    id: string;
  };
}

const EditCustomerPage = ({ params }: EditCustomerPageProps) => {
  return <CustomerForm customerId={params.id} />;
};

export default EditCustomerPage;