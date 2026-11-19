import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type ProductsListParams, productKeys } from "./query-keys";

async function fetchProducts(params: ProductsListParams) {
  return unwrap(await api.products.get({ query: params }));
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type ProductsPage = Awaited<ReturnType<typeof fetchProducts>>;
export type Product = ProductsPage["data"][number];
export type ProductBody = Parameters<(typeof api)["products"]["post"]>[0];

export function productsQueryOptions(params: ProductsListParams) {
  return queryOptions({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    // Keep showing the old page while the next one loads, so the table does not flash empty.
    placeholderData: keepPreviousData,
  });
}

export function useProducts(params: ProductsListParams) {
  return useQuery(productsQueryOptions(params));
}

// Every mutation refreshes all product lists: a change can move a row to another page (the list
// is sorted by name) and change the totals, so refreshing one list is not enough.
function useProductMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useCreateProduct() {
  return useProductMutation(async (body: ProductBody) =>
    unwrap(await api.products.post(body)),
  );
}

export function useUpdateProduct() {
  return useProductMutation(
    async ({ id, body }: { id: string; body: ProductBody }) =>
      unwrap(await api.products({ id }).patch(body)),
  );
}

export function useDeleteProduct() {
  return useProductMutation(async (id: string) =>
    ensureOk(await api.products({ id }).delete()),
  );
}
