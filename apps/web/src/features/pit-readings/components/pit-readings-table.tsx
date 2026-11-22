"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pitTypeLabel } from "@/features/pits/labels";
import type { PitReading } from "../api";
import { EMPTY_VALUE, formatAmount } from "../labels";

const HEADERS = [
  "Row",
  "Pit",
  "Capacity (bbl)",
  "Pit type",
  "Volume (bbl)",
  "MW (pcf)",
  "Mud type",
  "Tonnage (MT)",
];
const SKELETON_ROWS = 6;

const orDash = (value: number | null) =>
  value === null ? EMPTY_VALUE : formatAmount(value);

export function PitReadingsTable({
  readings,
  isLoading = false,
  emptyMessage,
  renderActions,
}: {
  readings: PitReading[];
  isLoading?: boolean;
  emptyMessage: string;
  renderActions: (reading: PitReading) => ReactNode;
}) {
  const columnCount = HEADERS.length + 1;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {HEADERS.map((header) => (
            <TableHead key={header} scope="col" className="px-2">
              {header}
            </TableHead>
          ))}
          <TableHead scope="col" className="px-2 text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: SKELETON_ROWS }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have no identity
            <TableRow key={index}>
              {Array.from({ length: columnCount }, (_, cell) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholder cells have no identity
                <TableCell key={cell} className="h-12 px-2">
                  <Skeleton className="h-4 w-3/4" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : readings.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="h-24 px-2 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          readings.map((reading) => (
            <TableRow key={reading.id}>
              <TableCell className="h-12 px-2">{reading.pit_order}</TableCell>
              <TableCell className="px-2">{reading.pit_name}</TableCell>
              <TableCell className="px-2">
                {orDash(reading.pit_capacity)}
              </TableCell>
              <TableCell className="px-2">
                {pitTypeLabel(reading.pit_type)}
              </TableCell>
              <TableCell className="px-2">
                {formatAmount(reading.volume)}
              </TableCell>
              <TableCell className="px-2">
                {orDash(reading.mud_weight)}
              </TableCell>
              <TableCell className="px-2">
                {reading.mud_type ?? EMPTY_VALUE}
              </TableCell>
              <TableCell className="px-2">{orDash(reading.tonnage)}</TableCell>
              <TableCell className="px-2">
                <div className="flex items-center justify-end gap-1">
                  {renderActions(reading)}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
