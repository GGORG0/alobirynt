'use client';

import type { Metadata, Viewport } from 'next';
import Image from 'next/image';

import './globals.css';

import { useEffect } from 'react';
import { RotateCw } from 'lucide-react';

import { fontMono, fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/components/theme-provider';
import logo from '@/app/icon.svg';

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
  useEffect(() => {
    console.error(error);
  }, [error]);

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
          <div className="flex min-h-screen flex-col items-center justify-center gap-5">
            <div className="flex items-center space-x-2">
              <Image src={logo} width={64} height={64} alt="Logo ALO" />
              <span className="inline-block font-bold">ALObirynt</span>
            </div>
            <h2>Coś poszło nie tak!</h2>
            <Button onClick={() => reset()}>
              <RotateCw />
              Spróbuj ponownie
            </Button>
            <code className={cn('text-center font-mono', fontMono.variable)}>
              {JSON.stringify(error, null, 2)}
            </code>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
