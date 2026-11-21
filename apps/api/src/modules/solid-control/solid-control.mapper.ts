import type { SceRow } from "./solid-control.repository";

/**
 * The shape the web app receives. Dates are ISO strings because JSON has no Date type,
 * and the web app imports this type through Eden. Internal columns (`created_by`,
 * `updated_by`) stay on the server.
 */
export type SceDto = {
  id: string;
  project_id: string;
  project_name: string;
  sort_order: number;
  type: SceRow["type"];
  unit_no: number;
  manufacturer: string | null;
  model: string | null;
  screen_size: string | null;
  created_at: string;
  updated_at: string;
};

export function toSceDto(row: SceRow): SceDto {
  return {
    id: row.id,
    project_id: row.project_id,
    project_name: row.project_name,
    sort_order: row.sort_order,
    type: row.type,
    unit_no: row.unit_no,
    manufacturer: row.manufacturer,
    model: row.model,
    screen_size: row.screen_size,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
