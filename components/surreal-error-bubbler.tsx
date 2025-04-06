'use client';

import { useEffect } from 'react';

import { useSurreal } from '@/hooks/surreal-provider';

export default function SurrealErrorBubbler() {
  const { isError, error } = useSurreal();

  useEffect(() => {
    if (isError) {
      throw error;
    }
  }, [isError, error]);

  return <></>;
}
