import * as z from "zod";

// Matches numeric(12, 5): at most 7 digits before the point and 5 after it. Optional so a
// report can be saved before every depth is known; `null` lets an edit clear a value.
const depthSchema = (label: string) =>
  z
    .number({ error: `Enter a number for ${label}, for example 1250.5.` })
    .min(0, `${label} cannot be negative.`)
    .lt(10_000_000, `${label} is too large.`)
    .multipleOf(0.00001, "Use at most 5 decimal places.")
    .nullable()
    .optional();

const dailyReportFields = z.object({
  well_id: z.uuid("Choose a well."),
  // The section being drilled that day. It must belong to `well_id`: the database enforces it.
  section_id: z.uuid("Choose a section."),
  // Left out on create, the API uses the next free number of the well.
  report_no: z
    .number({ error: "Enter a whole number, for example 1." })
    .int("Enter a whole number, for example 1.")
    .min(1, "Report number must be at least 1.")
    .max(100_000, "Report number must be 100000 or less."),
  // A calendar date as `YYYY-MM-DD`, the format of a Postgres `date` column.
  report_date: z.iso.date("Enter a valid date."),
  bit_depth_m: depthSchema("Bit depth"),
  bit_td_m: depthSchema("Bit TD"),
  bit_tvd_m: depthSchema("Bit TVD"),
});

export const dailyReportCreateSchema = dailyReportFields.partial({
  report_no: true,
});
export type DailyReportCreate = z.infer<typeof dailyReportCreateSchema>;

// A report cannot move to another well, so `well_id` is not part of a patch. Its section can
// change, and the database still checks that the new section belongs to the report's well.
export const dailyReportUpdateSchema = dailyReportFields
  .omit({ well_id: true })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type DailyReportUpdate = z.infer<typeof dailyReportUpdateSchema>;
