"use client";

import { Button } from "@/components/ui/button";
import { bindMutation } from "../../fluid-samples/bind-mutation";
import { ReportSheetView } from "../../fluid-samples/components/report-sheet-view";
import {
  NewSampleDialog,
  SampleActions,
} from "../../fluid-samples/components/sample-dialogs";
import { SampleSheetTable } from "../../fluid-samples/components/sample-sheet-table";
import {
  type RheologyReading,
  useCreateRheologyReading,
  useDeleteRheologyReading,
  useRheologyReadings,
  useUpdateRheologyReading,
} from "../api";
import { RHEOLOGY_DEFS, RHEOLOGY_LINES } from "../fields";

const WHAT = "rheology reading";

function RheologyReadingActions({ sample }: { sample: RheologyReading }) {
  const update = useUpdateRheologyReading();
  const remove = useDeleteRheologyReading();
  return (
    <SampleActions
      what={WHAT}
      rowName={`sample ${sample.sample_no}`}
      defs={RHEOLOGY_DEFS}
      row={sample}
      update={bindMutation(update, (body) => ({ id: sample.id, body }))}
      remove={bindMutation(remove, () => sample.id)}
    />
  );
}

function RheologyReadingToolbar({ reportId }: { reportId: string }) {
  const samples = useRheologyReadings(reportId);
  const create = useCreateRheologyReading();
  return (
    <NewSampleDialog
      what={WHAT}
      defs={RHEOLOGY_DEFS}
      create={create}
      parent={{ report_id: reportId }}
      full={(samples.data?.data.length ?? 0) >= 3}
    />
  );
}

function RheologyReadingSheet({ reportId }: { reportId: string }) {
  const samples = useRheologyReadings(reportId);

  if (samples.isError) {
    return (
      <div className="flex items-center gap-3 p-4">
        <p className="text-destructive">{samples.error.message}</p>
        <Button variant="outline" onClick={() => samples.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  return (
    <SampleSheetTable
      samples={samples.data?.data ?? []}
      lines={RHEOLOGY_LINES}
      isLoading={samples.isPending}
      emptyMessage="No rheology readings in this report yet. Use “New sample” to add one."
      renderActions={(sample) => <RheologyReadingActions sample={sample} />}
    />
  );
}

export function RheologyReadingsView() {
  return (
    <ReportSheetView
      title="Rheology"
      subject="rheology readings"
      toolbar={(reportId) => <RheologyReadingToolbar reportId={reportId} />}
      sheet={(reportId) => <RheologyReadingSheet reportId={reportId} />}
    />
  );
}
