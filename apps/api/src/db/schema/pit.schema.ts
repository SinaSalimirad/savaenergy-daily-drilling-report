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
import { id, timestamps } from "./_shared/columns";
import { projects } from "./project.schema";

const PIT_TYPES = ["active", "reserve", "not mud"] as const;

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
