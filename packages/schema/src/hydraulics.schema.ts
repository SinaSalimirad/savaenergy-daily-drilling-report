import * as z from "zod";
import { measurement } from "./fluid-sample.schema";

// The geometry, the string, the bit and the survey of a well, and the daily inputs of the
// hydraulics. The pressure loss and the hole cleaning are computed from them by the API.

/** A required measurement: more than 0, with at most `decimals` decimals. */
function required(
  label: string,
  { max, decimals = 2 }: { max: number; decimals?: number },
) {
  return measurement(label, { max, decimals })
    .unwrap()
    .refine((value) => value > 0, { error: `${label} must be more than 0.` });
}

const rowOrder = z
  .number({ error: "Enter a whole number, for example 1." })
  .int("Enter a whole number, for example 1.")
  .min(1, "Order must be at least 1.")
  .max(100, "Order must be 100 or less.");

const atLeastOne = { message: "Send at least one field to update" };

// ---- Wellbore geometry ----

export const WELLBORE_INTERVAL_TYPES = [
  "casing",
  "liner",
  "open_hole",
] as const;
export const wellboreIntervalTypeSchema = z.enum(WELLBORE_INTERVAL_TYPES);
export type WellboreIntervalType = z.infer<typeof wellboreIntervalTypeSchema>;

const wellboreIntervalFields = z.object({
  order: rowOrder,
  interval_type: wellboreIntervalTypeSchema,
  top_md_m: measurement("the top depth", {
    max: 99999.99,
    decimals: 2,
  }).unwrap(),
  bottom_md_m: required("The bottom depth", { max: 99999.99 }),
  // Casing and liner: the outside diameter. An open hole has none (`null`).
  od_in: measurement("the O.D.", { max: 99.999, decimals: 3 }),
  // Casing and liner: the inside diameter. Open hole: the diameter of the hole.
  id_in: required("The I.D.", { max: 99.999, decimals: 3 }),
  linear_weight_lb_ft: measurement("the weight", { max: 9999.99, decimals: 2 }),
});

export const wellboreIntervalCreateSchema = wellboreIntervalFields
  .partial({ order: true, od_in: true, linear_weight_lb_ft: true })
  .extend({ report_id: z.uuid("Choose a daily report.") })
  .refine((interval) => interval.bottom_md_m > interval.top_md_m, {
    path: ["bottom_md_m"],
    error: "The bottom must be deeper than the top.",
  });
export type WellboreIntervalCreate = z.infer<
  typeof wellboreIntervalCreateSchema
>;

export const wellboreIntervalUpdateSchema = wellboreIntervalFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, atLeastOne);
export type WellboreIntervalUpdate = z.infer<
  typeof wellboreIntervalUpdateSchema
>;

// ---- Drill string (BHA) ----

const drillStringToolFields = z.object({
  order: rowOrder,
  // "5\" DP", "5\" HWDP", "Whip Stock"... free text, as on the rig's sheet.
  tool_type: z
    .string({ error: "Enter the tool type." })
    .trim()
    .min(1, "Enter the tool type.")
    .max(100, "The tool type must be 100 characters or fewer."),
  length_m: required("The length", { max: 99999.99 }),
  od_in: required("The O.D.", { max: 99.999, decimals: 3 }),
  id_in: required("The I.D.", { max: 99.999, decimals: 3 }),
});

export const drillStringToolCreateSchema = drillStringToolFields
  .partial({ order: true })
  .extend({ report_id: z.uuid("Choose a daily report.") })
  .refine((tool) => tool.od_in > tool.id_in, {
    path: ["id_in"],
    error: "The I.D. must be smaller than the O.D.",
  });
export type DrillStringToolCreate = z.infer<typeof drillStringToolCreateSchema>;

export const drillStringToolUpdateSchema = drillStringToolFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, atLeastOne);
export type DrillStringToolUpdate = z.infer<typeof drillStringToolUpdateSchema>;

// ---- Bit ----

export const bitNozzleSchema = z.object({
  // In 32nds of an inch: 12 is a 12/32" nozzle.
  size_32nds: z
    .number({ error: "Enter the nozzle size, for example 12." })
    .int("Use a whole number of 32nds.")
    .min(1, "The nozzle size must be at least 1.")
    .max(64, "The nozzle size must be 64 or less."),
  qty: z
    .number({ error: "Enter how many nozzles, for example 3." })
    .int("Use a whole number.")
    .min(1, "Enter at least 1 nozzle.")
    .max(20, "At most 20 nozzles."),
});
export type BitNozzle = z.infer<typeof bitNozzleSchema>;

const bitFields = z.object({
  bit_type: z
    .string({ error: "Enter the bit type." })
    .trim()
    .min(1, "Enter the bit type.")
    .max(100, "The bit type must be 100 characters or fewer."),
  size_in: required("The bit size", { max: 99.999, decimals: 3 }),
  manufacturer: z
    .string()
    .trim()
    .min(1, "Enter the manufacturer.")
    .max(100, "The manufacturer must be 100 characters or fewer.")
    .nullable(),
  nozzles: z.array(bitNozzleSchema).max(10, "At most 10 nozzle sizes."),
});

/** One bit per daily report. */
export const bitCreateSchema = bitFields
  .partial({ manufacturer: true, nozzles: true })
  .extend({ report_id: z.uuid("Choose a daily report.") });
export type BitCreate = z.infer<typeof bitCreateSchema>;

export const bitUpdateSchema = bitFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, atLeastOne);
export type BitUpdate = z.infer<typeof bitUpdateSchema>;

// ---- Survey ----

const surveyFields = z.object({
  md_m: measurement("the measured depth", {
    max: 99999.99,
    decimals: 2,
  }).unwrap(),
  inclination_deg: measurement("the inclination", {
    max: 180,
    decimals: 2,
  }).unwrap(),
  azimuth_deg: z
    .number({ error: "Enter the azimuth as a number." })
    .min(0, "The azimuth cannot be negative.")
    .lt(360, "The azimuth must be less than 360.")
    .refine((value) => Math.abs(Math.round(value * 100) / 100 - value) < 1e-9, {
      error: "Use at most 2 decimals.",
    }),
});

/** One station of the survey of a well. */
export const surveyStationCreateSchema = surveyFields.extend({
  well_id: z.uuid("Choose a well."),
});
export type SurveyStationCreate = z.infer<typeof surveyStationCreateSchema>;

export const surveyStationUpdateSchema = surveyFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, atLeastOne);
export type SurveyStationUpdate = z.infer<typeof surveyStationUpdateSchema>;

// ---- Daily inputs of the hydraulics ----

const hydraulicInputFields = z.object({
  flowrate_gpm: measurement("the flowrate", { max: 99999.9, decimals: 1 }),
  rop_m_hr: measurement("the ROP", { max: 9999.99, decimals: 2 }),
  // The cuttings that the hole cleaning follows. The sheet's default is a 1/4" shale chip.
  cuttings_diameter_in: measurement("the cuttings diameter", {
    max: 9.999,
    decimals: 3,
  }),
  cuttings_density_sg: measurement("the cuttings density", {
    max: 9.99,
    decimals: 2,
  }),
});

/** Sets the inputs of one daily report (it has one set: a second call replaces the first). */
export const hydraulicInputSetSchema = hydraulicInputFields
  .partial()
  .extend({ report_id: z.uuid("Choose a daily report.") });
export type HydraulicInputSet = z.infer<typeof hydraulicInputSetSchema>;
