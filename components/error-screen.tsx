'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { RotateCw } from 'lucide-react';

import { fontMono } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import logo from '@/app/icon.svg';

export interface ErrorScreenProps {
  error: Error & { digest?: string };
  reset: () => void;

  showLogo?: boolean;
  fullscreen?: boolean;
}

export default function ErrorScreen({
  error,
  reset,
  showLogo = true,
  fullscreen = false,
}: ErrorScreenProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const timer = setTimeout(reset, 2000);

    return () => clearTimeout(timer);
  }, [reset]);

  const isDbConnectionError = error.name === 'VersionRetrievalFailure';

  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-5',
        fullscreen && 'min-h-screen'
      )}
    >
      {showLogo && (
        <div className="flex items-center space-x-2">
          <Image src={logo} width={64} height={64} alt="Logo ALO" />
          <span className="inline-block font-bold">ALObirynt</span>
        </div>
      )}

      <h2>
        {isDbConnectionError
          ? 'Nie udało się połączyć z bazą danych!'
          : 'Coś poszło nie tak!'}
      </h2>

      <Button onClick={() => reset()}>
        <RotateCw />
        Spróbuj ponownie
      </Button>

      <code className={cn('text-center font-mono', fontMono.variable)}>
        {JSON.stringify(error, null, 2)}
      </code>
    </div>
  );
}
