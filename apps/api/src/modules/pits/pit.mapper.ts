import type { PitRow } from "./pit.repository";

/**
 * The shape the web app receives. Dates are ISO strings because JSON has no Date type,
 * and the web app imports this type through Eden.
 */
export type PitDto = {
  id: string;
  project_id: string;
  project_name: string;
  order: number;
  name: string;
  type: PitRow["type"];
  // Barrels. `null` when the capacity is not known.
  capacity: number | null;
  created_at: string;
  updated_at: string;
};

export function toPitDto(row: PitRow): PitDto {
  return {
    id: row.id,
    project_id: row.project_id,
    project_name: row.project_name,
    order: row.order,
    name: row.name,
    type: row.type,
    capacity: row.capacity,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
