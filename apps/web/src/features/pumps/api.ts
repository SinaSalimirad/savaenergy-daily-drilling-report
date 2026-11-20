import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type PumpsListParams, pumpKeys } from "./query-keys";

async function fetchPumps(params: PumpsListParams) {
  return unwrap(await api.pumps.get({ query: params }));
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type PumpsPage = Awaited<ReturnType<typeof fetchPumps>>;
export type Pump = PumpsPage["data"][number];
export type CreatePumpBody = Parameters<typeof api.pumps.post>[0];
export type UpdatePumpBody = NonNullable<
  Parameters<ReturnType<typeof api.pumps>["patch"]>[0]
>;

export function pumpsQueryOptions(params: PumpsListParams) {
  return queryOptions({
    queryKey: pumpKeys.list(params),
    queryFn: () => fetchPumps(params),
    // Keep showing the old page while the next one loads, so the table does not flash empty.
    placeholderData: keepPreviousData,
  });
}

export function usePumps(params: PumpsListParams) {
  return useQuery(pumpsQueryOptions(params));
}

// Every mutation refreshes all pump lists: a change can move a row to another page and
// change the totals, so refreshing one list is not enough.
function usePumpMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pumpKeys.all }),
  });
}

export function useCreatePump() {
  return usePumpMutation(async (body: CreatePumpBody) =>
    unwrap(await api.pumps.post(body)),
  );
}

export function useUpdatePump() {
  return usePumpMutation(
    async ({ id, body }: { id: string; body: UpdatePumpBody }) =>
      unwrap(await api.pumps({ id }).patch(body)),
  );
}

export function useDeletePump() {
  return usePumpMutation(async (id: string) =>
    ensureOk(await api.pumps({ id }).delete()),
  );
}
