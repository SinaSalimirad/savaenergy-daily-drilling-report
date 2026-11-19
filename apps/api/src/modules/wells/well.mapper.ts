import type { WellRow } from "./well.repository";

/**
 * The shape the web app receives. Dates are ISO strings because JSON has no Date type,
 * and the web app imports this type through Eden. Internal columns (`created_by`,
 * `updated_by`, `archived_by`) stay on the server.
 */
export type WellDto = {
  id: string;
  project_id: string;
  project_name: string;
  name: string;
  designation: WellRow["designation"];
  well_type: WellRow["well_type"];
  status: WellRow["status"];
  rig_name: WellRow["rig_name"];
  rig_type: WellRow["rig_type"];
  spud_date: string | null;
  water_depth: number | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export function toWellDto(row: WellRow): WellDto {
  return {
    id: row.id,
    project_id: row.project_id,
    project_name: row.project_name,
    name: row.name,
    designation: row.designation,
    well_type: row.well_type,
    status: row.status,
    rig_name: row.rig_name,
    rig_type: row.rig_type,
    spud_date: row.spud_date,
    water_depth: row.water_depth,
    archived_at: row.archived_at?.toISOString() ?? null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
