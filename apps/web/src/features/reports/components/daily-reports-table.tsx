"use client";

import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { cn } from "cn";
import { formatHoleSize } from "schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DailyReport } from "../api";
import { DailyReportActionsMenu } from "./daily-report-actions-menu";

// No optional features (sorting, filtering, pagination): the server owns those.
const features = tableFeatures({});

const columnHelper = createColumnHelper<typeof features, DailyReport>();

const EMPTY_VALUE = "—";

const CENTERED_COLUMN_IDS = new Set([
  "report_no",
  "report_date",
  "section",
  "bit_depth_m",
  "bit_td_m",
  "bit_tvd_m",
]);

function alignClass(columnId: string) {
  return CENTERED_COLUMN_IDS.has(columnId) ? "text-center" : undefined;
}

const columns = columnHelper.columns([
  columnHelper.accessor("report_no", { header: "No." }),
  columnHelper.accessor("report_date", { header: "Date" }),
  columnHelper.accessor("well_name", { header: "Well" }),
  columnHelper.display({
    id: "section",
    header: "Section",
    cell: ({ row }) =>
      `${row.original.section_order} · ${formatHoleSize(row.original.section_hole_size)}`,
  }),
  columnHelper.accessor("bit_depth_m", {
    header: "Bit depth (m)",
    cell: (info) => info.getValue() ?? EMPTY_VALUE,
  }),
  columnHelper.accessor("bit_td_m", {
    header: "Bit TD (m)",
    cell: (info) => info.getValue() ?? EMPTY_VALUE,
  }),
  columnHelper.accessor("bit_tvd_m", {
    header: "Bit TVD (m)",
    cell: (info) => info.getValue() ?? EMPTY_VALUE,
  }),
  columnHelper.display({
    id: "actions",
    header: () => (
      <span className="flex items-center justify-end">Actions</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <DailyReportActionsMenu report={row.original} />
      </div>
    ),
  }),
]);

// Spacing of the shadcn data-table block: roomy rows, 16px of padding on the sides.
const HEAD_CELL = "px-2";
const BODY_CELL = "h-[68px] px-2";

const SKELETON_ROWS = 10;

/** With `isLoading`, the header stays and the body becomes placeholder rows. */
export function DailyReportsTable({
  data,
  emptyMessage,
  isLoading = false,
}: {
  data: DailyReport[];
  emptyMessage: string;
  isLoading?: boolean;
}) {
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (report) => report.id,
  });

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  scope="col"
                  className={cn(HEAD_CELL, alignClass(header.column.id))}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have no identity
              <TableRow key={index}>
                {table.getAllLeafColumns().map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(BODY_CELL, alignClass(column.id))}
                  >
                    <Skeleton
                      className={
                        column.id === "actions"
                          ? "ml-auto size-7"
                          : cn(
                              "h-4 w-3/4",
                              CENTERED_COLUMN_IDS.has(column.id) && "mx-auto",
                            )
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 px-2 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(BODY_CELL, alignClass(cell.column.id))}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
