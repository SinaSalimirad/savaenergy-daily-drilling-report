"use client";

import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project } from "../api";
import { ProjectActionsMenu } from "./project-actions-menu";

// No optional features (sorting, filtering, pagination) yet: the server will
// own those, and every feature we enable adds code we have to maintain.
const features = tableFeatures({});

const columnHelper = createColumnHelper<typeof features, Project>();

const EMPTY_VALUE = "—";

// Numeric/date columns read better centered than left-aligned.
const CENTERED_COLUMN_IDS = new Set([
  "field",
  "currency",
  "wells",
  "active_well",
  "last_report",
  "status",
]);

function alignClass(columnId: string) {
  return CENTERED_COLUMN_IDS.has(columnId) ? "text-center" : undefined;
}

const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Project" }),
  columnHelper.accessor("operator", { header: "Operator(s)" }),
  columnHelper.accessor("contractor", { header: "Contractor(s)" }),
  columnHelper.accessor("field", {
    header: "Field",
    cell: (info) => info.getValue() ?? EMPTY_VALUE,
  }),
  columnHelper.accessor("currency", { header: "Currency" }),
  columnHelper.accessor("wells", { header: "Wells" }),
  // TODO: WE WILL HAVE THESE PART BUT in Future and when Implementing `WELL SCHEMA`, Skip for now
  // columnHelper.accessor("active_well", {
  //   header: "Active wells",
  //   cell: (info) => info.getValue() ?? EMPTY_VALUE,
  // }),
  // columnHelper.accessor("last_report", {
  //   header: "Last report",
  //   cell: (info) => info.getValue() ?? EMPTY_VALUE,
  // }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.display({
    id: "actions",
    header: () => (
      <span className="flex items-center justify-end">Actions</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <ProjectActionsMenu project={row.original} />
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
export function ProjectsTable({
  data,
  emptyMessage,
  isLoading = false,
}: {
  data: Project[];
  emptyMessage: string;
  isLoading?: boolean;
}) {
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (project) => project.id,
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
