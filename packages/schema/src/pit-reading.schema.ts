import * as z from "zod";

// Up to 2 decimals, like the numeric columns that store these values.
const twoDecimals = (value: number) => Math.round(value * 100) / 100 === value;

const pitReadingFields = z.object({
  // Barrels of fluid in the pit on this report. 0 means the pit is empty.
  volume: z
    .number({ error: "Enter the volume, for example 250." })
    .min(0, "The volume cannot be negative.")
    .max(999999.99, "The volume must be 999,999.99 or less.")
    .refine(twoDecimals, { error: "Use at most 2 decimals." }),
  // Pounds per cubic foot (pcf). `null` means "not known" (an empty pit has no weight).
  mud_weight: z
    .number({ error: "Enter the mud weight, for example 130." })
    .positive("The mud weight must be more than 0.")
    .max(9999.99, "The mud weight must be 9,999.99 or less.")
    .refine(twoDecimals, { error: "Use at most 2 decimals." })
    .nullable(),
  // What the pit holds: "Salt Mud", "NaCl Brine"... free text, as on the rig's sheet.
  mud_type: z
    .string({ error: "Enter the mud type." })
    .trim()
    .min(1, "Enter the mud type.")
    .max(100, "The mud type must be 100 characters or fewer.")
    .nullable(),
});

/** Adds the reading of one pit to one daily report. */
export const pitReadingCreateSchema = z.object({
  report_id: z.uuid("Choose a daily report."),
  pit_id: z.uuid("Choose a pit."),
  volume: pitReadingFields.shape.volume,
  mud_weight: pitReadingFields.shape.mud_weight.optional(),
  mud_type: pitReadingFields.shape.mud_type.optional(),
});
export type PitReadingCreate = z.infer<typeof pitReadingCreateSchema>;

// No `.default()` anywhere: inside `.partial()` it would fill missing fields in a patch and
// overwrite stored values.
export const pitReadingUpdateSchema = pitReadingFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type PitReadingUpdate = z.infer<typeof pitReadingUpdateSchema>;
