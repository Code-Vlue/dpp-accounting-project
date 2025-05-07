// src/app/finance/accounts-receivable/customers/[id]/page.tsx
'use client';

import CustomerDetail from '@/components/finance/accounts-receivable/CustomerDetail';

interface CustomerDetailPageProps {
  params: {
    id: string;
  };
}

const CustomerDetailPage = ({ params }: CustomerDetailPageProps) => {
  return <CustomerDetail customerId={params.id} />;
};

export default CustomerDetailPage;