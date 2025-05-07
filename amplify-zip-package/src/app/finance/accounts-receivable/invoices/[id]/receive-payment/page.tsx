// src/app/finance/accounts-receivable/invoices/[id]/receive-payment/page.tsx
'use client';

import PaymentForm from '@/components/finance/accounts-receivable/PaymentForm';

interface ReceivePaymentPageProps {
  params: {
    id: string;
  };
}

const ReceivePaymentPage = ({ params }: ReceivePaymentPageProps) => {
  return <PaymentForm invoiceId={params.id} />;
};

export default ReceivePaymentPage;