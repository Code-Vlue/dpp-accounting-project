// /workspace/DPP-Project/src/app/finance/banking/layout.tsx
import React from 'react';
export default function BankingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
