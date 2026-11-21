"use client";

import type { ReactNode } from "react";
import { formatHoleSize } from "schema";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/features/inventory/api";
import { InventoryTable } from "@/features/inventory/components/inventory-table";
import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { useProjectFilter } from "@/features/projects/project-filter";
import type { DailyReport } from "@/features/reports/api";
import { ReportPicker } from "@/features/reports/components/report-picker";
import {
  type SelectedReport,
  useSelectedReport,
} from "@/features/reports/use-selected-report";

function Message({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl bg-card p-8 text-center text-muted-foreground">
      {children}
    </div>
  );
}

// The well's cumulative numbers are only correct as of its newest report: a product's
// "Cumulative" column there already sums every report of the well up to that day.
function AsOfHeader({ report }: { report: DailyReport }) {
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
      <span>
        Well:{" "}
        <span className="font-medium text-foreground">{report.well_name}</span>
      </span>
      <span>
        Section:{" "}
        <span className="font-medium text-foreground">
          {report.section_order} · {formatHoleSize(report.section_hole_size)}
        </span>
      </span>
      <span>
        As of report:{" "}
        <span className="font-medium text-foreground">
          #{report.report_no} · {report.report_date}
        </span>
      </span>
    </header>
  );
}

function WellRecapSheet({ report }: { report: DailyReport }) {
  const inventory = useInventory(report.id);

  if (inventory.isError) {
    return (
      <div className="flex items-center gap-3 p-4">
        <p className="text-destructive">{inventory.error.message}</p>
        <Button variant="outline" onClick={() => inventory.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <AsOfHeader report={report} />
      <div className="rounded-xl bg-card px-3 py-5">
        <InventoryTable
          rows={inventory.data?.data ?? []}
          emptyMessage={
            inventory.isPending ? "Loading…" : "This well has no products yet."
          }
        />
      </div>
    </div>
  );
}

function WellRecapBody({
  projectId,
  selection,
}: {
  projectId: string | null;
  selection: SelectedReport;
}) {
  const { reports, report, isLoading } = selection;

  if (projectId === null) {
    return <Message>Select a project to see its well recap.</Message>;
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
        well recap appears here.
      </Message>
    );
  }

  return <WellRecapSheet report={report} />;
}

export function WellRecapView() {
  const { projectId } = useProjectFilter();
  const selection = useSelectedReport(projectId);

  return (
    <main className="px-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold">Well recap</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          <ReportPicker selection={selection} showReport={false} />
        </div>
      </div>

      <WellRecapBody projectId={projectId} selection={selection} />
    </main>
  );
}
