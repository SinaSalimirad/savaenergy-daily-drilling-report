"use client";

import {
  type RowColumn,
  RowTable,
} from "../../hydraulics/components/row-table";
import { formatNumber } from "../../hydraulics/format";
import type { VolumeSheet } from "../api";

type Item = { key: keyof VolumeSheet["daily"]; label: string; bold?: boolean };
type Line = Item & { id: string };

/**
 * The lines of the sheet with their three columns: the report, its section and its well. The
 * end volume has no total: it is the volume of that day.
 */
export function VolumeTable({
  sheet,
  items,
}: {
  sheet: VolumeSheet;
  items: Item[];
}) {
  const lines: Line[] = items.map((item) => ({
    ...item,
    id: `${item.key}-${item.label}`,
  }));
  const cell = (line: Line, group: "daily" | "section" | "well") => {
    if (line.key === "end_volume" && group !== "daily") return "—";
    const text = formatNumber(sheet[group][line.key], 2);
    return line.bold ? <strong>{text}</strong> : text;
  };

  const columns: RowColumn<Line>[] = [
    {
      header: "Item (bbl)",
      render: (line) =>
        line.bold ? <strong>{line.label}</strong> : line.label,
    },
    { header: "Daily", render: (line) => cell(line, "daily") },
    {
      header: "Section",
      computed: true,
      render: (line) => cell(line, "section"),
    },
    { header: "Well", computed: true, render: (line) => cell(line, "well") },
  ];
  return <RowTable rows={lines} columns={columns} emptyMessage="No items." />;
}
