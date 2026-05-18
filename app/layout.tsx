import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShuleYetu - Taarifa za Shule Tanzania',
  description:
    'Tafuta shule, matokeo ya NECTA, uchaguzi wa wanafunzi, mchanganyiko wa A-Level, na vyuo vya Tanzania.',
  keywords: [
    'shule Tanzania',
    'NECTA',
    'matokeo',
    'CSEE',
    'ACSEE',
    'PSLE',
    'uchaguzi',
    'mchanganyiko',
    'vyuo',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sw">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
