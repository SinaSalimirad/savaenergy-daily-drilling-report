import { sql } from "drizzle-orm";
import {
  check,
  date,
  numeric,
  pgEnum,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  RIG_TYPES,
  WELL_DESIGNATIONS,
  WELL_STATUSES,
  WELL_TYPES,
} from "schema";
import { archive } from "./_shared/archive";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";
import { projects } from "./project.schema";

export const wellDesignation = pgEnum("well_designation", WELL_DESIGNATIONS);
export const wellType = pgEnum("well_type", WELL_TYPES);
export const wellStatus = pgEnum("well_status", WELL_STATUSES);
export const rigType = pgEnum("rig_type", RIG_TYPES);

export const wells = pgTable(
  "wells",
  {
    ...id,
    project_id: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    name: text().notNull(),
    designation: wellDesignation(),
    well_type: wellType(),
    status: wellStatus().notNull(),
    spud_date: date(),
    rig_name: text().notNull(),
    rig_type: rigType().notNull(),
    // `mode: "number"` returns a JS number instead of a string.
    water_depth: numeric({ precision: 12, scale: 5, mode: "number" }),
    ...archive,
    ...timestamps,
    ...authorship,
  },
  (table) => [
    unique("wells_project_id_name_unique").on(table.project_id, table.name),
    // Water depth only exists on offshore rigs: an onshore rig must have none.
    check(
      "wells_water_depth_offshore_only",
      sql`${table.rig_type} = 'offshore' OR ${table.water_depth} IS NULL`,
    ),
    check("wells_water_depth_non_negative", sql`${table.water_depth} >= 0`),
  ],
);
