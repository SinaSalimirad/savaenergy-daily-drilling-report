import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type DailyReportsListParams, dailyReportKeys } from "./query-keys";

async function fetchDailyReports(params: DailyReportsListParams) {
  return unwrap(
    await api["daily-reports"].get({
      query: {
        page: params.page,
        pageSize: params.pageSize,
        project_id: params.projectId,
      },
    }),
  );
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type DailyReportsPage = Awaited<ReturnType<typeof fetchDailyReports>>;
export type DailyReport = DailyReportsPage["data"][number];
export type CreateDailyReportBody = Parameters<
  (typeof api)["daily-reports"]["post"]
>[0];
export type UpdateDailyReportBody = NonNullable<
  Parameters<ReturnType<(typeof api)["daily-reports"]>["patch"]>[0]
>;

export function dailyReportsQueryOptions(params: DailyReportsListParams) {
  return queryOptions({
    queryKey: dailyReportKeys.list(params),
    queryFn: () => fetchDailyReports(params),
    // Keep showing the old page while the next one loads, so the table does not flash empty.
    placeholderData: keepPreviousData,
  });
}

export function useDailyReports(params: DailyReportsListParams) {
  return useQuery(dailyReportsQueryOptions(params));
}

// Every mutation refreshes all report lists: a change can move a row to another page (the list
// is sorted by date) and change the totals, so refreshing one list is not enough.
function useDailyReportMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: dailyReportKeys.all }),
  });
}

export function useCreateDailyReport() {
  return useDailyReportMutation(async (body: CreateDailyReportBody) =>
    unwrap(await api["daily-reports"].post(body)),
  );
}

export function useUpdateDailyReport() {
  return useDailyReportMutation(
    async ({ id, body }: { id: string; body: UpdateDailyReportBody }) =>
      unwrap(await api["daily-reports"]({ id }).patch(body)),
  );
}

export function useDeleteDailyReport() {
  return useDailyReportMutation(async (id: string) =>
    ensureOk(await api["daily-reports"]({ id }).delete()),
  );
}
