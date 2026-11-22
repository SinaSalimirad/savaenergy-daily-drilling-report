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
import { EMPTY_VALUE } from "../fields";

export type SampleLike = {
  id: string;
  sample_no: number;
  sample_time: string | null;
};

/** One line of the sheet: a property, with its value in every sample. */
export type SheetLine<TSample> = {
  label: string;
  unit?: string;
  // Computed by the server, not typed in: shown in a lighter style.
  computed?: boolean;
  value: (sample: TSample) => string;
};

const SKELETON_COLUMNS = 3;
const SKELETON_LINES = 8;

/**
 * The sheet of the rig: one line per property and one column per sample (at most 3), each with
 * its time and its actions.
 */
export function SampleSheetTable<TSample extends SampleLike>({
  samples,
  lines,
  isLoading = false,
  emptyMessage,
  renderActions,
}: {
  samples: TSample[];
  lines: SheetLine<TSample>[];
  isLoading?: boolean;
  emptyMessage: string;
  renderActions: (sample: TSample) => ReactNode;
}) {
  if (!isLoading && samples.length === 0) {
    return (
      <p className="h-24 px-2 pt-8 text-center text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="px-2">
            Property
          </TableHead>
          <TableHead scope="col" className="px-2">
            Unit
          </TableHead>
          {isLoading
            ? Array.from({ length: SKELETON_COLUMNS }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholder columns have no identity
                <TableHead key={index} scope="col" className="px-2">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              ))
            : samples.map((sample) => (
                <TableHead key={sample.id} scope="col" className="px-2">
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      Sample {sample.sample_no}
                      <span className="block font-normal text-muted-foreground text-xs normal-case">
                        {sample.sample_time ?? EMPTY_VALUE}
                      </span>
                    </span>
                    {renderActions(sample)}
                  </div>
                </TableHead>
              ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: SKELETON_LINES }, (_, line) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have no identity
              <TableRow key={line}>
                {Array.from({ length: SKELETON_COLUMNS + 2 }, (_, cell) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: placeholder cells have no identity
                  <TableCell key={cell} className="h-10 px-2">
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : lines.map((line) => (
              <TableRow key={`${line.label}-${line.unit ?? ""}`}>
                <TableCell
                  className={`h-10 px-2 font-medium ${line.computed ? "text-muted-foreground" : ""}`}
                >
                  {line.label}
                </TableCell>
                <TableCell className="px-2 text-muted-foreground">
                  {line.unit ?? ""}
                </TableCell>
                {samples.map((sample) => (
                  <TableCell
                    key={sample.id}
                    className={`px-2 tabular-nums ${line.computed ? "text-muted-foreground" : ""}`}
                  >
                    {line.value(sample)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
