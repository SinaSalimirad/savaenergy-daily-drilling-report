import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { unwrap } from "@/lib/api-error";
import { type SampleBody, typedBody } from "../fluid-samples/fields";

// Every key starts with "hydraulics": the pages that feed the calculations invalidate it.
export const hydraulicsKeys = {
  all: ["hydraulics"] as const,
  inputs: (reportId: string) =>
    [...hydraulicsKeys.all, "inputs", reportId] as const,
  pressureLoss: (reportId: string) =>
    [...hydraulicsKeys.all, "pressure-loss", reportId] as const,
  holeCleaning: (reportId: string) =>
    [...hydraulicsKeys.all, "hole-cleaning", reportId] as const,
};

async function fetchInputs(reportId: string) {
  return unwrap(
    await api.hydraulics.inputs.get({ query: { report_id: reportId } }),
  );
}
async function fetchPressureLoss(reportId: string) {
  return unwrap(
    await api.hydraulics["pressure-loss"].get({
      query: { report_id: reportId },
    }),
  );
}
async function fetchHoleCleaning(reportId: string) {
  return unwrap(
    await api.hydraulics["hole-cleaning"].get({
      query: { report_id: reportId },
    }),
  );
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type HydraulicInput = Awaited<ReturnType<typeof fetchInputs>>["data"];
export type PressureLoss = Awaited<
  ReturnType<typeof fetchPressureLoss>
>["data"];
export type HoleCleaning = Awaited<
  ReturnType<typeof fetchHoleCleaning>
>["data"];
type SetInputBody = Parameters<typeof api.hydraulics.inputs.put>[0];

export function useHydraulicInput(reportId: string) {
  return useQuery(
    queryOptions({
      queryKey: hydraulicsKeys.inputs(reportId),
      queryFn: () => fetchInputs(reportId),
    }),
  );
}

export function usePressureLoss(reportId: string) {
  return useQuery(
    queryOptions({
      queryKey: hydraulicsKeys.pressureLoss(reportId),
      queryFn: () => fetchPressureLoss(reportId),
    }),
  );
}

export function useHoleCleaning(reportId: string) {
  return useQuery(
    queryOptions({
      queryKey: hydraulicsKeys.holeCleaning(reportId),
      queryFn: () => fetchHoleCleaning(reportId),
    }),
  );
}

export function useSetHydraulicInput() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: SampleBody) =>
      unwrap(await api.hydraulics.inputs.put(typedBody<SetInputBody>(body))),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: hydraulicsKeys.all }),
  });
}
