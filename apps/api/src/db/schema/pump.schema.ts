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
import { PUMP_TYPES } from "schema";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";
import { projects } from "./project.schema";

// The allowed values live in packages/schema, so the database, the API and the web cannot
// drift apart. Changing the list there needs a new migration here.
export const pumpType = pgEnum("pump_type", PUMP_TYPES);

export const pumps = pgTable(
  "pumps",
  {
    ...id,
    project_id: uuid()
      .notNull()
      .references(() => projects.id),
    order: integer().notNull(), // the row of the pump on the rig's sheet
    model: text().notNull(),
    type: pumpType().notNull(),
    // Inches. The output in gallons per stroke is computed from these, never stored.
    liner_diameter: numeric({
      precision: 5,
      scale: 3,
      mode: "number",
    }).notNull(),
    stroke_length: numeric({
      precision: 5,
      scale: 3,
      mode: "number",
    }).notNull(),
    // A percentage: 97.50 means 97.5 %, so the value is above 0 and at most 100.
    efficiency: numeric({ precision: 5, scale: 2, mode: "number" }).notNull(),
    ...timestamps,
    ...authorship,
  },
  (table) => [
    unique("pumps_project_id_order_unique").on(table.project_id, table.order),
    check("pumps_order_positive", sql`${table.order} >= 1`),
    check("pumps_liner_diameter_positive", sql`${table.liner_diameter} > 0`),
    check("pumps_stroke_length_positive", sql`${table.stroke_length} > 0`),
    check(
      "pumps_efficiency_percentage",
      sql`${table.efficiency} > 0 and ${table.efficiency} <= 100`,
    ),
  ],
);
