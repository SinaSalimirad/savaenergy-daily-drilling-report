import { sql } from "drizzle-orm";
import {
  check,
  integer,
  numeric,
  pgEnum,
  pgTable,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";
import { wells } from "./well.schema";

export const holeType = pgEnum("hole_type", [
  "conductor",
  "casing",
  "liner",
  "open_hole",
]);

export const sections = pgTable(
  "sections",
  {
    ...id,
    well_id: uuid("well_id")
      .notNull()
      .references(() => wells.id),
    sort_order: integer().notNull(), // sort the section
    // Inches as a decimal (5 7/8" = 5.875). Allowed values: HOLE_SIZES in the shared schema.
    hole_size: numeric({ precision: 5, scale: 3, mode: "number" }).notNull(),
    hole_type: holeType(),
    ...timestamps,
    ...authorship,
  },
  (table) => [
    unique("sections_well_id_sort_order_unique").on(
      table.well_id,
      table.sort_order,
    ),
    // Redundant for uniqueness (id is already the PK), but required as the target
    // of the composite FK from daily_report, which ties a section to its well.
    unique("sections_id_well_id_unique").on(table.id, table.well_id),
    check("sections_sort_order_non_negative", sql`${table.sort_order} >= 0`),
  ],
);
