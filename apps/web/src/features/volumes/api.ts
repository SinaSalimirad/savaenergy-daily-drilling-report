import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { unwrap } from "@/lib/api-error";
import { type SampleBody, typedBody } from "../fluid-samples/fields";

// A change moves the totals of every later report of the well, so every sheet is fetched again.
export const volumeKeys = {
  all: ["volumes"] as const,
  sheet: (reportId: string) => [...volumeKeys.all, reportId] as const,
};

async function fetchVolumeSheet(reportId: string) {
  return unwrap(await api.volumes.get({ query: { report_id: reportId } }));
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
// Every total is computed by the server; the web only displays them.
export type VolumeSheet = Awaited<ReturnType<typeof fetchVolumeSheet>>["data"];
type SetAccountingBody = Parameters<typeof api.volumes.accounting.put>[0];
type SetLossesBody = Parameters<typeof api.volumes.losses.put>[0];

export function useVolumeSheet(reportId: string) {
  return useQuery(
    queryOptions({
      queryKey: volumeKeys.sheet(reportId),
      queryFn: () => fetchVolumeSheet(reportId),
    }),
  );
}

function useVolumeMutation(mutationFn: (body: SampleBody) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: volumeKeys.all }),
  });
}

export function useSetVolumeAccounting() {
  return useVolumeMutation(async (body) =>
    unwrap(
      await api.volumes.accounting.put(typedBody<SetAccountingBody>(body)),
    ),
  );
}

export function useSetMudLosses() {
  return useVolumeMutation(async (body) =>
    unwrap(await api.volumes.losses.put(typedBody<SetLossesBody>(body))),
  );
}
