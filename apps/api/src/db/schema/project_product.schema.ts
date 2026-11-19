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
import { PROJECT_CURRENCIES } from "schema";
import { products } from "./product.schema";
import { projects } from "./project.schema";

export const projectProductOrigin = pgEnum("project_product_origin", [
  "foreign",
  "local",
]);

// Same list as the project currency, shared from packages/schema.
export const projectProductCurrency = pgEnum(
  "project_product_currency",
  PROJECT_CURRENCIES,
);

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
    currency: projectProductCurrency().notNull(),
    // Unit price in `currency`; per usage unit (package/m²) or per day for equipment.
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
