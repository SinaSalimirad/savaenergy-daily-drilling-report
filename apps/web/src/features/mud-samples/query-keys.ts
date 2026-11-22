export const mudSampleKeys = {
  all: ["mud-samples"] as const,
  report: (reportId: string) =>
    [...mudSampleKeys.all, "report", reportId] as const,
};
