import * as z from "zod";
import {
  atLeastOneField,
  measurement,
  sampleNoSchema,
  sampleTimeSchema,
} from "./fluid-sample.schema";

const rheologyFields = z.object({
  sample_time: sampleTimeSchema,
  temperature_f: measurement("the temperature", { max: 999.9 }),
  // Fann viscometer dial readings at 600, 300, 200, 100, 6 and 3 rpm.
  r600: measurement("R600", { max: 999.9 }),
  r300: measurement("R300", { max: 999.9 }),
  r200: measurement("R200", { max: 999.9 }),
  r100: measurement("R100", { max: 999.9 }),
  r6: measurement("R6", { max: 999.9 }),
  r3: measurement("R3", { max: 999.9 }),
  // Gel strengths after 10 seconds, 10 minutes and 30 minutes, in lb/100 ft².
  gel_10s: measurement("the 10 s gel", { max: 999.9 }),
  gel_10m: measurement("the 10 min gel", { max: 999.9 }),
  gel_30m: measurement("the 30 min gel", { max: 999.9 }),
});

/** Adds a rheology reading to one daily report. */
export const rheologyCreateSchema = rheologyFields.partial().extend({
  report_id: z.uuid("Choose a daily report."),
  sample_no: sampleNoSchema.optional(),
});
export type RheologyCreate = z.infer<typeof rheologyCreateSchema>;

export const rheologyUpdateSchema = rheologyFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, atLeastOneField);
export type RheologyUpdate = z.infer<typeof rheologyUpdateSchema>;
