import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type SampleBody, typedBody } from "../fluid-samples/fields";
import { solidsAnalysisKeys } from "./query-keys";

async function fetchSolidsAnalyses(reportId: string) {
  return unwrap(
    await api["solids-analysis"].get({ query: { report_id: reportId } }),
  );
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type SolidsAnalysesResponse = Awaited<
  ReturnType<typeof fetchSolidsAnalyses>
>;
export type SolidsAnalysis = SolidsAnalysesResponse["data"][number];
type CreateSolidsAnalysisBody = Parameters<
  (typeof api)["solids-analysis"]["post"]
>[0];
type UpdateSolidsAnalysisBody = NonNullable<
  Parameters<ReturnType<(typeof api)["solids-analysis"]>["patch"]>[0]
>;

export function solidsAnalysisQueryOptions(reportId: string) {
  return queryOptions({
    queryKey: solidsAnalysisKeys.report(reportId),
    queryFn: () => fetchSolidsAnalyses(reportId),
  });
}

/** The solids analysiss of one daily report. With `null`, nothing is fetched. */
export function useSolidsAnalyses(reportId: string | null) {
  return useQuery({
    ...solidsAnalysisQueryOptions(reportId ?? ""),
    enabled: reportId !== null,
  });
}

function useSolidsAnalysisMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: solidsAnalysisKeys.all }),
  });
}

export function useCreateSolidsAnalysis() {
  return useSolidsAnalysisMutation(async (body: SampleBody) =>
    unwrap(
      await api["solids-analysis"].post(
        typedBody<CreateSolidsAnalysisBody>(body),
      ),
    ),
  );
}

export function useUpdateSolidsAnalysis() {
  return useSolidsAnalysisMutation(
    async ({ id, body }: { id: string; body: SampleBody }) =>
      unwrap(
        await api["solids-analysis"]({ id }).patch(
          typedBody<UpdateSolidsAnalysisBody>(body),
        ),
      ),
  );
}

export function useDeleteSolidsAnalysis() {
  return useSolidsAnalysisMutation(async (id: string) =>
    ensureOk(await api["solids-analysis"]({ id }).delete()),
  );
}
