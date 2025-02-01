import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { cn } from '@/utils/shadcn';

const font = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TrendWatch | Najpopulárnejšie YouTube videá',
  description:
    'Objavte najpopulárnejšie YouTube videá z celého sveta. Sledujte trendy videá z rôznych krajín v reálnom čase.',
  keywords: [
    'YouTube trendy',
    'trending videá',
    'populárne videá',
    'YouTube prieskumník',
    'video trendy',
  ],
  authors: [{ name: 'TrendWatch' }],
  category: 'Technology',
  robots: 'index, follow',
  openGraph: {
    title: 'TrendWatch | Najpopulárnejšie YouTube videá',
    description: 'Objavte najpopulárnejšie YouTube videá z celého sveta',
    type: 'website',
    locale: 'sk_SK',
    siteName: 'TrendWatch',
    images: [
      {
        url: 'https://static.storage.quickbiteschronicles.com/trendwatch-social.jpg',
        width: 1376,
        height: 768,
        alt: 'TrendWatch | Najpopulárnejšie YouTube videá',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrendWatch | YouTube Trendy',
    description: 'Objavte najpopulárnejšie YouTube videá z celého sveta',
    images: [
      'https://static.storage.quickbiteschronicles.com/trendwatch-social.jpg',
    ],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          font.variable,
          'bg-background min-h-screen font-sans antialiased'
        )}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
