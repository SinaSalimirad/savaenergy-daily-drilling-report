"use client";

import { cn } from "cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryRow } from "@/features/inventory/api";
import { packageText } from "@/features/project-products/labels";

const EMPTY_VALUE = "—";
const HEAD = "px-3 text-center";

function money(value: number | null) {
  return value === null ? EMPTY_VALUE : value.toLocaleString("en-US");
}

/**
 * The compact products table of the printed daily report: only what was used that day, the
 * stock left and its cost. The full breakdown (initial stock, monthly and cumulative totals)
 * is the Inventory page's table; this is "Products used last 24 hrs".
 */
export function ProductsUsedTable({
  rows,
  emptyMessage,
}: {
  rows: InventoryRow[];
  emptyMessage: string;
}) {
  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col" className={HEAD}>
              No.
            </TableHead>
            <TableHead scope="col" className={cn(HEAD, "text-left")}>
              Product name
            </TableHead>
            <TableHead scope="col" className={HEAD}>
              Package
            </TableHead>
            <TableHead scope="col" className={HEAD}>
              Used
            </TableHead>
            <TableHead scope="col" className={HEAD}>
              Final
            </TableHead>
            <TableHead scope="col" className={HEAD}>
              Cost
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 px-2 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell className="text-center text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  {row.product.name}
                </TableCell>
                <TableCell className="text-center">
                  {packageText(row.product) ?? EMPTY_VALUE}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {row.daily_used}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {row.final_stock}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {money(row.daily_cost)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
