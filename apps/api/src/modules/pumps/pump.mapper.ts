import { galPerStroke } from "schema";
import type { PumpRow } from "./pump.repository";

/**
 * The shape the web app receives. Dates are ISO strings because JSON has no Date type,
 * and the web app imports this type through Eden. Internal columns (`created_by`,
 * `updated_by`) stay on the server.
 */
export type PumpDto = {
  id: string;
  project_id: string;
  project_name: string;
  sort_order: number;
  model: string;
  type: PumpRow["type"];
  liner_diameter: number;
  rod_diameter: number | null;
  stroke_length: number;
  efficiency: number;
  // Computed from the fields above, never stored. `null` for a duplex without a rod diameter.
  gal_per_stroke: number | null;
  created_at: string;
  updated_at: string;
};

export function toPumpDto(row: PumpRow): PumpDto {
  return {
    id: row.id,
    project_id: row.project_id,
    project_name: row.project_name,
    sort_order: row.sort_order,
    model: row.model,
    type: row.type,
    liner_diameter: row.liner_diameter,
    rod_diameter: row.rod_diameter,
    stroke_length: row.stroke_length,
    efficiency: row.efficiency,
    gal_per_stroke: galPerStroke(row),
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
