"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/select";
import { ProjectProductsDialog } from "@/features/project-products/components/project-products-dialog";
import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { useProjectFilter } from "@/features/projects/project-filter";
import { useDailyReports } from "@/features/reports/api";
import { useInventory } from "../api";
import { InventoryRowActions } from "./inventory-row-actions";
import { InventoryTable } from "./inventory-table";
import { NewInventoryRowDialog } from "./new-inventory-row-dialog";

function Message({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl bg-card p-8 text-center text-muted-foreground">
      {children}
    </div>
  );
}

/**
 * The sheet belongs to one daily report: its day, its section and its well decide the numbers.
 * The report is chosen from the newest reports of the selected project.
 */
function useSelectedReport(projectId: string | null) {
  // The API allows at most 100 per page: the select lists the 100 newest reports.
  const reports = useDailyReports({
    page: 1,
    pageSize: 100,
    projectId: projectId ?? undefined,
    enabled: projectId !== null,
  });
  const list = reports.data?.data ?? [];

  // The chosen report, or the newest one while none is chosen or it left the list (another
  // project was selected, or the report was deleted).
  const [chosenId, setChosenId] = useState<string | null>(null);
  const report = list.find((item) => item.id === chosenId) ?? list[0];

  return {
    reports,
    list,
    report,
    select: setChosenId,
    // While the previous project's list is still shown, it is not this project's.
    isLoading: reports.isPending || reports.isPlaceholderData,
  };
}

function InventorySheet({ reportId }: { reportId: string }) {
  const inventory = useInventory(reportId);

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
    <InventoryTable
      rows={inventory.data?.data ?? []}
      emptyMessage={
        inventory.isPending
          ? "Loading inventory…"
          : "No products in this report yet. Use “New row” to add one."
      }
      renderActions={(row) => <InventoryRowActions row={row} />}
    />
  );
}

function InventoryBody({
  projectId,
  selection,
}: {
  projectId: string | null;
  selection: ReturnType<typeof useSelectedReport>;
}) {
  const { reports, list, report, select, isLoading } = selection;

  if (projectId === null) {
    return <Message>Select a project to see its inventory.</Message>;
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
        inventory appears here.
      </Message>
    );
  }

  return (
    <>
      <div className="mt-4 max-w-md">
        <SimpleSelect
          options={list.map((item) => ({
            value: item.id,
            label: `${item.well_name} · Report #${item.report_no} · ${item.report_date}`,
          }))}
          value={report.id}
          onValueChange={(value) => value && select(value)}
          aria-label="Daily report"
        />
      </div>
      <div className="mt-6 rounded-xl bg-card px-3 py-5">
        <InventorySheet reportId={report.id} />
      </div>
    </>
  );
}

export function InventoryView() {
  const { projectId } = useProjectFilter();
  const selection = useSelectedReport(projectId);
  const reportId = selection.isLoading ? undefined : selection.report?.id;
  // Shared with the sheet through the query cache: no second request.
  const inventory = useInventory(reportId ?? null);

  return (
    <main className="px-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold">Inventory</h2>

        <div className="flex items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          <ProjectProductsDialog />
          {reportId && (
            <NewInventoryRowDialog
              reportId={reportId}
              existingProjectProductIds={(inventory.data?.data ?? []).map(
                (row) => row.project_product_id,
              )}
            />
          )}
        </div>
      </div>

      <InventoryBody projectId={projectId} selection={selection} />
    </main>
  );
}
