import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type SampleBody, typedBody } from "../fluid-samples/fields";
import { wellboreIntervalKeys } from "./query-keys";

async function fetchWellboreIntervals(parentId: string) {
  return unwrap(
    await api["wellbore-intervals"].get({ query: { report_id: parentId } }),
  );
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
// Every computed number is made by the server; the web only displays them.
export type WellboreIntervalsResponse = Awaited<
  ReturnType<typeof fetchWellboreIntervals>
>;
export type WellboreInterval = WellboreIntervalsResponse["data"][number];
type CreateWellboreIntervalBody = Parameters<
  (typeof api)["wellbore-intervals"]["post"]
>[0];
type UpdateWellboreIntervalBody = NonNullable<
  Parameters<ReturnType<(typeof api)["wellbore-intervals"]>["patch"]>[0]
>;

export function wellboreIntervalQueryOptions(parentId: string) {
  return queryOptions({
    queryKey: wellboreIntervalKeys.parent(parentId),
    queryFn: () => fetchWellboreIntervals(parentId),
  });
}

/** The wellbore intervals of one daily report. With `null`, nothing is fetched. */
export function useWellboreIntervals(parentId: string | null) {
  return useQuery({
    ...wellboreIntervalQueryOptions(parentId ?? ""),
    enabled: parentId !== null,
  });
}

function useWellboreIntervalMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // The pressure loss and the hole cleaning read these rows: they must be fetched again.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: wellboreIntervalKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["hydraulics"] }),
      ]),
  });
}

export function useCreateWellboreInterval() {
  return useWellboreIntervalMutation(async (body: SampleBody) =>
    unwrap(
      await api["wellbore-intervals"].post(
        typedBody<CreateWellboreIntervalBody>(body),
      ),
    ),
  );
}

export function useUpdateWellboreInterval() {
  return useWellboreIntervalMutation(
    async ({ id, body }: { id: string; body: SampleBody }) =>
      unwrap(
        await api["wellbore-intervals"]({ id }).patch(
          typedBody<UpdateWellboreIntervalBody>(body),
        ),
      ),
  );
}

export function useDeleteWellboreInterval() {
  return useWellboreIntervalMutation(async (id: string) =>
    ensureOk(await api["wellbore-intervals"]({ id }).delete()),
  );
}
