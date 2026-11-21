"use client";

import { FileDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { formatHoleSize } from "schema";
import { Button } from "@/components/ui/button";
import { type InventoryRow, useInventory } from "@/features/inventory/api";
import { InventoryTable } from "@/features/inventory/components/inventory-table";
import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { useProjectFilter } from "@/features/projects/project-filter";
import type { DailyReport } from "@/features/reports/api";
import { ReportPicker } from "@/features/reports/components/report-picker";
import {
  type SelectedReport,
  useSelectedReport,
} from "@/features/reports/use-selected-report";
import { downloadSectionRecapPdf } from "../pdf/build-section-recap-pdf";
import { ProductsUsedTable } from "./products-used-table";

/** Builds the same two tables shown on screen into a PDF and downloads it. */
function ExportPdfButton({
  report,
  rows,
}: {
  report: DailyReport;
  rows: InventoryRow[];
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        downloadSectionRecapPdf({
          report,
          usedRows: rows.filter((row) => row.daily_used > 0),
          allRows: rows,
        })
      }
    >
      <FileDownIcon data-icon="inline-start" />
      Export PDF
    </Button>
  );
}

function Message({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl bg-card p-8 text-center text-muted-foreground">
      {children}
    </div>
  );
}

// The header line of each printed page: well, section and report, the same facts every section
// of the sheet is keyed by.
function ReportHeader({ report }: { report: DailyReport }) {
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
        Report:{" "}
        <span className="font-medium text-foreground">#{report.report_no}</span>
      </span>
      <span>
        Date:{" "}
        <span className="font-medium text-foreground">
          {report.report_date}
        </span>
      </span>
    </header>
  );
}

function RecapSheet({ report }: { report: DailyReport }) {
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

  const rows = inventory.data?.data ?? [];
  const usedRows = rows.filter((row) => row.daily_used > 0);
  const loadingMessage = inventory.isPending ? "Loading…" : undefined;

  return (
    <div className="mt-6 flex flex-col gap-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Products used — last 24 hrs</h3>
          <ReportHeader report={report} />
        </div>
        <div className="rounded-xl bg-card px-3 py-5">
          <ProductsUsedTable
            rows={usedRows}
            emptyMessage={
              loadingMessage ?? "No products were used in this report."
            }
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold">
          Wellsite chemical inventory
        </h3>
        <div className="rounded-xl bg-card px-3 py-5">
          <InventoryTable
            rows={rows}
            emptyMessage={loadingMessage ?? "No products in this report yet."}
          />
        </div>
      </section>
    </div>
  );
}

function RecapBody({
  projectId,
  selection,
}: {
  projectId: string | null;
  selection: SelectedReport;
}) {
  const { reports, report, isLoading } = selection;

  if (projectId === null) {
    return <Message>Select a project to see its recap.</Message>;
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
        recap appears here.
      </Message>
    );
  }

  return <RecapSheet report={report} />;
}

export function SectionRecapView() {
  const { projectId } = useProjectFilter();
  const selection = useSelectedReport(projectId);
  // Shared with the sheet through the query cache: no second request.
  const inventory = useInventory(selection.report?.id ?? null);

  return (
    <main className="px-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold">Section recap</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          <ReportPicker selection={selection} showSection />
          {selection.report && inventory.data && (
            <ExportPdfButton
              report={selection.report}
              rows={inventory.data.data}
            />
          )}
        </div>
      </div>

      <RecapBody projectId={projectId} selection={selection} />
    </main>
  );
}
