'use client';

import type { Metadata, Viewport } from 'next';

import './globals.css';

import { fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import ErrorScreen from '@/components/error-screen';
import ThemeProvider from '@/components/theme-provider';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const metadata: Metadata = {
  title: 'Błąd | ALObirynt',
  description: 'Gra matematyczna dni otwartych ALO PWr',
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        className={cn('min-h-screen font-sans antialiased', fontSans.variable)}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorScreen error={error} reset={reset} fullscreen showLogo />
        </ThemeProvider>
      </body>
    </html>
  );
}
