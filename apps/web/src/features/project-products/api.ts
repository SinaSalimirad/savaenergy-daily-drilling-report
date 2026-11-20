import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import {
  type ProjectProductsListParams,
  projectProductKeys,
} from "./query-keys";

async function fetchProjectProducts({
  projectId,
  page,
  pageSize,
}: ProjectProductsListParams) {
  return unwrap(
    await api["project-products"].get({
      query: { project_id: projectId, page, pageSize },
    }),
  );
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type ProjectProductsPage = Awaited<
  ReturnType<typeof fetchProjectProducts>
>;
export type ProjectProduct = ProjectProductsPage["data"][number];
export type ProjectProductBody = Parameters<
  (typeof api)["project-products"]["post"]
>[0];

export function projectProductsQueryOptions(params: ProjectProductsListParams) {
  return queryOptions({
    queryKey: projectProductKeys.list(params),
    queryFn: () => fetchProjectProducts(params),
    placeholderData: keepPreviousData,
  });
}

/** The products one project uses. Pass `null` while no project is chosen: nothing is fetched. */
export function useProjectProducts(projectId: string | null) {
  // The API allows at most 100 per page, the same limit the other pickers use.
  const params = { projectId: projectId ?? "", page: 1, pageSize: 100 };
  return useQuery({
    ...projectProductsQueryOptions(params),
    enabled: projectId !== null,
  });
}

function useProjectProductMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: projectProductKeys.all }),
  });
}

export function useAddProjectProduct() {
  return useProjectProductMutation(async (body: ProjectProductBody) =>
    unwrap(await api["project-products"].post(body)),
  );
}

export function useRemoveProjectProduct() {
  return useProjectProductMutation(async (id: string) =>
    ensureOk(await api["project-products"]({ id }).delete()),
  );
}
