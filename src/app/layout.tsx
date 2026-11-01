import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SGM Mart | Business Overview & Online Shopping',
  description: 'SGM Mart - High Quality Consumer Essentials & 16-Income Direct Selling Business Opportunity.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-gold-500 selection:text-forest-900">
        {children}
      </body>
    </html>
  );
}
