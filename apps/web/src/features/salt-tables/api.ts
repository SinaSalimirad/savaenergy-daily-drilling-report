import { queryOptions, useQuery } from "@tanstack/react-query";
import type { SaltType } from "schema";
import { api } from "@/lib/api-client";
import { unwrap } from "@/lib/api-error";
import { saltTableKeys } from "./query-keys";

async function fetchSaltTable(saltType: SaltType) {
  return unwrap(
    await api["salt-tables"].get({ query: { salt_type: saltType } }),
  );
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type SaltTableResponse = Awaited<ReturnType<typeof fetchSaltTable>>;
export type SaltTableRow = SaltTableResponse["data"][number];

export function saltTableQueryOptions(saltType: SaltType) {
  return queryOptions({
    queryKey: saltTableKeys.list(saltType),
    queryFn: () => fetchSaltTable(saltType),
    // Reference data: it never changes while the app is open.
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSaltTable(saltType: SaltType) {
  return useQuery(saltTableQueryOptions(saltType));
}
