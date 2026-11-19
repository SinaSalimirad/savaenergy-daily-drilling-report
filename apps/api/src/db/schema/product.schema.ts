import { sql } from "drizzle-orm";
import { check, numeric, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared/columns";

export const productPackageUnit = pgEnum("product_package_unit", [
  "kg",
  "lb",
  "mt",
  "gal",
  "l",
  "m3",
  "bbl",
]);

// bulk        = packaged by weight/volume (needs package size, unit, specific gravity)
// dimensional = sheet/fabric items such as a tarpaulin (needs length x width)
// equipment   = items with only a name (e.g. mud skid), every other field must be empty
export const PRODUCT_KINDS = ["bulk", "dimensional", "equipment"] as const;
export const productKind = pgEnum("product_kind", PRODUCT_KINDS);

export const products = pgTable(
  "product",
  {
    ...id,
    name: text().notNull(),
    kind: productKind().notNull().default("bulk"),

    // bulk only
    package_size: numeric({ precision: 5, scale: 3, mode: "number" }),
    package_unit: productPackageUnit(),
    specific_gravity: numeric({ precision: 5, scale: 3, mode: "number" }),

    // dimensional only (meters)
    length_m: numeric({ precision: 8, scale: 2, mode: "number" }),
    width_m: numeric({ precision: 8, scale: 2, mode: "number" }),

    ...timestamps,
  },
  (table) => [
    check(
      "product_kind_fields",
      sql`(
        ${table.kind} = 'bulk'
        AND ${table.package_size} IS NOT NULL
        AND ${table.package_unit} IS NOT NULL
        AND ${table.specific_gravity} IS NOT NULL
        AND ${table.length_m} IS NULL
        AND ${table.width_m} IS NULL
      ) OR (
        ${table.kind} = 'dimensional'
        AND ${table.length_m} IS NOT NULL
        AND ${table.width_m} IS NOT NULL
        AND ${table.package_size} IS NULL
        AND ${table.package_unit} IS NULL
        AND ${table.specific_gravity} IS NULL
      ) OR (
        ${table.kind} = 'equipment'
        AND ${table.package_size} IS NULL
        AND ${table.package_unit} IS NULL
        AND ${table.specific_gravity} IS NULL
        AND ${table.length_m} IS NULL
        AND ${table.width_m} IS NULL
      )`,
    ),
    check(
      "product_dimensions_positive",
      sql`${table.length_m} > 0 AND ${table.width_m} > 0`,
    ),
  ],
);
