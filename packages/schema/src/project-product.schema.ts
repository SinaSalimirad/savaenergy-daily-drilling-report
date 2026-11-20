import * as z from "zod";

// Where a product of a project comes from. Same list as the Postgres enum `project_product_origin`.
export const PROJECT_PRODUCT_ORIGINS = ["foreign", "local"] as const;
export const projectProductOriginSchema = z.enum(PROJECT_PRODUCT_ORIGINS, {
  error: "Choose an origin.",
});
export type ProjectProductOrigin = z.infer<typeof projectProductOriginSchema>;

/**
 * Adds a product to a project. The product itself lives in the product catalog; this only says
 * "this project uses it", with the price the project pays for it.
 */
const projectProductFields = z.object({
  project_id: z.uuid("Choose a project."),
  product_id: z.uuid("Choose a product."),
  origin: projectProductOriginSchema,
  // Unit price in the project's currency. Matches numeric(14, 5): at most 9 digits before the
  // point and 5 after it. `null` or missing means "no price yet".
  price: z
    .number({ error: "Enter a number, for example 12.5." })
    .gt(0, "Price must be greater than 0.")
    .lt(1_000_000_000, "Price is too large.")
    .multipleOf(0.00001, "Use at most 5 decimal places.")
    .nullable()
    .optional(),
});

export const projectProductCreateSchema = projectProductFields;
export type ProjectProductCreate = z.infer<typeof projectProductCreateSchema>;

// Only the origin and the price can change. The project and the product are what the link
// is, so changing them means removing the link and adding another one.
export const projectProductUpdateSchema = projectProductFields
  .pick({ origin: true, price: true })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type ProjectProductUpdate = z.infer<typeof projectProductUpdateSchema>;
