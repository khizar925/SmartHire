'use client';

import { useEffect, useRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth } from '@clerk/nextjs';
import { queryClient } from '@/lib/query-client';
import { TooltipProvider } from '@/components/ui/tooltip';

// Clears stale cache when user signs out so a different account never sees old data
function CacheClearer() {
  const { userId } = useAuth();
  const prevRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (prevRef.current !== undefined && prevRef.current !== null && !userId) {
      queryClient.clear();
    }
    prevRef.current = userId ?? null;
  }, [userId]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <CacheClearer />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
