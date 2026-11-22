"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type RowColumn<TRow> = {
  header: string;
  render: (row: TRow) => ReactNode;
  // A computed column: shown in a lighter style.
  computed?: boolean;
};

const SKELETON_ROWS = 4;

/** A plain table of rows with an "actions" column and an optional footer line. */
export function RowTable<TRow extends { id: string }>({
  rows,
  columns,
  isLoading = false,
  emptyMessage,
  renderActions,
  footer,
}: {
  rows: TRow[];
  columns: RowColumn<TRow>[];
  isLoading?: boolean;
  emptyMessage: string;
  renderActions?: (row: TRow) => ReactNode;
  // One cell per column, in order.
  footer?: ReactNode[];
}) {
  const columnCount = columns.length + (renderActions ? 1 : 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.header} scope="col" className="px-2">
              {column.header}
            </TableHead>
          ))}
          {renderActions && (
            <TableHead scope="col" className="px-2 text-right">
              Actions
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: SKELETON_ROWS }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have no identity
            <TableRow key={index}>
              {Array.from({ length: columnCount }, (_, cell) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholder cells have no identity
                <TableCell key={cell} className="h-10 px-2">
                  <Skeleton className="h-4 w-3/4" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        {!isLoading && rows.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="h-24 px-2 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
        {!isLoading &&
          rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  key={column.header}
                  className={`h-10 px-2 tabular-nums ${column.computed ? "text-muted-foreground" : ""}`}
                >
                  {column.render(row)}
                </TableCell>
              ))}
              {renderActions && (
                <TableCell className="px-2">
                  <div className="flex items-center justify-end gap-1">
                    {renderActions(row)}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
      </TableBody>
      {footer && !isLoading && rows.length > 0 && (
        <TableFooter>
          <TableRow>
            {footer.map((cell, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: footer cells are fixed by column
              <TableCell key={index} className="px-2 font-medium tabular-nums">
                {cell}
              </TableCell>
            ))}
            {renderActions && <TableCell />}
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}
