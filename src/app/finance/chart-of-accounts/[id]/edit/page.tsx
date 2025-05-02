// src/app/finance/chart-of-accounts/[id]/edit/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AccountForm from '@/components/finance/chart-of-accounts/AccountForm';

export default function EditAccountPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Edit Account</h1>
      <AccountForm accountId={id} isEditing={true} />
    </div>
  );
}