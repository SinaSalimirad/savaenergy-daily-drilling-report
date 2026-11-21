import { integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";
import { sce } from "./sce.schema";

export const sceUsage = pgTable("solid_control_equipment_usage", {
  ...id,
  sce_id: uuid()
    .notNull()
    .references(() => sce.id),
  hours: integer(), // between 0 and 24
  total_usage: integer(),
  ...timestamps,
  ...authorship,
});
