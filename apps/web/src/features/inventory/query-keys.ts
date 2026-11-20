// `all` is what mutations invalidate: it matches the sheet of every report. A change can alter
// the cumulative numbers of the later reports of the same well, so one sheet is not enough.
export const inventoryKeys = {
  all: ["inventory"] as const,
  report: (reportId: string) =>
    [...inventoryKeys.all, "report", reportId] as const,
};
