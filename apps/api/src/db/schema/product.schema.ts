import { sql } from "drizzle-orm";
import {
  check,
  numeric,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { PRODUCT_KINDS, PRODUCT_PACKAGE_UNITS } from "schema";
import { id, timestamps } from "./_shared/columns";

// Same lists as the shared schema, so the API, the database and the web cannot drift apart.
export const productPackageUnit = pgEnum(
  "product_package_unit",
  PRODUCT_PACKAGE_UNITS,
);

// bulk        = packaged by weight/volume (needs package size, unit, specific gravity)
// dimensional = sheet/fabric items such as a tarpaulin (needs length x width)
// equipment   = items with only a name (e.g. mud skid), every other field must be empty
export const productKind = pgEnum("product_kind", PRODUCT_KINDS);

// Index names in one place, so tests and the service can refer to them.
export const PRODUCT_CONSTRAINTS = {
  uniqueBulk: "product_bulk_unique",
  uniqueDimensional: "product_dimensional_unique",
  uniqueEquipment: "product_equipment_unique",
} as const;

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
    // The same product cannot be saved twice. What makes two products "the same" depends on the
    // kind, and the name ignores upper/lower case. One partial index per kind:
    //   bulk        = name + package size + package unit + specific gravity
    //   dimensional = name + length + width
    //   equipment   = name
    uniqueIndex(PRODUCT_CONSTRAINTS.uniqueBulk)
      .on(
        sql`lower(${table.name})`,
        table.package_size,
        table.package_unit,
        table.specific_gravity,
      )
      .where(sql`${table.kind} = 'bulk'`),
    uniqueIndex(PRODUCT_CONSTRAINTS.uniqueDimensional)
      .on(sql`lower(${table.name})`, table.length_m, table.width_m)
      .where(sql`${table.kind} = 'dimensional'`),
    uniqueIndex(PRODUCT_CONSTRAINTS.uniqueEquipment)
      .on(sql`lower(${table.name})`)
      .where(sql`${table.kind} = 'equipment'`),
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
