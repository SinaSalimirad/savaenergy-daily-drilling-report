"use client";

import { Button } from "@/components/ui/button";
import { ReportSheetView } from "../../fluid-samples/components/report-sheet-view";
import {
  type HoleCleaning,
  useHoleCleaning,
  useHydraulicInput,
} from "../../hydraulics/api";
import {
  CUTTINGS_FIELDS,
  FLOW_FIELDS,
  HydraulicInputsDialog,
} from "../../hydraulics/components/hydraulic-inputs-dialog";
import { MissingList } from "../../hydraulics/components/missing-list";
import {
  type RowColumn,
  RowTable,
} from "../../hydraulics/components/row-table";
import { formatNumber } from "../../hydraulics/format";

type Segment = NonNullable<HoleCleaning["result"]>[number] & { id: string };

const STATUS_LABELS = {
  good: "Good",
  poor: "Poor",
  not_cleaning: "Not cleaning",
} as const;

const STATUS_STYLES = {
  good: "text-emerald-600 dark:text-emerald-400",
  poor: "text-amber-600 dark:text-amber-400",
  not_cleaning: "text-destructive",
} as const;

const COLUMNS: RowColumn<Segment>[] = [
  { header: "From (m)", render: (row) => formatNumber(row.from_md_m, 1) },
  { header: "To (m)", render: (row) => formatNumber(row.to_md_m, 1) },
  { header: "Hole (in)", render: (row) => row.hole_id_in },
  { header: "Pipe O.D. (in)", render: (row) => row.pipe_od_in },
  {
    header: "Annular velocity (m/min)",
    render: (row) => formatNumber(row.annular_velocity_m_min, 1),
  },
  {
    header: "Slip velocity (m/min)",
    render: (row) => formatNumber(row.slip_velocity_m_min, 1),
  },
  {
    header: "Cutting transport (m/min)",
    render: (row) => formatNumber(row.transport_velocity_m_min, 1),
  },
  {
    header: "Transport ratio (%)",
    render: (row) => formatNumber(row.transport_ratio_percent, 1),
  },
  {
    header: "Cuttings conc. (%vol)",
    render: (row) => formatNumber(row.cuttings_concentration_percent, 2),
  },
  {
    header: "Hole cleaning",
    render: (row) => (
      <span className={`font-medium ${STATUS_STYLES[row.status]}`}>
        {STATUS_LABELS[row.status]}
      </span>
    ),
  },
];

function Sheet({ reportId }: { reportId: string }) {
  const cleaning = useHoleCleaning(reportId);
  if (cleaning.isError) {
    return (
      <div className="flex items-center gap-3 p-4">
        <p className="text-destructive">{cleaning.error.message}</p>
        <Button variant="outline" onClick={() => cleaning.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  if (cleaning.isPending)
    return <p className="p-4 text-muted-foreground">Calculating…</p>;
  const { missing, result } = cleaning.data.data;
  if (!result) return <MissingList missing={missing} />;

  const rows = result.map((item, index) => ({
    ...item,
    id: `segment-${index}`,
  }));
  return (
    <div className="flex flex-col gap-4">
      <RowTable rows={rows} columns={COLUMNS} emptyMessage="No annulus." />
      <p className="px-2 text-muted-foreground text-sm">
        The cuttings sink at their settling velocity in the mud of the latest
        rheology sample, and the mud carries them up at the rest of the annular
        velocity. The concentration is the share of the annulus that the
        cuttings of the ROP fill (good is 5% or less). The hole is taken as
        vertical: the inclination is not counted.
      </p>
    </div>
  );
}

function Toolbar({ reportId }: { reportId: string }) {
  const input = useHydraulicInput(reportId);
  return (
    <HydraulicInputsDialog
      reportId={reportId}
      defs={[...FLOW_FIELDS, ...CUTTINGS_FIELDS]}
      input={input.data?.data}
    />
  );
}

export function HoleCleaningView() {
  return (
    <ReportSheetView
      title="Hole cleaning"
      subject="hole cleaning"
      toolbar={(reportId) => <Toolbar reportId={reportId} />}
      sheet={(reportId) => <Sheet reportId={reportId} />}
    />
  );
}
