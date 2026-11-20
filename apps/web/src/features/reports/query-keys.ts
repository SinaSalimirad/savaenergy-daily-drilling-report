export type DailyReportsListParams = {
  page: number;
  pageSize: number;
  // Left out, reports of every project are listed.
  projectId?: string;
  // Only fetch while true. Used by pages that need a project before listing.
  enabled?: boolean;
};

// `all` is what mutations invalidate: it matches every list below it.
export const dailyReportKeys = {
  all: ["daily-reports"] as const,
  list: (params: DailyReportsListParams) =>
    [...dailyReportKeys.all, "list", params] as const,
};
