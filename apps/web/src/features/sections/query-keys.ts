export type SectionsListParams = {
  page: number;
  pageSize: number;
};

// `all` is what mutations invalidate: it matches every list below it.
export const sectionKeys = {
  all: ["sections"] as const,
  list: (params: SectionsListParams) =>
    [...sectionKeys.all, "list", params] as const,
};
