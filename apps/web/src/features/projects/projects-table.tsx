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
import { Button } from "@/components/ui/button";
import { ArchiveIcon, EyeIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// TEMPORARY: mirrors the API `projects` table. Replace with the Eden Treaty
// response type once the projects endpoint exists, so the two cannot drift.
export type Project = {
  id: string;
  name: string;
  operator: string;
  contractor: string;
  field: string | null;
  well: number | null;
  active_well: number | null;
  last_report: string | null;
  status: string;
};

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
  columnHelper.accessor("well", {
    header: "Wells",
    cell: (info) => info.getValue() ?? EMPTY_VALUE,
  }),
  columnHelper.accessor("active_well", {
    header: "Active wells",
    cell: (info) => info.getValue() ?? EMPTY_VALUE,
  }),
  columnHelper.accessor("last_report", {
    header: "Last report",
    cell: (info) => info.getValue() ?? EMPTY_VALUE,
  }),
  columnHelper.accessor("status", { header: "Status" }),
  columnHelper.display({
    id: "actions", 
    header: () => <span className="flex items-center justify-end">Actions</span>,
    cell: ({ row }) => (<div className="flex items-center justify-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${row.original.name}`}
            />
          }
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex min-w-52 flex-col gap-1 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Project actions</DropdownMenuLabel>
          </DropdownMenuGroup>
     
          <DropdownMenuItem className="px-2 py-2">
            <EyeIcon />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem className="px-2 py-2">
            <PencilIcon />
            Edit project
          </DropdownMenuItem>
          <DropdownMenuItem className="px-2 py-2">
            <ArchiveIcon />
            Archive project
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" className="px-2 py-2">
            <Trash2Icon />
            Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>)
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
                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
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
                <TableCell key={cell.id} className={alignClass(cell.column.id)}>
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
