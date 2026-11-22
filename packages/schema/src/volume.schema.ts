import * as z from "zod";
import { measurement } from "./fluid-sample.schema";

// The mud volume accounting of a daily report (barrels). One set of each per report: the rig
// types the volumes of the day, and the API adds them up into the totals and the end volume.

const barrels = (label: string) =>
  measurement(label, { max: 9_999_999.99, decimals: 2 });

const volumeAccountingFields = z.object({
  // Left empty, the volume continues from the end volume of the previous report of the well.
  start_volume_bbl: barrels("the start volume"),
  water_added_bbl: barrels("the water added"),
  chemical_volume_bbl: barrels("the chemical volume"),
  diesel_added_bbl: barrels("the diesel added"),
  received_bbl: barrels("the volume received"),
  returned_bbl: barrels("the volume returned"),
});

/** Sets the volume accounting of one report: a second call replaces the values of the first. */
export const volumeAccountingSetSchema = volumeAccountingFields
  .partial()
  .extend({ report_id: z.uuid("Choose a daily report.") });
export type VolumeAccountingSet = z.infer<typeof volumeAccountingSetSchema>;

const mudLossFields = z.object({
  dumped_bbl: barrels("the dumped volume"),
  shakers_bbl: barrels("the shakers loss"),
  evaporation_bbl: barrels("the evaporation"),
  super_clone_bbl: barrels("the super clone loss"),
  trip_loss_bbl: barrels("the trip loss"),
  desander_desilter_bbl: barrels("the desander and desilter loss"),
  pit_cleaning_bbl: barrels("the pit cleaning loss"),
  other_bbl: barrels("the other losses"),
  formation_bbl: barrels("the formation loss"),
  left_in_hole_bbl: barrels("the volume left in the hole"),
});

/** Sets the mud losses of one report: a second call replaces the values of the first. */
export const mudLossSetSchema = mudLossFields
  .partial()
  .extend({ report_id: z.uuid("Choose a daily report.") });
export type MudLossSet = z.infer<typeof mudLossSetSchema>;
