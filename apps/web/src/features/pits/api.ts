import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type PitsListParams, pitKeys } from "./query-keys";

async function fetchPits(params: PitsListParams) {
  return unwrap(await api.pits.get({ query: params }));
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type PitsPage = Awaited<ReturnType<typeof fetchPits>>;
export type Pit = PitsPage["data"][number];
export type CreatePitBody = Parameters<typeof api.pits.post>[0];
export type UpdatePitBody = NonNullable<
  Parameters<ReturnType<typeof api.pits>["patch"]>[0]
>;

export function pitsQueryOptions(params: PitsListParams) {
  return queryOptions({
    queryKey: pitKeys.list(params),
    queryFn: () => fetchPits(params),
    // Keep showing the old page while the next one loads, so the table does not flash empty.
    placeholderData: keepPreviousData,
  });
}

export function usePits(params: PitsListParams) {
  return useQuery(pitsQueryOptions(params));
}

// Every mutation refreshes all pit lists: a change can move a row to another page and
// change the totals, so refreshing one list is not enough.
function usePitMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pitKeys.all }),
  });
}

export function useCreatePit() {
  return usePitMutation(async (body: CreatePitBody) =>
    unwrap(await api.pits.post(body)),
  );
}

export function useUpdatePit() {
  return usePitMutation(
    async ({ id, body }: { id: string; body: UpdatePitBody }) =>
      unwrap(await api.pits({ id }).patch(body)),
  );
}

export function useDeletePit() {
  return usePitMutation(async (id: string) =>
    ensureOk(await api.pits({ id }).delete()),
  );
}
