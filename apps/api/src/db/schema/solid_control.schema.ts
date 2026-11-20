import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { SCE_TYPES } from "schema";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";
import { projects } from "./project.schema";

// The allowed values live in packages/schema, so the database, the API and the web cannot
// drift apart. Changing the list there needs a new migration here.
export const sceType = pgEnum("sce_type", SCE_TYPES);

export const solidControlEquipment = pgTable(
  "solid_control_equipment",
  {
    ...id,
    project_id: uuid()
      .notNull()
      .references(() => projects.id),
    order: integer().notNull(), // the row of the unit on the rig's sheet
    type: sceType().notNull(),
    unit_no: smallint().notNull(), // "Shaker 2": the number among the units of its type
    manufacturer: text(),
    model: text(),
    // Free text: one mesh per deck, for example "140/140/140/140".
    screen_size: text(),
    ...timestamps,
    ...authorship,
  },
  (table) => [
    unique("solid_control_equipment_project_id_order_unique").on(
      table.project_id,
      table.order,
    ),
    unique("solid_control_equipment_project_id_type_unit_no_unique").on(
      table.project_id,
      table.type,
      table.unit_no,
    ),
    check("solid_control_equipment_order_positive", sql`${table.order} >= 1`),
    check(
      "solid_control_equipment_unit_no_positive",
      sql`${table.unit_no} >= 1`,
    ),
  ],
);
