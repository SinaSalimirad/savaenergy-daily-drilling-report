"use client";

import { cn } from "cn";
import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { packageText } from "@/features/project-products/labels";
import type { InventoryRow } from "../api";

const EMPTY_VALUE = "—";

// The sheet has two header levels (a group name over its sub-columns), so the header is written
// by hand with rowSpan/colSpan. This is a fixed report, not a generic data table.
const HEAD = "px-3 text-center";
// First column of each group gets a heavier left edge, like the vertical rules in the sheet.
const GROUP_START = "border-l-2 border-foreground/40";
// Daily received/used are the cells the user will type into, so they are tinted like the sheet.
const INPUT_TINT = "bg-amber-100/70 dark:bg-amber-400/10";

function money(value: number | null) {
  return value === null ? EMPTY_VALUE : value.toLocaleString("en-US");
}

function InventoryRowCells({
  row,
  index,
}: {
  row: InventoryRow;
  index: number;
}) {
  const numeric = "text-center tabular-nums";
  return (
    <>
      <TableCell className="text-center text-muted-foreground">
        {index + 1}
      </TableCell>
      <TableCell className="font-medium">{row.product.name}</TableCell>
      <TableCell className="text-center">
        {packageText(row.product) ?? EMPTY_VALUE}
      </TableCell>
      <TableCell className={numeric}>{money(row.unit_price)}</TableCell>

      <TableCell className={cn(numeric, GROUP_START)}>
        {row.initial_stock}
      </TableCell>

      <TableCell className={cn(numeric, GROUP_START, INPUT_TINT)}>
        {row.daily_received}
      </TableCell>
      <TableCell className={cn(numeric, INPUT_TINT)}>
        {row.daily_used}
      </TableCell>

      <TableCell className={cn(numeric, GROUP_START)}>
        {row.section_used}
      </TableCell>

      <TableCell className={cn(numeric, GROUP_START)}>
        {row.monthly_received}
      </TableCell>
      <TableCell className={numeric}>{row.monthly_used}</TableCell>

      <TableCell className={cn(numeric, GROUP_START)}>
        {row.cumulative_received}
      </TableCell>
      <TableCell className={numeric}>{row.cumulative_used}</TableCell>
      <TableCell className={numeric}>{row.cumulative_returned}</TableCell>

      <TableCell className={cn(numeric, GROUP_START, "font-medium")}>
        {row.final_stock}
      </TableCell>
      <TableCell className={cn(numeric, GROUP_START)}>
        {money(row.daily_cost)}
      </TableCell>
    </>
  );
}

export function InventoryTable({
  rows,
  emptyMessage,
  renderActions,
}: {
  rows: InventoryRow[];
  emptyMessage: string;
  // When given, a last column holds this for every row (the edit and remove menu).
  renderActions?: (row: InventoryRow) => ReactNode;
}) {
  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2} scope="col" className={HEAD}>
              No.
            </TableHead>
            <TableHead
              rowSpan={2}
              scope="col"
              className={cn(HEAD, "text-left")}
            >
              Product name
            </TableHead>
            <TableHead rowSpan={2} scope="col" className={HEAD}>
              Package
            </TableHead>
            <TableHead rowSpan={2} scope="col" className={HEAD}>
              Unit price
            </TableHead>
            <TableHead
              rowSpan={2}
              scope="col"
              className={cn(HEAD, GROUP_START)}
            >
              Initial stock
            </TableHead>
            <TableHead
              colSpan={2}
              scope="colgroup"
              className={cn(HEAD, GROUP_START)}
            >
              Daily
            </TableHead>
            <TableHead
              rowSpan={2}
              scope="col"
              className={cn(HEAD, GROUP_START)}
            >
              Section used
            </TableHead>
            <TableHead
              colSpan={2}
              scope="colgroup"
              className={cn(HEAD, GROUP_START)}
            >
              Monthly
            </TableHead>
            <TableHead
              colSpan={3}
              scope="colgroup"
              className={cn(HEAD, GROUP_START)}
            >
              Cumulative
            </TableHead>
            <TableHead
              rowSpan={2}
              scope="col"
              className={cn(HEAD, GROUP_START)}
            >
              Final stock
            </TableHead>
            <TableHead
              rowSpan={2}
              scope="col"
              className={cn(HEAD, GROUP_START)}
            >
              Daily cost
            </TableHead>
            {renderActions && (
              <TableHead
                rowSpan={2}
                scope="col"
                className={cn(HEAD, GROUP_START)}
              >
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
          <TableRow>
            <TableHead scope="col" className={cn(HEAD, GROUP_START)}>
              Rec.
            </TableHead>
            <TableHead scope="col" className={HEAD}>
              Used
            </TableHead>
            <TableHead scope="col" className={cn(HEAD, GROUP_START)}>
              Rec.
            </TableHead>
            <TableHead scope="col" className={HEAD}>
              Used
            </TableHead>
            <TableHead scope="col" className={cn(HEAD, GROUP_START)}>
              Rec.
            </TableHead>
            <TableHead scope="col" className={HEAD}>
              Used
            </TableHead>
            <TableHead scope="col" className={HEAD}>
              Return
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={renderActions ? 16 : 15}
                className="h-24 px-2 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={row.id}>
                <InventoryRowCells row={row} index={index} />
                {renderActions && (
                  <TableCell className={cn("text-center", GROUP_START)}>
                    {renderActions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
