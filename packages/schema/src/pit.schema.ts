import * as z from "zod";

// "active" pits are circulating, "reserve" pits hold spare mud, "not mud" pits hold something else
// (water, slug, trip tank...) and stay out of the mud volume.
export const PIT_TYPES = ["active", "reserve", "not mud"] as const;
export const pitTypeSchema = z.enum(PIT_TYPES);
export type PitType = z.infer<typeof pitTypeSchema>;

const pitFields = z.object({
  project_id: z.uuid("Choose a project."),
  // The position of the pit on the rig's sheet, starting at 1. Left out on create, the API
  // puts the pit last.
  order: z
    .number({ error: "Enter a whole number, for example 1." })
    .int("Enter a whole number, for example 1.")
    .min(1, "Order must be at least 1.")
    .max(1000, "Order must be 1000 or less."),
  name: z
    .string({ error: "Enter the pit name." })
    .trim()
    .min(1, "Enter the pit name.")
    .max(100, "The name must be 100 characters or fewer."),
  type: pitTypeSchema,
  // Barrels, up to the 2 decimals of numeric(8, 2). `null` means "not known".
  capacity: z
    .number({ error: "Enter the capacity, for example 250." })
    .positive("The capacity must be more than 0.")
    .max(999999.99, "The capacity must be 999,999.99 or less.")
    .refine((value) => Math.round(value * 100) / 100 === value, {
      error: "Use at most 2 decimals.",
    })
    .nullable(),
});

export const pitCreateSchema = pitFields
  .partial({ order: true })
  .extend({ capacity: pitFields.shape.capacity.optional() });
export type PitCreate = z.infer<typeof pitCreateSchema>;

// No `.default()` anywhere: inside `.partial()` it would fill missing fields in a patch and
// overwrite stored values.
export const pitUpdateSchema = pitFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type PitUpdate = z.infer<typeof pitUpdateSchema>;
