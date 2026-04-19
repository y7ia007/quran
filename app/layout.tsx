import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import NavBar from '@/components/NavBar';
import './globals.css';

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'القرآن الكريم',
  description: 'اقرأ وتدبّر القرآن الكريم مع مساعد التفسير',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlex.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full antialiased bg-[#EEEAE3] text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
