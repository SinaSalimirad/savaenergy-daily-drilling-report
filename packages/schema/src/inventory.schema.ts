import * as z from "zod";

// A whole number of packages (or items) that moved in one day. Fits a Postgres `integer`.
const quantity = (label: string) =>
  z
    .number({ error: `Enter a whole number for ${label}, for example 4.` })
    .int(`${label} must be a whole number.`)
    .min(0, `${label} cannot be negative.`)
    .max(1_000_000, `${label} is too large.`);

const inventoryFields = z.object({
  initial: quantity("Initial stock"),
  received: quantity("Received"),
  used: quantity("Used"),
  returned: quantity("Returned"),
});

/**
 * Adds a product to the inventory of one daily report. Every number is optional: a missing
 * `initial` is carried over from the previous report of the well, the others start at 0.
 */
export const inventoryCreateSchema = inventoryFields.partial().extend({
  report_id: z.uuid("Choose a daily report."),
  project_product_id: z.uuid("Choose a product."),
});
export type InventoryCreate = z.infer<typeof inventoryCreateSchema>;

export const inventoryUpdateSchema = inventoryFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type InventoryUpdate = z.infer<typeof inventoryUpdateSchema>;
