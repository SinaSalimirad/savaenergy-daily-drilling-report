import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";
import { user } from "./user.schema";

// `archived` is a status, not a separate flag: the list and the archive/restore endpoints
// all read `status`. `archived_at` and `archived_by` only record when and by whom.
export const PROJECT_STATUSES = [
  "planned",
  "active",
  "completed",
  "archived",
] as const;
export const projectStatus = pgEnum("project_status", PROJECT_STATUSES);

export const projects = pgTable("projects", {
  ...id,
  name: text().notNull().unique(),
  operator: text().notNull(),
  contractor: text().notNull(),
  field: text(),
  status: projectStatus().notNull(),
  currency: text().notNull(),
  archived_at: timestamp("archived_at", { withTimezone: true }),
  archived_by: uuid("archived_by").references(() => user.id),
  ...timestamps,
  ...authorship,
});
