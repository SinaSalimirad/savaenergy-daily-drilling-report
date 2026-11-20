export type PumpsListParams = {
  page: number;
  pageSize: number;
  // Only the pumps of one project. Left out, every project is listed.
  project_id?: string;
};

// `all` is what mutations invalidate: it matches every list below it.
export const pumpKeys = {
  all: ["pumps"] as const,
  list: (params: PumpsListParams) => [...pumpKeys.all, "list", params] as const,
};
