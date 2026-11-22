import { totalFlowArea } from "../hydraulics/hydraulics.calc";
import type { BitRow } from "./bit.repository";

/** The shape the web app receives, through Eden. The total flow area is computed. */
export type BitDto = Omit<BitRow, "created_at" | "updated_at"> & {
  // Square inches: the area of all the nozzles together.
  tfa_in2: number;
  created_at: string;
  updated_at: string;
};

export function toBitDto(row: BitRow): BitDto {
  return {
    ...row,
    tfa_in2: Math.round(totalFlowArea(row.nozzles) * 1000) / 1000,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
