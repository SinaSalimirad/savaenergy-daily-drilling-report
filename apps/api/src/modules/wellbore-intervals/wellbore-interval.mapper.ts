import type { WellboreIntervalRow } from "./wellbore-interval.repository";

/**
 * The shape the web app receives, through Eden. The capacity and the volume are computed by
 * the server from the diameter and the depths.
 */
export type WellboreIntervalDto = Omit<
  WellboreIntervalRow,
  "created_at" | "updated_at"
> & {
  // Barrels per metre, and barrels in the whole interval.
  capacity_bbl_m: number;
  volume_bbl: number;
  created_at: string;
  updated_at: string;
};

// Barrels per foot of a hole of D inches: D^2 / 1029.4. A metre is 3.28084 feet.
const FEET_PER_METRE = 3.28084;
const BARREL_DIVISOR = 1029.4;

export function toWellboreIntervalDto(
  row: WellboreIntervalRow,
): WellboreIntervalDto {
  const capacity = (row.id_in ** 2 / BARREL_DIVISOR) * FEET_PER_METRE;
  return {
    ...row,
    capacity_bbl_m: Math.round(capacity * 10000) / 10000,
    volume_bbl:
      Math.round(capacity * (row.bottom_md_m - row.top_md_m) * 100) / 100,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
