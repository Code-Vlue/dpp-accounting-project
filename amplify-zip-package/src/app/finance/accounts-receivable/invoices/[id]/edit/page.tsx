// src/app/finance/accounts-receivable/invoices/[id]/edit/page.tsx
'use client';

import InvoiceForm from '@/components/finance/accounts-receivable/InvoiceForm';

interface EditInvoicePageProps {
  params: {
    id: string;
  };
}

const EditInvoicePage = ({ params }: EditInvoicePageProps) => {
  return <InvoiceForm invoiceId={params.id} />;
};

export default EditInvoicePage;