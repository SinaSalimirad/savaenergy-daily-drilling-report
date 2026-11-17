import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";
import { user } from "./user.schema";

export const projects = pgTable("projects", {
  ...id,
  name: text().notNull().unique(),
  operator: text().notNull(),
  contractor: text().notNull(),
  field: text(),
  well: integer(),
  active_well: integer(),
  last_report: date(),
  status: text().notNull(),
  currency: text().notNull(),
  archived_at: timestamp("archived_at", { withTimezone: true }),
  archived_by: uuid("updated_by").references(() => user.id),
  ...timestamps,
  ...authorship,
});
