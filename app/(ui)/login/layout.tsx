'use client';

import { useSurreal } from '@/hooks/surreal-provider';
import { Spinner } from '@/components/ui/spinner';

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isConnecting, isSuccess } = useSurreal();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      {isConnecting ? <Spinner /> : isSuccess && <>{children}</>}
    </div>
  );
}
