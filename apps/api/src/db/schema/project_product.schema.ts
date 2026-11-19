import { sql } from "drizzle-orm";
import {
  check,
  numeric,
  pgEnum,
  pgTable,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";
import { products } from "./product.schema";
import { projects } from "./project.schema";

export const projectProductOrigin = pgEnum("project_product_origin", [
  "foreign",
  "local",
]);

export const projectProducts = pgTable(
  "project_product",
  {
    ...id,
    project_id: uuid()
      .notNull()
      .references(() => projects.id),
    product_id: uuid()
      .notNull()
      .references(() => products.id),
    origin: projectProductOrigin().notNull(),
    // Unit price in the project's currency (`project.currency`); per usage unit (package/m²)
    // or per day for equipment.
    price: numeric({ precision: 14, scale: 5, mode: "number" }),
    ...timestamps,
    ...authorship,
  },
  (table) => [
    unique("project_product_project_id_product_id_unique").on(
      table.project_id,
      table.product_id,
    ),
    check("project_product_price_positive", sql`${table.price} > 0`),
  ],
);
