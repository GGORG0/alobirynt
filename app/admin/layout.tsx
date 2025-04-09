import { Toaster } from 'sonner';

import DefaultQueryClientProvider from '@/hooks/default-query-client-provider';
import { SurrealProvider } from '@/hooks/surreal-provider';
import SiteHeader from '@/components/site-header';
import SurrealErrorBubbler from '@/components/surreal-error-bubbler';
import SurrealIndicator from '@/components/surreal-indicator';
import TailwindIndicator from '@/components/tailwind-indicator';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
        adminAutoLogIn
      >
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>

        <Toaster />

        <TailwindIndicator />
        <SurrealIndicator />

        <SurrealErrorBubbler />
      </SurrealProvider>
    </DefaultQueryClientProvider>
  );
}
