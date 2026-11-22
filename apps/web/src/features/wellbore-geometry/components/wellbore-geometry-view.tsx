"use client";

import { Button } from "@/components/ui/button";
import { bindMutation } from "../../fluid-samples/bind-mutation";
import { ReportSheetView } from "../../fluid-samples/components/report-sheet-view";
import {
  NewSampleDialog,
  SampleActions,
} from "../../fluid-samples/components/sample-dialogs";
import { displayValue } from "../../fluid-samples/fields";
import {
  type RowColumn,
  RowTable,
} from "../../hydraulics/components/row-table";
import { formatNumber } from "../../hydraulics/format";
import {
  useCreateWellboreInterval,
  useDeleteWellboreInterval,
  useUpdateWellboreInterval,
  useWellboreIntervals,
  type WellboreInterval,
} from "../api";
import { WELLBORE_DEFS, WELLBORE_TYPE_LABELS } from "../fields";

const WHAT = "wellbore interval";

const COLUMNS: RowColumn<WellboreInterval>[] = [
  { header: "Row", render: (row) => row.order },
  {
    header: "Section type",
    render: (row) => WELLBORE_TYPE_LABELS[row.interval_type],
  },
  { header: "Top M.D. (m)", render: (row) => formatNumber(row.top_md_m, 2) },
  {
    header: "Bottom M.D. (m)",
    render: (row) => formatNumber(row.bottom_md_m, 2),
  },
  { header: "O.D. (in)", render: (row) => displayValue(row.od_in) },
  { header: "I.D. / hole (in)", render: (row) => displayValue(row.id_in) },
  {
    header: "Weight (lb/ft)",
    render: (row) => displayValue(row.linear_weight_lb_ft),
  },
  {
    header: "Capacity (bbl/m)",
    computed: true,
    render: (row) => formatNumber(row.capacity_bbl_m, 4),
  },
  {
    header: "Volume (bbl)",
    computed: true,
    render: (row) => formatNumber(row.volume_bbl, 2),
  },
];

function IntervalActions({ interval }: { interval: WellboreInterval }) {
  const update = useUpdateWellboreInterval();
  const remove = useDeleteWellboreInterval();
  return (
    <SampleActions
      what={WHAT}
      rowName={`row ${interval.order}`}
      defs={WELLBORE_DEFS}
      row={interval}
      update={bindMutation(update, (body) => ({ id: interval.id, body }))}
      remove={bindMutation(remove, () => interval.id)}
    />
  );
}

function Toolbar({ reportId }: { reportId: string }) {
  const create = useCreateWellboreInterval();
  return (
    <NewSampleDialog
      what={WHAT}
      defs={WELLBORE_DEFS}
      create={create}
      parent={{ report_id: reportId }}
      triggerLabel="New interval"
    />
  );
}

function Sheet({ reportId }: { reportId: string }) {
  const intervals = useWellboreIntervals(reportId);
  if (intervals.isError) {
    return (
      <div className="flex items-center gap-3 p-4">
        <p className="text-destructive">{intervals.error.message}</p>
        <Button variant="outline" onClick={() => intervals.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  const rows = intervals.data?.data ?? [];
  const total = rows.reduce((sum, row) => sum + row.volume_bbl, 0);
  return (
    <RowTable
      rows={rows}
      columns={COLUMNS}
      isLoading={intervals.isPending}
      emptyMessage="No wellbore intervals in this report yet. Use “New interval” to add one."
      renderActions={(row) => <IntervalActions interval={row} />}
      footer={["Total", "", "", "", "", "", "", "", formatNumber(total, 2)]}
    />
  );
}

export function WellboreGeometryView() {
  return (
    <ReportSheetView
      title="Wellbore geometry"
      subject="wellbore geometry"
      toolbar={(reportId) => <Toolbar reportId={reportId} />}
      sheet={(reportId) => <Sheet reportId={reportId} />}
    />
  );
}
