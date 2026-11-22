"use client";

import type { SaltType } from "schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SaltTableRow } from "../api";
import { cationLabel } from "../labels";

const SKELETON_ROWS = 10;

// Two-line headers as on the sheet: the name, then its unit.
function getColumns(saltType: SaltType) {
  return [
    {
      id: "weight",
      name: "Weight",
      unit: "%",
      format: (row: SaltTableRow) => row.weight_percent.toString(),
    },
    {
      id: "density-kg",
      name: "Density",
      unit: "(kg/l)",
      format: (row: SaltTableRow) => row.density_kg_l.toFixed(3),
    },
    {
      id: "density-lb",
      name: "Density",
      unit: "(lb/gal)",
      format: (row: SaltTableRow) => row.density_lb_gal.toFixed(2),
    },
    {
      id: "chloride",
      name: "Cl–",
      unit: "(mg/l)",
      format: (row: SaltTableRow) => row.chloride_mg_l.toLocaleString("en-US"),
    },
    {
      id: "cation",
      name: cationLabel(saltType),
      unit: "(mg/l)",
      format: (row: SaltTableRow) => row.cation_mg_l.toLocaleString("en-US"),
    },
    {
      id: "salt",
      name: saltType,
      unit: "(lb/bbl)",
      format: (row: SaltTableRow) => row.salt_lb_bbl.toFixed(1),
    },
    {
      id: "water",
      name: "Water",
      unit: "(bbl)",
      format: (row: SaltTableRow) => row.water_bbl.toFixed(3),
    },
    {
      id: "crystallization",
      name: "Cryst. Pt.",
      unit: "(°F)",
      format: (row: SaltTableRow) => row.crystallization_point_f.toFixed(1),
    },
    {
      id: "activity",
      name: "Water",
      unit: "Activity",
      format: (row: SaltTableRow) => row.water_activity.toFixed(3),
    },
    {
      id: "solid-sg",
      name: "Solid",
      unit: "Ave S.G",
      format: (row: SaltTableRow) => row.solid_average_sg.toFixed(3),
    },
  ];
}

export function SaltTable({
  saltType,
  data,
  isLoading = false,
}: {
  saltType: SaltType;
  data: SaltTableRow[];
  isLoading?: boolean;
}) {
  const columns = getColumns(saltType);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.id} scope="col" className="px-2 text-center">
              <span className="block">{column.name}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {column.unit}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have no identity
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.id} className="h-10 px-2">
                    <Skeleton className="mx-auto h-4 w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className="h-10 px-2 text-center tabular-nums"
                  >
                    {column.format(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
