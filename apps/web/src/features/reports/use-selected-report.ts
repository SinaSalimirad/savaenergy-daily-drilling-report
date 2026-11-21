import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDailyReports } from "./api";

/**
 * Lets the user pick a well, then one of its reports (newest first, the newest by default).
 * Only the 100 newest reports of the project are listed, so a well with none among them is not
 * offered. Shared by every page that shows one report's data (inventory, recap, ...).
 */
export function useSelectedReport(projectId: string | null) {
  // The API allows at most 100 per page.
  const reports = useDailyReports({
    page: 1,
    pageSize: 100,
    projectId: projectId ?? undefined,
    enabled: projectId !== null,
  });
  const list = reports.data?.data ?? [];

  // A choice that is no longer in the list (another project, a deleted report) is ignored.
  // A link from the daily reports page names the report to open (`?report=`).
  const [chosenWellId, setChosenWellId] = useState<string | null>(null);
  const [chosenSectionId, setChosenSectionId] = useState<string | null>(null);
  const [chosenReportId, setChosenReportId] = useState<string | null>(
    useSearchParams()?.get("report") ?? null,
  );

  const wells = [
    ...new Map(list.map((item) => [item.well_id, item.well_name])),
  ].map(([id, name]) => ({ id, name }));
  // A chosen report brings its own well, until the user picks another well.
  const chosenReport = list.find((item) => item.id === chosenReportId);
  const well =
    wells.find((item) => item.id === chosenWellId) ??
    wells.find((item) => item.id === chosenReport?.well_id) ??
    wells[0];
  const wellReportsUnfiltered = list.filter(
    (item) => item.well_id === well?.id,
  );
  const sections = [
    ...new Map(
      wellReportsUnfiltered.map((item) => [
        item.section_id,
        { order: item.section_order, holeSize: item.section_hole_size },
      ]),
    ),
  ]
    .map(([id, info]) => ({ id, ...info }))
    .sort((a, b) => a.order - b.order);
  // No section chosen (or it no longer belongs to this well) shows every section's reports.
  const sectionIsValid = sections.some((item) => item.id === chosenSectionId);
  const wellReports = sectionIsValid
    ? wellReportsUnfiltered.filter(
        (item) => item.section_id === chosenSectionId,
      )
    : wellReportsUnfiltered;
  const report =
    wellReports.find((item) => item.id === chosenReportId) ?? wellReports[0];

  return {
    reports,
    wells,
    well,
    sections,
    chosenSectionId: sectionIsValid ? chosenSectionId : null,
    wellReports,
    report,
    selectWell: (id: string) => {
      setChosenWellId(id);
      setChosenSectionId(null); // the old section belongs to the old well
      setChosenReportId(null); // the old report belongs to the old well
    },
    selectSection: (id: string | null) => {
      setChosenSectionId(id);
      setChosenReportId(null); // the old report may belong to another section
    },
    selectReport: setChosenReportId,
    // While the previous project's list is still shown, it is not this project's.
    isLoading: reports.isPending || reports.isPlaceholderData,
  };
}

export type SelectedReport = ReturnType<typeof useSelectedReport>;
