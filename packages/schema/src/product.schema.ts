import * as z from "zod";

// How a product is packaged or measured:
//   bulk        = by weight or volume (package size, unit and specific gravity)
//   dimensional = sheet or fabric items such as a tarpaulin (length x width)
//   equipment   = a name only; every other field stays empty
export const PRODUCT_KINDS = ["bulk", "dimensional", "equipment"] as const;
export const productKindSchema = z.enum(PRODUCT_KINDS);
export type ProductKind = z.infer<typeof productKindSchema>;

export const PRODUCT_PACKAGE_UNITS = [
  "kg",
  "lb",
  "mt",
  "gal",
  "l",
  "m3",
  "bbl",
] as const;
export const productPackageUnitSchema = z.enum(PRODUCT_PACKAGE_UNITS, {
  error: "Choose a unit.",
});
export type ProductPackageUnit = z.infer<typeof productPackageUnitSchema>;

// A positive number that fits `numeric(precision, scale)`: below `limit`, with at most
// `decimals` decimal places (`step` is 10^-decimals).
const positiveNumber = (
  label: string,
  { limit, step, decimals }: { limit: number; step: number; decimals: number },
) =>
  z
    .number({ error: `Enter a number for ${label}, for example 25.` })
    .gt(0, `${label} must be greater than 0.`)
    .lt(limit, `${label} is too large.`)
    .multipleOf(step, `Use at most ${decimals} decimal places.`);

// numeric(5, 3): at most 2 digits before the point and 3 after it.
const packageSize = positiveNumber("Package size", {
  limit: 100,
  step: 0.001,
  decimals: 3,
});
const specificGravity = positiveNumber("Specific gravity", {
  limit: 100,
  step: 0.001,
  decimals: 3,
});
// numeric(8, 2), in meters.
const meters = (label: string) =>
  positiveNumber(label, { limit: 1_000_000, step: 0.01, decimals: 2 });

const name = z
  .string({ error: "Enter a name." })
  .trim()
  .min(1, "Enter a name.")
  .max(200, "Name must be 200 characters or less.");

// One shape per kind, so a product can only carry the fields of its own kind. The database
// enforces the same rule with a check constraint.
const bulkProduct = z.object({
  kind: z.literal("bulk"),
  name,
  package_size: packageSize,
  package_unit: productPackageUnitSchema,
  specific_gravity: specificGravity,
});
const dimensionalProduct = z.object({
  kind: z.literal("dimensional"),
  name,
  length_m: meters("Length"),
  width_m: meters("Width"),
});
const equipmentProduct = z.object({
  kind: z.literal("equipment"),
  name,
});

/**
 * A whole product. Create and edit both send it: changing the kind changes which fields
 * apply, so an edit replaces the product instead of patching single fields.
 */
export const productInputSchema = z.discriminatedUnion(
  "kind",
  [bulkProduct, dimensionalProduct, equipmentProduct],
  { error: "Choose a kind." },
);
export type ProductInput = z.infer<typeof productInputSchema>;
