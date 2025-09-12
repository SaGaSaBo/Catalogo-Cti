import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo CTI',
  description: 'Catálogo mayorista - Sistema de gestión de productos',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}