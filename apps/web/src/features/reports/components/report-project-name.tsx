"use client";

import { useWells } from "@/features/wells/api";
import type { DailyReport } from "../api";

/**
 * The project of a report's well. The report only knows its well, so the name comes from the
 * wells list (the same request the page already shares through the query cache).
 */
export function ReportProjectName({ report }: { report: DailyReport }) {
  // The API allows at most 100 per page: a well beyond the first 100 shows a dash.
  const wells = useWells({ page: 1, pageSize: 100 });
  const well = wells.data?.data.find((item) => item.id === report.well_id);
  return <>{well?.project_name ?? "—"}</>;
}
