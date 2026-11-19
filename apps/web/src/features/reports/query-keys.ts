export type DailyReportsListParams = {
  page: number;
  pageSize: number;
};

// `all` is what mutations invalidate: it matches every list below it.
export const dailyReportKeys = {
  all: ["daily-reports"] as const,
  list: (params: DailyReportsListParams) =>
    [...dailyReportKeys.all, "list", params] as const,
};
