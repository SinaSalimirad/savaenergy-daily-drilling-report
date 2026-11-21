import { uuid } from "drizzle-orm/pg-core";
import { users } from "../user.schema";

// Kept out of columns.ts: that module has no table of its own and every table
// imports it, so it must never import a specific table back (a cycle between
// columns.ts and user.schema.ts broke `id`/`timestamps` at module load).
// Spread into a table: pgTable('wells', { ...id, ...timestamps, ...authorship })
export const authorship = {
  created_by: uuid("created_by").references(() => users.id),
  updated_by: uuid("updated_by").references(() => users.id),
};
