import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { inventoryKeys } from "./query-keys";

async function fetchInventory(reportId: string) {
  return unwrap(await api.inventory.get({ query: { report_id: reportId } }));
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
// Every number of the sheet is computed by the server; the web only displays them.
export type InventoryResponse = Awaited<ReturnType<typeof fetchInventory>>;
export type InventoryRow = InventoryResponse["data"][number];
export type CreateInventoryBody = Parameters<typeof api.inventory.post>[0];
export type UpdateInventoryBody = NonNullable<
  Parameters<ReturnType<typeof api.inventory>["patch"]>[0]
>;

export function inventoryQueryOptions(reportId: string) {
  return queryOptions({
    queryKey: inventoryKeys.report(reportId),
    queryFn: () => fetchInventory(reportId),
  });
}

/** The inventory sheet of one daily report. With `null`, nothing is fetched. */
export function useInventory(reportId: string | null) {
  return useQuery({
    ...inventoryQueryOptions(reportId ?? ""),
    enabled: reportId !== null,
  });
}

function useInventoryMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}

export function useCreateInventoryRow() {
  return useInventoryMutation(async (body: CreateInventoryBody) =>
    unwrap(await api.inventory.post(body)),
  );
}

export function useUpdateInventoryRow() {
  return useInventoryMutation(
    async ({ id, body }: { id: string; body: UpdateInventoryBody }) =>
      unwrap(await api.inventory({ id }).patch(body)),
  );
}

export function useDeleteInventoryRow() {
  return useInventoryMutation(async (id: string) =>
    ensureOk(await api.inventory({ id }).delete()),
  );
}
