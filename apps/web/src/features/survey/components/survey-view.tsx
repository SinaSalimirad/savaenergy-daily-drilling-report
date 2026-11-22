"use client";

import { Button } from "@/components/ui/button";
import { bindMutation } from "../../fluid-samples/bind-mutation";
import { ReportSheetView } from "../../fluid-samples/components/report-sheet-view";
import {
  NewSampleDialog,
  SampleActions,
} from "../../fluid-samples/components/sample-dialogs";
import {
  type RowColumn,
  RowTable,
} from "../../hydraulics/components/row-table";
import { formatNumber } from "../../hydraulics/format";
import {
  type SurveyStation,
  useCreateSurveyStation,
  useDeleteSurveyStation,
  useSurveyStations,
  useUpdateSurveyStation,
} from "../api";
import { SURVEY_DEFS } from "../fields";

const WHAT = "survey station";

const COLUMNS: RowColumn<SurveyStation>[] = [
  { header: "M.D. (m)", render: (row) => formatNumber(row.md_m, 2) },
  { header: "Inc. (°)", render: (row) => formatNumber(row.inclination_deg, 2) },
  { header: "Azi. (°)", render: (row) => formatNumber(row.azimuth_deg, 2) },
  {
    header: "TVD (m)",
    computed: true,
    render: (row) => formatNumber(row.tvd_m, 2),
  },
  {
    header: "N/S (m)",
    computed: true,
    render: (row) => formatNumber(row.north_m, 2),
  },
  {
    header: "E/W (m)",
    computed: true,
    render: (row) => formatNumber(row.east_m, 2),
  },
  {
    header: "DLS (°/30 m)",
    computed: true,
    render: (row) => formatNumber(row.dogleg_deg_30m, 2),
  },
];

function StationActions({ station }: { station: SurveyStation }) {
  const update = useUpdateSurveyStation();
  const remove = useDeleteSurveyStation();
  return (
    <SampleActions
      what={WHAT}
      rowName={`the station at ${formatNumber(station.md_m, 2)} m`}
      defs={SURVEY_DEFS}
      row={station}
      update={bindMutation(update, (body) => ({ id: station.id, body }))}
      remove={bindMutation(remove, () => station.id)}
    />
  );
}

function Toolbar({ wellId }: { wellId: string }) {
  const create = useCreateSurveyStation();
  return (
    <NewSampleDialog
      what={WHAT}
      defs={SURVEY_DEFS}
      create={create}
      parent={{ well_id: wellId }}
      triggerLabel="New station"
    />
  );
}

function Sheet({ wellId }: { wellId: string }) {
  const survey = useSurveyStations(wellId);
  if (survey.isError) {
    return (
      <div className="flex items-center gap-3 p-4">
        <p className="text-destructive">{survey.error.message}</p>
        <Button variant="outline" onClick={() => survey.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  return (
    <RowTable
      rows={survey.data?.data ?? []}
      columns={COLUMNS}
      isLoading={survey.isPending}
      emptyMessage="No survey stations for this well yet. Use “New station” to add one."
      renderActions={(row) => <StationActions station={row} />}
    />
  );
}

// The survey belongs to the well, not to one report: it is shown for the well of the chosen
// report, so the pickers work as on the other pages.
export function SurveyView() {
  return (
    <ReportSheetView
      title="Survey"
      subject="survey"
      toolbar={(_reportId, report) => <Toolbar wellId={report.well_id} />}
      sheet={(_reportId, report) => <Sheet wellId={report.well_id} />}
    />
  );
}
