export type SceListParams = {
  page: number;
  pageSize: number;
  // Only the equipment of one project. Left out, every project is listed.
  project_id?: string;
};

// `all` is what mutations invalidate: it matches every list below it.
export const sceKeys = {
  all: ["solid-control"] as const,
  list: (params: SceListParams) => [...sceKeys.all, "list", params] as const,
};
