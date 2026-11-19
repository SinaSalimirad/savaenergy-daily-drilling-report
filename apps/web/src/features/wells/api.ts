import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type WellsListParams, wellKeys } from "./query-keys";

async function fetchWells(params: WellsListParams) {
  const result = await api.wells.get({
    // The API reads the flag from the URL, where every value is text.
    query: {
      page: params.page,
      pageSize: params.pageSize,
      project_id: params.projectId,
    },
  });
  return unwrap(result);
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type WellsPage = Awaited<ReturnType<typeof fetchWells>>;
export type Well = WellsPage["data"][number];
export type CreateWellBody = Parameters<typeof api.wells.post>[0];
export type UpdateWellBody = NonNullable<
  Parameters<ReturnType<typeof api.wells>["patch"]>[0]
>;

export function wellsQueryOptions(params: WellsListParams) {
  return queryOptions({
    queryKey: wellKeys.list(params),
    queryFn: () => fetchWells(params),
    // Keep showing the old page while the next one loads, so the table does not flash empty.
    placeholderData: keepPreviousData,
  });
}

export function useWells(params: WellsListParams) {
  return useQuery(wellsQueryOptions(params));
}

// Every mutation refreshes all well lists: a change can move a row to another page and change
// the totals, so refreshing one list is not enough.
// Projects are refreshed too, because their status is derived from their wells.
function useWellMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: wellKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
      ]),
  });
}

export function useCreateWell() {
  return useWellMutation(async (body: CreateWellBody) =>
    unwrap(await api.wells.post(body)),
  );
}

export function useUpdateWell() {
  return useWellMutation(
    async ({ id, body }: { id: string; body: UpdateWellBody }) =>
      unwrap(await api.wells({ id }).patch(body)),
  );
}

export function useDeleteWell() {
  return useWellMutation(async (id: string) =>
    ensureOk(await api.wells({ id }).delete()),
  );
}
