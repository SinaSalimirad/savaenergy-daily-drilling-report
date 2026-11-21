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
import type { Pump } from "../api";
import { formatTwoDecimals, pumpTypeLabel } from "../labels";
import { PumpActionsMenu } from "./pump-actions-menu";

// No optional features (sorting, filtering, pagination): the server owns those, and the
// order of the rows is the order of the pumps.
const features = tableFeatures({});

const columnHelper = createColumnHelper<typeof features, Pump>();

const EMPTY_VALUE = "—";

// The columns of the rig's sheet, with the numbers centered so they line up.
const CENTERED_COLUMN_IDS = new Set([
  "sort_order",
  "stroke_length",
  "efficiency",
  "liner_diameter",
  "type",
  "gal_per_stroke",
]);

function alignClass(columnId: string) {
  return CENTERED_COLUMN_IDS.has(columnId) ? "text-center" : undefined;
}

const columns = columnHelper.columns([
  columnHelper.accessor("sort_order", { header: "Row" }),
  columnHelper.accessor("model", { header: "Model" }),
  columnHelper.accessor("project_name", { header: "Project" }),
  columnHelper.accessor("stroke_length", {
    header: "Stroke length (in)",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("efficiency", {
    header: "Eff. %",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("liner_diameter", {
    header: "Liner dia (in)",
    cell: (info) => formatTwoDecimals(info.getValue()),
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: (info) => pumpTypeLabel(info.getValue()),
  }),
  columnHelper.accessor("gal_per_stroke", {
    header: "Gal/Stroke",
    cell: (info) => {
      const value = info.getValue();
      return value === null ? EMPTY_VALUE : formatTwoDecimals(value);
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => (
      <span className="flex items-center justify-end">Actions</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <PumpActionsMenu pump={row.original} />
      </div>
    ),
  }),
]);

// Spacing of the shadcn data-table block: roomy rows, 16px of padding on the sides.
const HEAD_CELL = "px-2";
const BODY_CELL = "h-[68px] px-2";

const SKELETON_ROWS = 10;

/**
 * With `isLoading`, the header stays and the body becomes placeholder rows, so the page
 * does not jump when the data arrives.
 */
export function PumpsTable({
  data,
  emptyMessage,
  isLoading = false,
}: {
  data: Pump[];
  emptyMessage: string;
  isLoading?: boolean;
}) {
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (pump) => pump.id,
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
