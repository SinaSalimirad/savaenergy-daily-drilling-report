import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type ProjectsListParams, projectKeys } from "./query-keys";

async function fetchProjects(params: ProjectsListParams) {
  const result = await api.projects.get({
    // The API reads the flag from the URL, where every value is text.
    query: { ...params, archived: params.archived ? "true" : "false" },
  });
  return unwrap(result);
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
export type ProjectsPage = Awaited<ReturnType<typeof fetchProjects>>;
export type Project = ProjectsPage["data"][number];
export type CreateProjectBody = Parameters<typeof api.projects.post>[0];
export type UpdateProjectBody = NonNullable<
  Parameters<ReturnType<typeof api.projects>["patch"]>[0]
>;

export function projectsQueryOptions(params: ProjectsListParams) {
  return queryOptions({
    queryKey: projectKeys.list(params),
    queryFn: () => fetchProjects(params),
    // Keep showing the old page while the next one loads, so the table does not flash empty.
    placeholderData: keepPreviousData,
  });
}

export function useProjects(params: ProjectsListParams) {
  return useQuery(projectsQueryOptions(params));
}

// Every mutation refreshes all project lists: a change can move a row between the active
// and archived lists and change the totals, so refreshing one list is not enough.
function useProjectMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useCreateProject() {
  return useProjectMutation(async (body: CreateProjectBody) =>
    unwrap(await api.projects.post(body)),
  );
}

export function useUpdateProject() {
  return useProjectMutation(
    async ({ id, body }: { id: string; body: UpdateProjectBody }) =>
      unwrap(await api.projects({ id }).patch(body)),
  );
}

export function useArchiveProject() {
  return useProjectMutation(async (id: string) =>
    unwrap(await api.projects({ id }).archive.post()),
  );
}

export function useRestoreProject() {
  return useProjectMutation(async (id: string) =>
    unwrap(await api.projects({ id }).restore.post()),
  );
}

export function useDeleteProject() {
  return useProjectMutation(async (id: string) =>
    ensureOk(await api.projects({ id }).delete()),
  );
}
