import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { PROJECT_CURRENCIES, PROJECT_STATUSES } from "schema";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";
import { user } from "./user.schema";

// `archived` is a status, not a separate flag: the list and the archive/restore endpoints
// all read `status`. `archived_at` and `archived_by` only record when and by whom.
// The allowed values live in packages/schema, so the database, the API and the web
// cannot drift apart. Changing the list there needs a new migration here.
export const projectStatus = pgEnum("project_status", PROJECT_STATUSES);
export const projectCurrency = pgEnum("project_currency", PROJECT_CURRENCIES);

export const projects = pgTable("projects", {
  ...id,
  name: text().notNull().unique(),
  operator: text().notNull(),
  contractor: text().notNull(),
  field: text().notNull(),
  wells: integer().notNull(),
  status: projectStatus().notNull(),
  currency: projectCurrency().notNull(),
  archived_at: timestamp("archived_at", { withTimezone: true }),
  archived_by: uuid("archived_by").references(() => user.id),
  ...timestamps,
  ...authorship,
});
