"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { useProjectFilter } from "@/features/projects/project-filter";
import { ReportPicker } from "@/features/reports/components/report-picker";
import { useSelectedReport } from "@/features/reports/use-selected-report";
import { usePitReadings } from "../api";
import { NewPitReadingDialog } from "./new-pit-reading-dialog";
import { PitReadingActions } from "./pit-reading-actions";
import { PitReadingsSummary } from "./pit-readings-summary";
import { PitReadingsTable } from "./pit-readings-table";

function Message({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl bg-card p-8 text-center text-muted-foreground">
      {children}
    </div>
  );
}

function PitReadingsSheet({ reportId }: { reportId: string }) {
  const readings = usePitReadings(reportId);

  if (readings.isError) {
    return (
      <div className="flex items-center gap-3 p-4">
        <p className="text-destructive">{readings.error.message}</p>
        <Button variant="outline" onClick={() => readings.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  const rows = readings.data?.data ?? [];
  return (
    <>
      <PitReadingsTable
        readings={rows}
        isLoading={readings.isPending}
        emptyMessage="No pit readings in this report yet. Use “New reading” to add one."
        renderActions={(reading) => <PitReadingActions reading={reading} />}
      />
      {rows.length > 0 && <PitReadingsSummary readings={rows} />}
    </>
  );
}

function PitReadingsBody({
  projectId,
  selection,
}: {
  projectId: string | null;
  selection: ReturnType<typeof useSelectedReport>;
}) {
  const { reports, report, isLoading } = selection;

  if (projectId === null) {
    return <Message>Select a project to see its pit readings.</Message>;
  }
  if (reports.isError) {
    return (
      <Message>
        <span className="text-destructive">{reports.error.message}</span>{" "}
        <Button variant="outline" onClick={() => reports.refetch()}>
          Try again
        </Button>
      </Message>
    );
  }
  if (isLoading) return <Message>Loading reports…</Message>;
  if (!report) {
    return (
      <Message>
        This project has no daily reports yet. Create a report first, then its
        pit readings appear here.
      </Message>
    );
  }

  return (
    <div className="mt-6 rounded-xl bg-card px-3 py-5">
      <PitReadingsSheet reportId={report.id} />
    </div>
  );
}

export function PitReadingsView() {
  const { projectId } = useProjectFilter();
  const selection = useSelectedReport(projectId);
  const reportId = selection.isLoading ? undefined : selection.report?.id;
  // Shared with the sheet through the query cache: no second request.
  const readings = usePitReadings(reportId ?? null);

  return (
    <main className="px-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold">Pit readings</h2>

        <div className="flex flex-wrap items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          {reportId && (
            <NewPitReadingDialog
              reportId={reportId}
              existingPitIds={(readings.data?.data ?? []).map(
                (reading) => reading.pit_id,
              )}
            />
          )}
          <ReportPicker selection={selection} showSection />
        </div>
      </div>

      <PitReadingsBody projectId={projectId} selection={selection} />
    </main>
  );
}
