export type SectionsListParams = {
  page: number;
  pageSize: number;
  // Only the sections of one well. Left out, every section is listed.
  well_id?: string;
  // Only the sections of the wells of one project. Left out, every project is listed.
  project_id?: string;
};

// `all` is what mutations invalidate: it matches every list below it.
export const sectionKeys = {
  all: ["sections"] as const,
  list: (params: SectionsListParams) =>
    [...sectionKeys.all, "list", params] as const,
};
