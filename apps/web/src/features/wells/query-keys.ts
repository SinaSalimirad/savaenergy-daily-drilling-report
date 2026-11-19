export type WellsListParams = {
  page: number;
  pageSize: number;
  archived: boolean;
};

// `all` is what mutations invalidate: it matches every list below it.
export const wellKeys = {
  all: ["wells"] as const,
  list: (params: WellsListParams) => [...wellKeys.all, "list", params] as const,
};
