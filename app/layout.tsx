import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Patient Conversion Scorecard',
  description: 'Professional phone call scoring for dental practices',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
