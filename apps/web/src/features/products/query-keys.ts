export type ProductsListParams = {
  page: number;
  pageSize: number;
};

// `all` is what mutations invalidate: it matches every list below it.
export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductsListParams) =>
    [...productKeys.all, "list", params] as const,
};
