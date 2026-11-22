import type { DrillStringToolRow } from "./drill-string-tool.repository";

/**
 * The shape the web app receives, through Eden. The volumes are computed by the server from the
 * diameters and the length.
 */
export type DrillStringToolDto = Omit<
  DrillStringToolRow,
  "created_at" | "updated_at"
> & {
  // Cubic metres of steel, of mud inside the tool, and the sum of both (what the tool
  // displaces when it goes in the hole closed).
  steel_volume_m3: number;
  internal_volume_m3: number;
  displacement_m3: number;
  // The same three in barrels.
  steel_volume_bbl: number;
  internal_volume_bbl: number;
  displacement_bbl: number;
  created_at: string;
  updated_at: string;
};

const METRES_PER_INCH = 0.0254;
const BARRELS_PER_CUBIC_METRE = 6.2898;

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const circleArea = (diameterIn: number) =>
  (Math.PI / 4) * (diameterIn * METRES_PER_INCH) ** 2;

export function toDrillStringToolDto(
  row: DrillStringToolRow,
): DrillStringToolDto {
  const steel = (circleArea(row.od_in) - circleArea(row.id_in)) * row.length_m;
  const internal = circleArea(row.id_in) * row.length_m;
  return {
    ...row,
    steel_volume_m3: round(steel, 2),
    internal_volume_m3: round(internal, 2),
    displacement_m3: round(steel + internal, 2),
    steel_volume_bbl: round(steel * BARRELS_PER_CUBIC_METRE, 2),
    internal_volume_bbl: round(internal * BARRELS_PER_CUBIC_METRE, 2),
    displacement_bbl: round((steel + internal) * BARRELS_PER_CUBIC_METRE, 2),
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
