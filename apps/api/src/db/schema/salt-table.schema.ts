import { integer, numeric, pgEnum, pgTable, unique } from "drizzle-orm/pg-core";
import { SALT_TYPES } from "schema";
import { id } from "./_shared/columns";

// The allowed values live in packages/schema, so the database, the API and the web cannot
// drift apart. Changing the list there needs a new migration here.
export const saltType = pgEnum("salt_type", SALT_TYPES);

// Reference data: one row per salt and weight percent, filled by the migration. Nothing in
// the app writes to it.
export const saltTableRows = pgTable(
  "salt_table_rows",
  {
    ...id,
    salt_type: saltType().notNull(),
    // Weight percent of the salt in water: 1, 2, 3...
    weight_percent: integer().notNull(),
    density_kg_l: numeric({ precision: 5, scale: 3, mode: "number" }).notNull(),
    density_lb_gal: numeric({
      precision: 5,
      scale: 2,
      mode: "number",
    }).notNull(),
    // Chloride and the salt's cation (K+, Na+ or Ca2+), in mg/l.
    chloride_mg_l: integer().notNull(),
    cation_mg_l: integer().notNull(),
    // Pounds of salt per barrel of brine.
    salt_lb_bbl: numeric({ precision: 6, scale: 1, mode: "number" }).notNull(),
    water_bbl: numeric({ precision: 4, scale: 3, mode: "number" }).notNull(),
    crystallization_point_f: numeric({
      precision: 5,
      scale: 1,
      mode: "number",
    }).notNull(),
    water_activity: numeric({
      precision: 4,
      scale: 3,
      mode: "number",
    }).notNull(),
  },
  (table) => [
    unique("salt_table_rows_salt_type_weight_percent_unique").on(
      table.salt_type,
      table.weight_percent,
    ),
  ],
);
