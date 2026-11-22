import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type SampleBody, typedBody } from "../fluid-samples/fields";
import { rheologyReadingKeys } from "./query-keys";

async function fetchRheologyReadings(reportId: string) {
  return unwrap(await api.rheology.get({ query: { report_id: reportId } }));
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type RheologyReadingsResponse = Awaited<
  ReturnType<typeof fetchRheologyReadings>
>;
export type RheologyReading = RheologyReadingsResponse["data"][number];
type CreateRheologyReadingBody = Parameters<
  (typeof api)["rheology"]["post"]
>[0];
type UpdateRheologyReadingBody = NonNullable<
  Parameters<ReturnType<(typeof api)["rheology"]>["patch"]>[0]
>;

export function rheologyReadingQueryOptions(reportId: string) {
  return queryOptions({
    queryKey: rheologyReadingKeys.report(reportId),
    queryFn: () => fetchRheologyReadings(reportId),
  });
}

/** The rheology readings of one daily report. With `null`, nothing is fetched. */
export function useRheologyReadings(reportId: string | null) {
  return useQuery({
    ...rheologyReadingQueryOptions(reportId ?? ""),
    enabled: reportId !== null,
  });
}

function useRheologyReadingMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // The pressure loss and the hole cleaning read these samples: they must be fetched again.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: rheologyReadingKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["hydraulics"] }),
      ]),
  });
}

export function useCreateRheologyReading() {
  return useRheologyReadingMutation(async (body: SampleBody) =>
    unwrap(await api.rheology.post(typedBody<CreateRheologyReadingBody>(body))),
  );
}

export function useUpdateRheologyReading() {
  return useRheologyReadingMutation(
    async ({ id, body }: { id: string; body: SampleBody }) =>
      unwrap(
        await api
          .rheology({ id })
          .patch(typedBody<UpdateRheologyReadingBody>(body)),
      ),
  );
}

export function useDeleteRheologyReading() {
  return useRheologyReadingMutation(async (id: string) =>
    ensureOk(await api.rheology({ id }).delete()),
  );
}
