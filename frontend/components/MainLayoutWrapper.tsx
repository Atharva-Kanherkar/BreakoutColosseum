'use client'; // This component CAN be a client component

import { usePathname } from 'next/navigation';
import Header from '@/components/Header'; // Adjust path if necessary
import React from 'react';

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Conditionally render Header based on pathname */}
      {pathname !== '/' && <Header />}
      {/* Render the actual page content */}
      {children}
    </>
  );
}