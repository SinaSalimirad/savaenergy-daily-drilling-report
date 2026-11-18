import type { projects } from "../../db/schema";

type ProjectRow = typeof projects.$inferSelect;

/**
 * The shape the web app receives. Dates are ISO strings because JSON has no Date type,
 * and the web app imports this type through Eden, so it is never copied by hand.
 * Internal columns (`created_by`, `updated_by`, `archived_by`) stay on the server.
 */
export type ProjectDto = {
  id: string;
  name: string;
  operator: string;
  contractor: string;
  field: string;
  status: ProjectRow["status"];
  currency: ProjectRow["currency"];
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export function toProjectDto(row: ProjectRow): ProjectDto {
  return {
    id: row.id,
    name: row.name,
    operator: row.operator,
    contractor: row.contractor,
    field: row.field,
    status: row.status,
    currency: row.currency,
    archived_at: row.archived_at?.toISOString() ?? null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
