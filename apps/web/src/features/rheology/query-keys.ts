export const rheologyReadingKeys = {
  all: ["rheology"] as const,
  report: (reportId: string) =>
    [...rheologyReadingKeys.all, "report", reportId] as const,
};
