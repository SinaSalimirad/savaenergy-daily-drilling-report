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
  type SolidsAnalysis,
  useCreateSolidsAnalysis,
  useDeleteSolidsAnalysis,
  useSolidsAnalyses,
  useUpdateSolidsAnalysis,
} from "../api";
import { SOLIDS_ANALYSIS_DEFS, SOLIDS_ANALYSIS_LINES } from "../fields";

const WHAT = "solids analysis";

function SolidsAnalysisActions({ sample }: { sample: SolidsAnalysis }) {
  const update = useUpdateSolidsAnalysis();
  const remove = useDeleteSolidsAnalysis();
  return (
    <SampleActions
      what={WHAT}
      defs={SOLIDS_ANALYSIS_DEFS}
      row={sample}
      update={bindMutation(update, (body) => ({ id: sample.id, body }))}
      remove={bindMutation(remove, () => sample.id)}
    />
  );
}

function SolidsAnalysisToolbar({ reportId }: { reportId: string }) {
  const samples = useSolidsAnalyses(reportId);
  const create = useCreateSolidsAnalysis();
  return (
    <NewSampleDialog
      what={WHAT}
      defs={SOLIDS_ANALYSIS_DEFS}
      create={create}
      reportId={reportId}
      full={(samples.data?.data.length ?? 0) >= 3}
    />
  );
}

function SolidsAnalysisSheet({ reportId }: { reportId: string }) {
  const samples = useSolidsAnalyses(reportId);

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
      lines={SOLIDS_ANALYSIS_LINES}
      isLoading={samples.isPending}
      emptyMessage="No solids analysiss in this report yet. Use “New sample” to add one."
      renderActions={(sample) => <SolidsAnalysisActions sample={sample} />}
    />
  );
}

export function SolidsAnalysisView() {
  return (
    <ReportSheetView
      title="Solids analysis"
      subject="solids analyses"
      toolbar={(reportId) => <SolidsAnalysisToolbar reportId={reportId} />}
      sheet={(reportId) => <SolidsAnalysisSheet reportId={reportId} />}
    />
  );
}
