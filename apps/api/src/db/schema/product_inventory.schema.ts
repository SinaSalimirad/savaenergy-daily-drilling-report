import { sql } from "drizzle-orm";
import { check, integer, pgTable, unique, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared/columns";
import { dailyReports } from "./daily_report.schema";
import { projectProducts } from "./project_product.schema";

export const productInventories = pgTable(
  "product_inventory",
  {
    ...id,
    report_id: uuid()
      .notNull()
      .references(() => dailyReports.id),
    project_product_id: uuid()
      .notNull()
      .references(() => projectProducts.id),
    // `initial`, `used`, `received` and `returned` are int number (1,2,3,...)
    initial: integer().notNull().default(0),
    used: integer().notNull().default(0),
    received: integer().notNull().default(0),
    returned: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [
    unique("product_inventory_report_id_project_product_id_unique").on(
      table.report_id,
      table.project_product_id,
    ),
    check("product_inventory_initial_nonnegative", sql`${table.initial} >= 0`),
    check("product_inventory_used_nonnegative", sql`${table.used} >= 0`),
    check(
      "product_inventory_received_nonnegative",
      sql`${table.received} >= 0`,
    ),
    check(
      "product_inventory_returned_nonnegative",
      sql`${table.returned} >= 0`,
    ),
  ],
);
