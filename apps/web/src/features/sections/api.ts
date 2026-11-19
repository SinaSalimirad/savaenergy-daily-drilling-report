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

// The sections of one well, for forms that must pick a section of the chosen well. Nothing is
// requested until a well is chosen: without `well_id` the API would list every section.
const WELL_SECTIONS_LIMIT = 100;

export function useWellSections(wellId: string) {
  return useQuery({
    ...sectionsQueryOptions({
      page: 1,
      pageSize: WELL_SECTIONS_LIMIT,
      well_id: wellId,
    }),
    enabled: wellId !== "",
  });
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
