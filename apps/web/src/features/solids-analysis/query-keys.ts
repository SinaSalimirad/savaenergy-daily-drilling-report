export const solidsAnalysisKeys = {
  all: ["solids-analysis"] as const,
  report: (reportId: string) =>
    [...solidsAnalysisKeys.all, "report", reportId] as const,
};
