import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { CartProvider } from '@/context/cart-context';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Catálogo Mayorista',
  description: 'Catálogo de productos mayorista con sistema de pedidos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster position="top-right" />
        <SpeedInsights />
      </body>
    </html>
  );
}