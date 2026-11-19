import { sql } from "drizzle-orm";
import { check, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { PROJECT_CURRENCIES } from "schema";
import { archive } from "./_shared/archive";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";

// A project has no status of its own: it is active when one of its wells is active (derived
// with a join on `wells`). Archiving is recorded by `archived_at` and `archived_by`.
// The allowed values live in packages/schema, so the database, the API and the web
// cannot drift apart. Changing the list there needs a new migration here.
export const projectCurrency = pgEnum("project_currency", PROJECT_CURRENCIES);

export const projects = pgTable(
  "projects",
  {
    ...id,
    name: text().notNull().unique(),
    operator: text().notNull(),
    contractor: text().notNull(),
    field: text().notNull(),
    wells: integer().notNull(),
    currency: projectCurrency().notNull(),
    ...archive,
    ...timestamps,
    ...authorship,
  },
  (table) => [check("projects_wells_positive", sql`${table.wells} > 0`)],
);
