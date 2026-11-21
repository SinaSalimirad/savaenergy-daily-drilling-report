import { timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "../user.schema";

export const archive = {
  archived_at: timestamp("archived_at", { withTimezone: true }),
  archived_by: uuid("archived_by").references(() => users.id),
};
