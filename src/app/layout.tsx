import './globals.css';
import AppChrome from '@/components/layout/AppChrome';

export const metadata = {
  title: 'Shree Sai Borewell & JCB | Equipment Rental & Borewell Services',
  description: 'Pro equipment rental and borewell support across Madhya Pradesh.',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#FFD700',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import ToasterProvider from '@/components/providers/ToasterProvider';
import { LanguageProvider } from '@/lib/LanguageContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToasterProvider />
        <LanguageProvider>
          <AppChrome>{children}</AppChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
