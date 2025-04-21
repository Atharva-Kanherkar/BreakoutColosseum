'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header'; // Adjust path if necessary
import React from 'react';

// Define paths where the main Header (including wallet button) should NOT be shown
const pathsWithoutHeader = ['/', '/signin', '/signup']; // Updated array

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if the current path is one of the paths where the header should be hidden
  const hideHeader = pathsWithoutHeader.includes(pathname);

  return (
    <>
      {/* Conditionally render Header based on the path */}
      {!hideHeader && <Header />}
      {/* Render the actual page content */}
      {children}
    </>
  );
}