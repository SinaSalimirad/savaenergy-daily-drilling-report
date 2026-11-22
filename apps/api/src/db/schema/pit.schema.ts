import { sql } from "drizzle-orm";
import {
  check,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { PIT_TYPES } from "schema";
import { id, timestamps } from "./_shared/columns";
import { projects } from "./project.schema";

// The allowed values live in packages/schema, so the database, the API and the web cannot
// drift apart. Changing the list there needs a new migration here.
export const pitType = pgEnum("pit_type", PIT_TYPES);

export const pits = pgTable(
  "pits",
  {
    ...id,
    project_id: uuid()
      .notNull()
      .references(() => projects.id),
    name: text().notNull(),
    capacity: numeric({ precision: 8, scale: 2, mode: "number" }),
    type: pitType().notNull(),
    order: integer().notNull(),
    ...timestamps,
  },
  (table) => [
    unique("pits_project_id_name_unique").on(table.project_id, table.name),
    check("pits_capacity_positive", sql`${table.capacity} > 0`),
  ],
);
