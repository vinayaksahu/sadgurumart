import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cartContext';

export const metadata: Metadata = {
  title: 'SGM Mart | Business Overview & Online Shopping',
  description: 'SGM Mart - High Quality Consumer Essentials & 16-Income Direct Selling Business Opportunity.',
  icons: {
    icon: [
      { url: '/icon.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-gold-500 selection:text-forest-900">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
