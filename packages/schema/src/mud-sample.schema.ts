import * as z from "zod";
import {
  atLeastOneField,
  measurement,
  percentMeasurement,
  sampleNoSchema,
  sampleTimeSchema,
} from "./fluid-sample.schema";

// Where the sample was taken, as in the "Sample from" list of the rig's sheet.
export const MUD_SAMPLE_SOURCES = [
  "Active",
  "Reserve",
  "Flow Line",
  "Recd Mud",
  "Return Mud",
  "Treated Fluids",
  "Brine",
  "Bottom's Up",
] as const;
export const mudSampleSourceSchema = z.enum(MUD_SAMPLE_SOURCES);
export type MudSampleSource = z.infer<typeof mudSampleSourceSchema>;

const mudSampleFields = z.object({
  sample_time: sampleTimeSchema,
  sample_from: mudSampleSourceSchema,
  flowline_temp_f: measurement("the flow line temperature", { max: 999.9 }),
  depth_m: measurement("the depth", { max: 99999.99, decimals: 2 }),
  tvd_m: measurement("the TVD", { max: 99999.99, decimals: 2 }),
  // Pounds per cubic foot (pcf).
  mud_weight_pcf: measurement("the mud weight", { max: 9999.99, decimals: 2 }),
  mud_temp_f: measurement("the mud temperature", { max: 999.9 }),
  // Seconds per quart.
  funnel_viscosity: measurement("the funnel viscosity", { max: 999.9 }),
  api_filtrate_cc: measurement("the API filtrate", { max: 999.9 }),
  hthp_filtrate_cc: measurement("the HTHP filtrate", { max: 999.9 }),
  // In 1/32 of an inch.
  api_cake: measurement("the API cake", { max: 999.9 }),
  hthp_cake: measurement("the HTHP cake", { max: 999.9 }),
  oil_percent: percentMeasurement("the oil"),
  water_percent: percentMeasurement("the water"),
  solids_percent: percentMeasurement("the solids"),
  sand_percent: measurement("the sand", { max: 100, decimals: 2 }),
  glycol_percent: percentMeasurement("the glycol"),
  // Pounds per barrel.
  mbt_lb_bbl: measurement("the MBT", { max: 999.9 }),
  ph: measurement("the pH", { max: 14, decimals: 2 }),
  ph_temp_f: measurement("the pH temperature", { max: 999.9 }),
  // Alkalinity of the mud (Pm), the filtrate (Pf, Mf), in ml.
  alkalinity_mud_ml: measurement("the alkalinity", {
    max: 999.99,
    decimals: 2,
  }),
  pf_ml: measurement("the Pf", { max: 999.99, decimals: 2 }),
  mf_ml: measurement("the Mf", { max: 999.99, decimals: 2 }),
  chloride_mg_l: measurement("the chlorides", { max: 1_000_000, decimals: 0 }),
  total_hardness_mg_l: measurement("the total hardness", {
    max: 1_000_000,
    decimals: 0,
  }),
});

/** Adds a sample to one daily report. Without `sample_no`, the API takes the next free one. */
export const mudSampleCreateSchema = mudSampleFields.partial().extend({
  report_id: z.uuid("Choose a daily report."),
  sample_no: sampleNoSchema.optional(),
});
export type MudSampleCreate = z.infer<typeof mudSampleCreateSchema>;

// No `.default()` anywhere: inside `.partial()` it would fill missing fields in a patch and
// overwrite stored values.
export const mudSampleUpdateSchema = mudSampleFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, atLeastOneField);
export type MudSampleUpdate = z.infer<typeof mudSampleUpdateSchema>;
