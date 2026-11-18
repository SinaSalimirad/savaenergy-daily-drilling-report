"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Created in state, so each browser session has its own cache and a re-render never resets it.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000 } },
        // One place for "an action failed" toasts, so no button needs its own onError.
        mutationCache: new MutationCache({
          onError: (error) =>
            toast.add({
              type: "error",
              title: "Action failed",
              description: error.message,
            }),
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
