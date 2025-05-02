// src/app/finance/chart-of-accounts/new/page.tsx
'use client';

import React from 'react';
import AccountForm from '@/components/finance/chart-of-accounts/AccountForm';

export default function NewAccountPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">Create New Account</h1>
      <AccountForm />
    </div>
  );
}