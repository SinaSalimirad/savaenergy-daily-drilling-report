// `all` is what mutations invalidate: it matches the readings of every report.
export const pitReadingKeys = {
  all: ["pit-readings"] as const,
  report: (reportId: string) =>
    [...pitReadingKeys.all, "report", reportId] as const,
};
