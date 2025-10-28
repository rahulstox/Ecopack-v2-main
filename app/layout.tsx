import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs'; // <-- Import ClerkProvider
export const metadata: Metadata = {
  title: 'EcoPack AI – Greener Packaging, Smarter Choices',
  description: 'AI that helps brands reduce waste and cut carbon impact.',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider> {/* <--ClerkProvider */}
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
    </ClerkProvider> 
  );
}

