import type { Metadata, Viewport } from 'next';

import './globals.css';

import { Toaster } from 'sonner';

import { fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import DefaultQueryClientProvider from '@/hooks/default-query-client-provider';
import { SurrealProvider } from '@/hooks/surreal-provider';
import { SiteHeader } from '@/components/site-header';
import SurrealErrorBubbler from '@/components/surreal-error-bubbler';
import { SurrealIndicator } from '@/components/surreal-indicator';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const metadata: Metadata = {
  title: {
    template: '%s | ALObirynt',
    default: 'ALObirynt',
  },
  description: 'Gra matematyczna dni otwartych ALO PWr',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <DefaultQueryClientProvider>
            <SurrealProvider
              endpoint={
                process.env.NEXT_PUBLIC_SURREALDB_ENDPOINT ??
                'ws://localhost:8000/rpc'
              }
              params={{
                namespace: process.env.NEXT_PUBLIC_SURREALDB_NAMESPACE,
                database: process.env.NEXT_PUBLIC_SURREALDB_DATABASE,
                reconnect: true,
              }}
              autoConnect
            >
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex flex-1">{children}</main>
              </div>
              <Toaster />
              <TailwindIndicator />
              <SurrealIndicator />
              <SurrealErrorBubbler />
            </SurrealProvider>
          </DefaultQueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
