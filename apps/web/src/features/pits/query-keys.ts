export type PitsListParams = {
  page: number;
  pageSize: number;
  // Only the pits of one project. Left out, every project is listed.
  project_id?: string;
};

// `all` is what mutations invalidate: it matches every list below it.
export const pitKeys = {
  all: ["pits"] as const,
  list: (params: PitsListParams) => [...pitKeys.all, "list", params] as const,
};
