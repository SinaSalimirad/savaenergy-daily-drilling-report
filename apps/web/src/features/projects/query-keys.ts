export type ProjectsListParams = {
  page: number;
  pageSize: number;
  archived: boolean;
};

// `all` is what mutations invalidate: it matches every list below it.
export const projectKeys = {
  all: ["projects"] as const,
  list: (params: ProjectsListParams) =>
    [...projectKeys.all, "list", params] as const,
};
