import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// One client shared by all tests: Biome forbids declaring the wrapper component inside a
// factory function. Call `resetTestQueryClient` in `beforeEach` so no data leaks between tests.
// `retry: false` makes a failed request show up as an error immediately.
export const testQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

export function resetTestQueryClient() {
  testQueryClient.clear();
}

export function QueryWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}
