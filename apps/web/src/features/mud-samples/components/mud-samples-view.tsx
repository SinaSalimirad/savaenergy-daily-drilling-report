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
  type MudSample,
  useCreateMudSample,
  useDeleteMudSample,
  useMudSamples,
  useUpdateMudSample,
} from "../api";
import { MUD_SAMPLE_DEFS, MUD_SAMPLE_LINES } from "../fields";

const WHAT = "mud sample";

function MudSampleActions({ sample }: { sample: MudSample }) {
  const update = useUpdateMudSample();
  const remove = useDeleteMudSample();
  return (
    <SampleActions
      what={WHAT}
      rowName={`sample ${sample.sample_no}`}
      defs={MUD_SAMPLE_DEFS}
      row={sample}
      update={bindMutation(update, (body) => ({ id: sample.id, body }))}
      remove={bindMutation(remove, () => sample.id)}
    />
  );
}

function MudSampleToolbar({ reportId }: { reportId: string }) {
  const samples = useMudSamples(reportId);
  const create = useCreateMudSample();
  return (
    <NewSampleDialog
      what={WHAT}
      defs={MUD_SAMPLE_DEFS}
      create={create}
      parent={{ report_id: reportId }}
      full={(samples.data?.data.length ?? 0) >= 3}
    />
  );
}

function MudSampleSheet({ reportId }: { reportId: string }) {
  const samples = useMudSamples(reportId);

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
      lines={MUD_SAMPLE_LINES}
      isLoading={samples.isPending}
      emptyMessage="No mud samples in this report yet. Use “New sample” to add one."
      renderActions={(sample) => <MudSampleActions sample={sample} />}
    />
  );
}

export function MudSamplesView() {
  return (
    <ReportSheetView
      title="Mud samples"
      subject="mud samples"
      toolbar={(reportId) => <MudSampleToolbar reportId={reportId} />}
      sheet={(reportId) => <MudSampleSheet reportId={reportId} />}
    />
  );
}
