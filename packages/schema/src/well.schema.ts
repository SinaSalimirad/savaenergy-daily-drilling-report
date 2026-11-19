import * as z from "zod";

// Single source of truth for well values, shared by the API (Postgres enum) and the web.
export const WELL_STATUSES = [
  "planned",
  "active",
  "completed",
  "archived",
  "suspended",
] as const;
export const wellStatusSchema = z.enum(WELL_STATUSES);
export type WellStatus = z.infer<typeof wellStatusSchema>;

export const WELL_DESIGNATIONS = [
  "exploration",
  "appraisal",
  "development",
  "injection",
  "observation",
] as const;
export const wellDesignationSchema = z.enum(WELL_DESIGNATIONS);
export type WellDesignation = z.infer<typeof wellDesignationSchema>;

export const WELL_TYPES = ["vertical", "directional"] as const;
export const wellTypeSchema = z.enum(WELL_TYPES);
export type WellType = z.infer<typeof wellTypeSchema>;

// `archived` is excluded: a well is archived and restored only through its own endpoints,
// so `archived_at` can never disagree with `status`.
export const wellWritableStatusSchema = wellStatusSchema.exclude(["archived"]);
export type WellWritableStatus = z.infer<typeof wellWritableStatusSchema>;

export const wellCreateSchema = z.object({
  project_id: z.uuid("Choose a project."),
  name: z
    .string({ error: "Well name is required." })
    .trim()
    .min(1, "Well name is required.")
    .max(120, "Well name must be 120 characters or fewer."),
  status: wellWritableStatusSchema,
  // Optional fields accept `null` too, so an edit can clear them. No `.default()`: inside
  // `.partial()` it would fill missing fields in a patch and overwrite stored values.
  designation: wellDesignationSchema.nullable().optional(),
  well_type: wellTypeSchema.nullable().optional(),
  // A calendar date as `YYYY-MM-DD`, the format of a Postgres `date` column.
  spud_date: z.iso.date("Enter a valid date.").nullable().optional(),
  // Matches numeric(12, 5): at most 7 digits before the point and 5 after it.
  water_depth: z
    .number({ error: "Enter a number, for example 120.5." })
    .min(0, "Water depth cannot be negative.")
    .lt(10_000_000, "Water depth is too large.")
    .multipleOf(0.00001, "Use at most 5 decimal places.")
    .nullable()
    .optional(),
});
export type WellCreate = z.infer<typeof wellCreateSchema>;

export const wellUpdateSchema = wellCreateSchema
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type WellUpdate = z.infer<typeof wellUpdateSchema>;
