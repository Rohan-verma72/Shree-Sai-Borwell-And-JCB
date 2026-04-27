'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed', err));
      });
    }
  }, []);

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <div style={{ minHeight: '100vh', paddingTop: isAdminRoute ? 0 : '80px' }}>{children}</div>
      {!isAdminRoute && <Footer />}
    </>
  );
}
