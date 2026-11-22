import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { pitReadingKeys } from "./query-keys";

async function fetchPitReadings(reportId: string) {
  return unwrap(
    await api["pit-readings"].get({ query: { report_id: reportId } }),
  );
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
// The tonnage is computed by the server; the web only displays it.
export type PitReadingsResponse = Awaited<ReturnType<typeof fetchPitReadings>>;
export type PitReading = PitReadingsResponse["data"][number];
export type CreatePitReadingBody = Parameters<
  (typeof api)["pit-readings"]["post"]
>[0];
export type UpdatePitReadingBody = NonNullable<
  Parameters<ReturnType<(typeof api)["pit-readings"]>["patch"]>[0]
>;

export function pitReadingsQueryOptions(reportId: string) {
  return queryOptions({
    queryKey: pitReadingKeys.report(reportId),
    queryFn: () => fetchPitReadings(reportId),
  });
}

/** The pit readings of one daily report. With `null`, nothing is fetched. */
export function usePitReadings(reportId: string | null) {
  return useQuery({
    ...pitReadingsQueryOptions(reportId ?? ""),
    enabled: reportId !== null,
  });
}

function usePitReadingMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // The volume accounting compares its books with these readings.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: pitReadingKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["volumes"] }),
      ]),
  });
}

export function useCreatePitReading() {
  return usePitReadingMutation(async (body: CreatePitReadingBody) =>
    unwrap(await api["pit-readings"].post(body)),
  );
}

export function useUpdatePitReading() {
  return usePitReadingMutation(
    async ({ id, body }: { id: string; body: UpdatePitReadingBody }) =>
      unwrap(await api["pit-readings"]({ id }).patch(body)),
  );
}

export function useDeletePitReading() {
  return usePitReadingMutation(async (id: string) =>
    ensureOk(await api["pit-readings"]({ id }).delete()),
  );
}
