"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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
 * The user picks a well, then one of its reports (newest first, the newest by default). Only the
 * 100 newest reports of the project are listed, so a well with none among them is not offered.
 */
function useSelectedReport(projectId: string | null) {
  // The API allows at most 100 per page.
  const reports = useDailyReports({
    page: 1,
    pageSize: 100,
    projectId: projectId ?? undefined,
    enabled: projectId !== null,
  });
  const list = reports.data?.data ?? [];

  // A choice that is no longer in the list (another project, a deleted report) is ignored.
  const [chosenWellId, setChosenWellId] = useState<string | null>(null);
  const [chosenReportId, setChosenReportId] = useState<string | null>(null);

  const wells = [
    ...new Map(list.map((item) => [item.well_id, item.well_name])),
  ].map(([id, name]) => ({ id, name }));
  const well = wells.find((item) => item.id === chosenWellId) ?? wells[0];
  const wellReports = list.filter((item) => item.well_id === well?.id);
  const report =
    wellReports.find((item) => item.id === chosenReportId) ?? wellReports[0];

  return {
    reports,
    wells,
    well,
    wellReports,
    report,
    selectWell: (id: string) => {
      setChosenWellId(id);
      setChosenReportId(null); // the old report belongs to the old well
    },
    selectReport: setChosenReportId,
    // While the previous project's list is still shown, it is not this project's.
    isLoading: reports.isPending || reports.isPlaceholderData,
  };
}

// A button that opens a list, like "Well: SP14". It looks like the buttons beside the title.
function PickerButton({
  label,
  shown,
  options,
  value,
  onChange,
}: {
  label: string;
  shown: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(next) => next && onChange(next)}
    >
      <SelectTrigger
        aria-label={label}
        className="h-10 w-auto gap-3 border-0 bg-card px-4 font-medium"
      >
        <span>
          <span className="text-muted-foreground">{label}: </span>
          {shown}
        </span>
      </SelectTrigger>
      <SelectContent className="min-w-40">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
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
  const { reports, wells, well, wellReports, report, isLoading } = selection;

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
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <PickerButton
          label="Well"
          shown={well?.name ?? ""}
          options={wells.map((item) => ({ value: item.id, label: item.name }))}
          value={well?.id ?? ""}
          onChange={selection.selectWell}
        />
        <PickerButton
          label="Report"
          shown={`#${report.report_no}`}
          options={wellReports.map((item) => ({
            value: item.id,
            label: `#${item.report_no} · ${item.report_date}`,
          }))}
          value={report.id}
          onChange={selection.selectReport}
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
