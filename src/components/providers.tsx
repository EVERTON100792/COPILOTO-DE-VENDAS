"use client";

import { StoreProvider } from "@/lib/store-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { Shell } from "@/components/layout/shell";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <Shell>{children}</Shell>
        <Toaster richColors position="top-right" />
      </StoreProvider>
    </QueryClientProvider>
  );
}