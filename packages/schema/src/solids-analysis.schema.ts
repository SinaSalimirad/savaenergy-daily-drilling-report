import * as z from "zod";
import {
  atLeastOneField,
  measurement,
  percentMeasurement,
  sampleNoSchema,
  sampleTimeSchema,
} from "./fluid-sample.schema";

// What the retort and the titrations measured. The server computes the rest (salt, bentonite,
// low and high gravity solids).
const solidsAnalysisFields = z.object({
  sample_time: sampleTimeSchema,
  // Pounds per cubic foot (pcf).
  mud_weight_pcf: measurement("the mud weight", { max: 9999.99, decimals: 2 }),
  // Pounds per barrel.
  mbt_lb_bbl: measurement("the MBT", { max: 999.9 }),
  chloride_mg_l: measurement("the chlorides", { max: 1_000_000, decimals: 0 }),
  oil_percent: percentMeasurement("the oil"),
  water_percent: percentMeasurement("the water"),
  solids_percent: percentMeasurement("the solids"),
  glycol_percent: percentMeasurement("the glycol"),
});

/** Adds a solids analysis to one daily report. */
export const solidsAnalysisCreateSchema = solidsAnalysisFields
  .partial()
  .extend({
    report_id: z.uuid("Choose a daily report."),
    sample_no: sampleNoSchema.optional(),
  });
export type SolidsAnalysisCreate = z.infer<typeof solidsAnalysisCreateSchema>;

export const solidsAnalysisUpdateSchema = solidsAnalysisFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, atLeastOneField);
export type SolidsAnalysisUpdate = z.infer<typeof solidsAnalysisUpdateSchema>;
