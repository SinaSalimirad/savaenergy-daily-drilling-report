import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type SceListParams, sceKeys } from "./query-keys";

async function fetchSce(params: SceListParams) {
  return unwrap(await api["solid-control"].get({ query: params }));
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type ScePage = Awaited<ReturnType<typeof fetchSce>>;
export type Sce = ScePage["data"][number];
export type CreateSceBody = Parameters<
  (typeof api)["solid-control"]["post"]
>[0];
export type UpdateSceBody = NonNullable<
  Parameters<ReturnType<(typeof api)["solid-control"]>["patch"]>[0]
>;

export function sceQueryOptions(params: SceListParams) {
  return queryOptions({
    queryKey: sceKeys.list(params),
    queryFn: () => fetchSce(params),
    // Keep showing the old page while the next one loads, so the table does not flash empty.
    placeholderData: keepPreviousData,
  });
}

export function useSce(params: SceListParams) {
  return useQuery(sceQueryOptions(params));
}

// Every mutation refreshes all lists: a change can move a row to another page and change the
// totals, so refreshing one list is not enough.
function useSceMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sceKeys.all }),
  });
}

export function useCreateSce() {
  return useSceMutation(async (body: CreateSceBody) =>
    unwrap(await api["solid-control"].post(body)),
  );
}

export function useUpdateSce() {
  return useSceMutation(
    async ({ id, body }: { id: string; body: UpdateSceBody }) =>
      unwrap(await api["solid-control"]({ id }).patch(body)),
  );
}

export function useDeleteSce() {
  return useSceMutation(async (id: string) =>
    ensureOk(await api["solid-control"]({ id }).delete()),
  );
}
