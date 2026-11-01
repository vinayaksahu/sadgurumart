import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0b2b1e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning className="overflow-x-hidden max-w-full">
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#d4a359] selection:text-[#0b2b1e] overflow-x-hidden w-full max-w-full">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
