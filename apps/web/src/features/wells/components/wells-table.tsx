"use client";

import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Well } from "../api";
import { WellActionsMenu } from "./well-actions-menu";

// No optional features (sorting, filtering, pagination) yet: the server will
// own those, and every feature we enable adds code we have to maintain.
const features = tableFeatures({});

const columnHelper = createColumnHelper<typeof features, Well>();

const EMPTY_VALUE = "—";

// Numeric/date columns read better centered than left-aligned.
const CENTERED_COLUMN_IDS = new Set([
  "rig_type",
  "designation",
  "well_type",
  "spud_date",
  "water_depth",
  "status",
]);

function alignClass(columnId: string) {
  return CENTERED_COLUMN_IDS.has(columnId) ? "text-center" : undefined;
}

const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Well" }),
  columnHelper.accessor("project_name", { header: "Project" }),
  columnHelper.accessor("rig_name", { header: "Rig" }),
  columnHelper.accessor("rig_type", {
    header: "Rig type",
    cell: (info) => <span className="capitalize">{info.getValue()}</span>,
  }),
  columnHelper.accessor("designation", {
    header: "Designation",
    cell: (info) => (
      <span className="capitalize">{info.getValue() ?? EMPTY_VALUE}</span>
    ),
  }),
  columnHelper.accessor("well_type", {
    header: "Type",
    cell: (info) => (
      <span className="capitalize">{info.getValue() ?? EMPTY_VALUE}</span>
    ),
  }),
  columnHelper.accessor("spud_date", {
    header: "Spud date",
    cell: (info) => info.getValue() ?? EMPTY_VALUE,
  }),
  columnHelper.accessor("water_depth", {
    header: "Water depth",
    cell: (info) => info.getValue() ?? EMPTY_VALUE,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    // The API stores lowercase values; the label is only a display concern.
    cell: (info) => <span className="capitalize">{info.getValue()}</span>,
  }),
  columnHelper.display({
    id: "actions",
    header: () => (
      <span className="flex items-center justify-end">Actions</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <WellActionsMenu well={row.original} />
      </div>
    ),
  }),
]);

// Spacing of the shadcn data-table block: roomy rows, 16px of padding on the sides.
const HEAD_CELL = "px-4";
const BODY_CELL = "h-[53px] px-4";

const SKELETON_ROWS = 10;

/**
 * With `isLoading`, the header stays and the body becomes placeholder rows, so the page
 * does not jump when the data arrives.
 */
export function WellsTable({
  data,
  emptyMessage,
  isLoading = false,
}: {
  data: Well[];
  emptyMessage: string;
  isLoading?: boolean;
}) {
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (well) => well.id,
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
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
                className="h-24 px-4 text-center text-muted-foreground"
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
