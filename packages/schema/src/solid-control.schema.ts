import * as z from "zod";

// Solid control equipment (SCE): what cleans the mud on a rig, in the order of the sheet.
export const SCE_TYPES = [
  "shale_shaker",
  "desander",
  "desilter",
  "mud_cleaner",
  "centrifuge",
  "degasser",
  "other",
] as const;
export const sceTypeSchema = z.enum(SCE_TYPES);
export type SceType = z.infer<typeof sceTypeSchema>;

// Optional text fields accept `null` too, so an edit can clear them. No `.default()`: inside
// `.partial()` it would fill missing fields in a patch and overwrite stored values.
const optionalText = (label: string, max: number) =>
  z
    .string({ error: `Enter the ${label}.` })
    .trim()
    .min(1, `Leave the ${label} out instead of sending it empty.`)
    .max(max, `The ${label} must be ${max} characters or fewer.`)
    .nullable()
    .optional();

const sceFields = z.object({
  project_id: z.uuid("Choose a project."),
  // The row of the unit on the rig's sheet. A project cannot have two units with the same
  // order. Left out on create, the API uses the next free number.
  order: z
    .number({ error: "Enter a whole number, for example 1." })
    .int("Enter a whole number, for example 1.")
    .min(1, "Row must be at least 1.")
    .max(1000, "Row must be 1000 or less."),
  type: sceTypeSchema,
  // The unit's number among the units of its type ("Shaker 2"). A project cannot have two
  // units of one type with the same number. Left out on create, the API uses the next free one.
  unit_no: z
    .number({ error: "Enter a whole number, for example 1." })
    .int("Enter a whole number, for example 1.")
    .min(1, "No. must be at least 1.")
    .max(99, "No. must be 99 or less."),
  manufacturer: optionalText("manufacturer", 100),
  model: optionalText("model", 100),
  // Free text: a shaker has one mesh per deck, for example "140/140/140/140".
  screen_size: optionalText("screen size", 100),
});

export const sceCreateSchema = sceFields.partial({
  order: true,
  unit_no: true,
});
export type SceCreate = z.infer<typeof sceCreateSchema>;

export const sceUpdateSchema = sceFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type SceUpdate = z.infer<typeof sceUpdateSchema>;
