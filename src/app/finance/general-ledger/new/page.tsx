// src/app/finance/general-ledger/new/page.tsx
'use client';

import React from 'react';
import JournalEntryForm from '@/components/finance/general-ledger/JournalEntryForm';

export default function NewJournalEntryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-blue">New Journal Entry</h1>
      <JournalEntryForm />
    </div>
  );
}