'use client';

import { useEffect } from 'react';
import { RotateCw } from 'lucide-react';

import { fontMono } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Error({
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
    <div className="flex flex-1 flex-col items-center justify-center gap-5">
      <h2>Coś poszło nie tak!</h2>
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
