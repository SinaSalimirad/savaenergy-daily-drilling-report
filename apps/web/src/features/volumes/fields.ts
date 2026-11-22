import type { FieldDef } from "../fluid-samples/fields";
import type { VolumeSheet } from "./api";

const bbl = (name: string, label: string): FieldDef => ({
  name,
  label,
  unit: "bbl",
  kind: "number",
});

// What the rig types on the "Mud Volume Accounting" part of the sheet.
export const ACCOUNTING_DEFS: FieldDef[] = [
  bbl(
    "start_volume_bbl",
    "Start volume (empty: the end volume of the last report)",
  ),
  bbl("water_added_bbl", "Water added"),
  bbl("chemical_volume_bbl", "Chemical volume"),
  bbl("diesel_added_bbl", "Diesel added"),
  bbl("received_bbl", "Received"),
  bbl("returned_bbl", "Return"),
];

export const LOSS_DEFS: FieldDef[] = [
  bbl("dumped_bbl", "Dumped"),
  bbl("shakers_bbl", "Shakers"),
  bbl("evaporation_bbl", "Evaporation"),
  bbl("super_clone_bbl", "Super clone"),
  bbl("trip_loss_bbl", "Trip loss"),
  bbl("desander_desilter_bbl", "Desander & desilter"),
  bbl("pit_cleaning_bbl", "Pit cleaning"),
  bbl("other_bbl", "Other"),
  bbl("formation_bbl", "Formation"),
  bbl("left_in_hole_bbl", "Left in hole"),
];

type Item = { key: keyof VolumeSheet["daily"]; label: string; bold?: boolean };

export const ACCOUNTING_ITEMS: Item[] = [
  { key: "start_volume", label: "Start volume" },
  { key: "water_added", label: "Water added" },
  { key: "chemical_volume", label: "Chemical volume" },
  { key: "diesel_added", label: "Diesel added" },
  { key: "received", label: "Received" },
  { key: "returned", label: "Return" },
  { key: "built", label: "Built", bold: true },
  { key: "total_losses", label: "Total losses", bold: true },
  { key: "end_volume", label: "End volume", bold: true },
];

export const LOSS_ITEMS: Item[] = [
  { key: "dumped", label: "Dumped" },
  { key: "shakers", label: "Shakers" },
  { key: "evaporation", label: "Evaporation" },
  { key: "super_clone", label: "Super clone" },
  { key: "trip_loss", label: "Trip loss" },
  { key: "desander_desilter", label: "Desander & desilter" },
  { key: "pit_cleaning", label: "Pit cleaning" },
  { key: "other", label: "Other" },
  { key: "formation", label: "Formation" },
  { key: "left_in_hole", label: "Left in hole" },
  { key: "total_losses", label: "Total losses", bold: true },
];
