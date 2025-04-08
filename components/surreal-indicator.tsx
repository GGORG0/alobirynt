'use client';

import { useSurreal } from '@/hooks/surreal-provider';

export default function SurrealIndicator() {
  if (process.env.NODE_ENV === 'production') return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isConnecting, isSuccess, isError } = useSurreal();

  return (
    <div className="fixed right-1 bottom-1 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white">
      {isConnecting && <div className="block animate-pulse">...</div>}
      {isSuccess && <div className="block">✓</div>}
      {isError && <div className="block">✗</div>}
    </div>
  );
}
