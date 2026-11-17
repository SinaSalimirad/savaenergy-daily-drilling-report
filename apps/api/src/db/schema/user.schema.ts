import { pgTable, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared/columns";

export const user = pgTable("user", {
  ...id,
  name: text().notNull(),
  username: text().notNull().unique(),
  password: text(), // this will become hash
  image: text(),
  role: text(),
  ...timestamps,
});
