import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rajashree Fashions - Admin Dashboard',
  description: 'Admin dashboard for Rajashree Fashions',
  icons: {
    icon: [
      { url: '/logo-peacock.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/logo-peacock.png',
    apple: '/logo-peacock.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            {children}
            <Toaster position="top-right" richColors />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
