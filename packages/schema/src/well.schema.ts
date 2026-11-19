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

export const RIG_TYPES = ["onshore", "offshore"] as const;
export const rigTypeSchema = z.enum(RIG_TYPES);
export type RigType = z.infer<typeof rigTypeSchema>;

// `archived` is excluded: a well is archived and restored only through its own endpoints,
// so `archived_at` can never disagree with `status`.
export const wellWritableStatusSchema = wellStatusSchema.exclude(["archived"]);
export type WellWritableStatus = z.infer<typeof wellWritableStatusSchema>;

const wellFields = z.object({
  project_id: z.uuid("Choose a project."),
  name: z
    .string({ error: "Well name is required." })
    .trim()
    .min(1, "Well name is required.")
    .max(120, "Well name must be 120 characters or fewer."),
  status: wellWritableStatusSchema,
  rig_name: z
    .string({ error: "Rig name is required." })
    .trim()
    .min(1, "Rig name is required.")
    .max(120, "Rig name must be 120 characters or fewer."),
  rig_type: rigTypeSchema,
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

// Water depth only applies to offshore rigs. The database enforces the same rule with a check
// constraint; this gives the client a field-level message instead of a database error.
const WATER_DEPTH_OFFSHORE_ONLY = {
  message: "Water depth applies to offshore wells only",
  path: ["water_depth"],
};

export const wellCreateSchema = wellFields.refine(
  (well) => well.rig_type === "offshore" || well.water_depth == null,
  WATER_DEPTH_OFFSHORE_ONLY,
);
export type WellCreate = z.infer<typeof wellCreateSchema>;

// A patch may send only one of the two fields. The API completes the rule for the stored
// row (changing the rig to onshore clears the depth), so only a patch that sends both is checked.
export const wellUpdateSchema = wellFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  })
  .refine(
    (patch) =>
      patch.rig_type === undefined ||
      patch.rig_type === "offshore" ||
      patch.water_depth == null,
    WATER_DEPTH_OFFSHORE_ONLY,
  );
export type WellUpdate = z.infer<typeof wellUpdateSchema>;
