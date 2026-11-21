import type { SectionRow } from "./section.repository";

/**
 * The shape the web app receives. Dates are ISO strings because JSON has no Date type,
 * and the web app imports this type through Eden. Internal columns (`created_by`,
 * `updated_by`) stay on the server.
 */
export type SectionDto = {
  id: string;
  well_id: string;
  well_name: string;
  project_name: string;
  sort_order: number;
  hole_size: number;
  hole_type: SectionRow["hole_type"];
  created_at: string;
  updated_at: string;
};

export function toSectionDto(row: SectionRow): SectionDto {
  return {
    id: row.id,
    well_id: row.well_id,
    well_name: row.well_name,
    project_name: row.project_name,
    sort_order: row.sort_order,
    hole_size: row.hole_size,
    hole_type: row.hole_type,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
