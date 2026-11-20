export type ProjectProductsListParams = {
  projectId: string;
  page: number;
  pageSize: number;
};

// `all` is what mutations invalidate: it matches every list below it.
export const projectProductKeys = {
  all: ["project-products"] as const,
  list: (params: ProjectProductsListParams) =>
    [...projectProductKeys.all, "list", params] as const,
};
