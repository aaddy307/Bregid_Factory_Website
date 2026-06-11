import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bregid Factory — Manufacturing Execution System',
  description: 'Manufacturing dashboard for Bregid Factory leather footwear',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-on-surface min-h-screen">
        {children}
      </body>
    </html>
  );
}
