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
import { id } from "./_shared/columns";
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
    order: integer().notNull(), // sort the section
    // Inches as a decimal (5 7/8" = 5.875). Allowed values: HOLE_SIZES in the shared schema.
    hole_size: numeric({ precision: 5, scale: 3, mode: "number" }).notNull(),
    hole_type: holeType(),
  },
  (table) => [
    unique("sections_well_id_order_unique").on(table.well_id, table.order),
    check("sections_order_non_negative", sql`${table.order} >= 0`),
  ],
);
