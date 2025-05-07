// src/app/finance/accounts-receivable/invoices/[id]/page.tsx
'use client';

import InvoiceDetail from '@/components/finance/accounts-receivable/InvoiceDetail';

interface InvoiceDetailPageProps {
  params: {
    id: string;
  };
}

const InvoiceDetailPage = ({ params }: InvoiceDetailPageProps) => {
  return <InvoiceDetail invoiceId={params.id} />;
};

export default InvoiceDetailPage;