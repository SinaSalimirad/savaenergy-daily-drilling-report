import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type SectionsListParams, sectionKeys } from "./query-keys";

async function fetchSections(params: SectionsListParams) {
  return unwrap(await api.sections.get({ query: params }));
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type SectionsPage = Awaited<ReturnType<typeof fetchSections>>;
export type Section = SectionsPage["data"][number];
export type CreateSectionBody = Parameters<typeof api.sections.post>[0];
export type UpdateSectionBody = NonNullable<
  Parameters<ReturnType<typeof api.sections>["patch"]>[0]
>;

export function sectionsQueryOptions(params: SectionsListParams) {
  return queryOptions({
    queryKey: sectionKeys.list(params),
    queryFn: () => fetchSections(params),
    // Keep showing the old page while the next one loads, so the table does not flash empty.
    placeholderData: keepPreviousData,
  });
}

export function useSections(params: SectionsListParams) {
  return useQuery(sectionsQueryOptions(params));
}

// Every mutation refreshes all section lists: a change can move a row to another page and
// change the totals, so refreshing one list is not enough.
function useSectionMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sectionKeys.all }),
  });
}

export function useCreateSection() {
  return useSectionMutation(async (body: CreateSectionBody) =>
    unwrap(await api.sections.post(body)),
  );
}

export function useUpdateSection() {
  return useSectionMutation(
    async ({ id, body }: { id: string; body: UpdateSectionBody }) =>
      unwrap(await api.sections({ id }).patch(body)),
  );
}

export function useDeleteSection() {
  return useSectionMutation(async (id: string) =>
    ensureOk(await api.sections({ id }).delete()),
  );
}

// The API shifts the sections in between, so the whole list is refreshed afterwards.
export function useMoveSection() {
  return useSectionMutation(
    async ({ id, toOrder }: { id: string; toOrder: number }) =>
      unwrap(await api.sections({ id }).move.post({ to_order: toOrder })),
  );
}
