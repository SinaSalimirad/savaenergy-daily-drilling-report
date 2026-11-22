import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type SampleBody, typedBody } from "../fluid-samples/fields";
import { bitKeys } from "./query-keys";

async function fetchBits(parentId: string) {
  return unwrap(await api.bits.get({ query: { report_id: parentId } }));
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
// Every computed number is made by the server; the web only displays them.
export type BitsResponse = Awaited<ReturnType<typeof fetchBits>>;
export type Bit = BitsResponse["data"][number];
type CreateBitBody = Parameters<(typeof api)["bits"]["post"]>[0];
type UpdateBitBody = NonNullable<
  Parameters<ReturnType<(typeof api)["bits"]>["patch"]>[0]
>;

export function bitQueryOptions(parentId: string) {
  return queryOptions({
    queryKey: bitKeys.parent(parentId),
    queryFn: () => fetchBits(parentId),
  });
}

/** The bits of one daily report. With `null`, nothing is fetched. */
export function useBits(parentId: string | null) {
  return useQuery({
    ...bitQueryOptions(parentId ?? ""),
    enabled: parentId !== null,
  });
}

function useBitMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // The pressure loss and the hole cleaning read these rows: they must be fetched again.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: bitKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["hydraulics"] }),
      ]),
  });
}

export function useCreateBit() {
  return useBitMutation(async (body: SampleBody) =>
    unwrap(await api.bits.post(typedBody<CreateBitBody>(body))),
  );
}

export function useUpdateBit() {
  return useBitMutation(
    async ({ id, body }: { id: string; body: SampleBody }) =>
      unwrap(await api.bits({ id }).patch(typedBody<UpdateBitBody>(body))),
  );
}

export function useDeleteBit() {
  return useBitMutation(async (id: string) =>
    ensureOk(await api.bits({ id }).delete()),
  );
}
