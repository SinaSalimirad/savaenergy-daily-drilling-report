"use client";

import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
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
  "well",
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
  // TODO: WE WILL HAVE THESE PART BUT in Future and when Implementing `WELL SCHEMA`, Skip for now
  // columnHelper.accessor("well", {
  //   header: "Wells",
  //   cell: (info) => info.getValue() ?? EMPTY_VALUE,
  // }),
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
        <ProjectActionsMenu project={row.original} />
      </div>
    ),
  }),
]);

export function ProjectsTable({ data }: { data: Project[] }) {
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (project) => project.id,
  });

  return (
    <div className="bg-card p-4 rounded-lg">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  scope="col"
                  className={alignClass(header.column.id)}
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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No projects yet.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={alignClass(cell.column.id)}
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
