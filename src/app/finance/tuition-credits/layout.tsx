// src/app/finance/tuition-credits/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function TuitionCreditsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/finance/tuition-credits' },
    { name: 'Providers', href: '/finance/tuition-credits/providers' },
    { name: 'Credits', href: '/finance/tuition-credits/credits' },
    { name: 'Batches', href: '/finance/tuition-credits/batches' },
    { name: 'Payments', href: '/finance/tuition-credits/payments' },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="border-b">
        <nav className="flex items-center space-x-4 pb-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md hover:text-primary hover:bg-muted whitespace-nowrap",
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div>
        {children}
      </div>
    </div>
  );
}