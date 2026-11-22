import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type SampleBody, typedBody } from "../fluid-samples/fields";
import { mudSampleKeys } from "./query-keys";

async function fetchMudSamples(reportId: string) {
  return unwrap(
    await api["mud-samples"].get({ query: { report_id: reportId } }),
  );
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type MudSamplesResponse = Awaited<ReturnType<typeof fetchMudSamples>>;
export type MudSample = MudSamplesResponse["data"][number];
type CreateMudSampleBody = Parameters<(typeof api)["mud-samples"]["post"]>[0];
type UpdateMudSampleBody = NonNullable<
  Parameters<ReturnType<(typeof api)["mud-samples"]>["patch"]>[0]
>;

export function mudSampleQueryOptions(reportId: string) {
  return queryOptions({
    queryKey: mudSampleKeys.report(reportId),
    queryFn: () => fetchMudSamples(reportId),
  });
}

/** The mud samples of one daily report. With `null`, nothing is fetched. */
export function useMudSamples(reportId: string | null) {
  return useQuery({
    ...mudSampleQueryOptions(reportId ?? ""),
    enabled: reportId !== null,
  });
}

function useMudSampleMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // The pressure loss and the hole cleaning read these samples: they must be fetched again.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: mudSampleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["hydraulics"] }),
      ]),
  });
}

export function useCreateMudSample() {
  return useMudSampleMutation(async (body: SampleBody) =>
    unwrap(await api["mud-samples"].post(typedBody<CreateMudSampleBody>(body))),
  );
}

export function useUpdateMudSample() {
  return useMudSampleMutation(
    async ({ id, body }: { id: string; body: SampleBody }) =>
      unwrap(
        await api["mud-samples"]({ id }).patch(
          typedBody<UpdateMudSampleBody>(body),
        ),
      ),
  );
}

export function useDeleteMudSample() {
  return useMudSampleMutation(async (id: string) =>
    ensureOk(await api["mud-samples"]({ id }).delete()),
  );
}
