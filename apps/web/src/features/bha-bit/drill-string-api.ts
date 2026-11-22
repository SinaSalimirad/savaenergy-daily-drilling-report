import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type SampleBody, typedBody } from "../fluid-samples/fields";
import { drillStringToolKeys } from "./query-keys";

async function fetchDrillStringTools(parentId: string) {
  return unwrap(
    await api["drill-string"].get({ query: { report_id: parentId } }),
  );
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
// Every computed number is made by the server; the web only displays them.
export type DrillStringToolsResponse = Awaited<
  ReturnType<typeof fetchDrillStringTools>
>;
export type DrillStringTool = DrillStringToolsResponse["data"][number];
type CreateDrillStringToolBody = Parameters<
  (typeof api)["drill-string"]["post"]
>[0];
type UpdateDrillStringToolBody = NonNullable<
  Parameters<ReturnType<(typeof api)["drill-string"]>["patch"]>[0]
>;

export function drillStringToolQueryOptions(parentId: string) {
  return queryOptions({
    queryKey: drillStringToolKeys.parent(parentId),
    queryFn: () => fetchDrillStringTools(parentId),
  });
}

/** The drill string tools of one daily report. With `null`, nothing is fetched. */
export function useDrillStringTools(parentId: string | null) {
  return useQuery({
    ...drillStringToolQueryOptions(parentId ?? ""),
    enabled: parentId !== null,
  });
}

function useDrillStringToolMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // The pressure loss and the hole cleaning read these rows: they must be fetched again.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: drillStringToolKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["hydraulics"] }),
      ]),
  });
}

export function useCreateDrillStringTool() {
  return useDrillStringToolMutation(async (body: SampleBody) =>
    unwrap(
      await api["drill-string"].post(
        typedBody<CreateDrillStringToolBody>(body),
      ),
    ),
  );
}

export function useUpdateDrillStringTool() {
  return useDrillStringToolMutation(
    async ({ id, body }: { id: string; body: SampleBody }) =>
      unwrap(
        await api["drill-string"]({ id }).patch(
          typedBody<UpdateDrillStringToolBody>(body),
        ),
      ),
  );
}

export function useDeleteDrillStringTool() {
  return useDrillStringToolMutation(async (id: string) =>
    ensureOk(await api["drill-string"]({ id }).delete()),
  );
}
