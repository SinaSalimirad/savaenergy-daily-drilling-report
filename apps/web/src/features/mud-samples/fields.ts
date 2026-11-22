import { MUD_SAMPLE_SOURCES } from "schema";
import type { FieldDef } from "../fluid-samples/fields";
import { linesFromDefs } from "../fluid-samples/lines";
import type { MudSample } from "./api";

// The properties of the rig's mud report, in the order of its sheet.
export const MUD_SAMPLE_DEFS: FieldDef[] = [
  { name: "sample_time", label: "Time", kind: "time" },
  {
    name: "sample_from",
    label: "Sample from",
    kind: "select",
    options: MUD_SAMPLE_SOURCES,
  },
  {
    name: "flowline_temp_f",
    label: "Flow line temp",
    unit: "°F",
    kind: "number",
  },
  { name: "depth_m", label: "Depth", unit: "m", kind: "number" },
  { name: "tvd_m", label: "TVD", unit: "m", kind: "number" },
  { name: "mud_weight_pcf", label: "Mud weight", unit: "pcf", kind: "number" },
  { name: "mud_temp_f", label: "Mud temp", unit: "°F", kind: "number" },
  {
    name: "funnel_viscosity",
    label: "Funnel viscosity",
    unit: "sec/qt",
    kind: "number",
  },
  {
    name: "api_filtrate_cc",
    label: "API filtrate",
    unit: "cc/30min",
    kind: "number",
  },
  {
    name: "hthp_filtrate_cc",
    label: "HTHP filtrate",
    unit: "cc/30min",
    kind: "number",
  },
  { name: "api_cake", label: "API cake", unit: '1/32"', kind: "number" },
  { name: "hthp_cake", label: "HTHP cake", unit: '1/32"', kind: "number" },
  { name: "oil_percent", label: "Oil", unit: "%vol", kind: "number" },
  { name: "water_percent", label: "Water", unit: "%vol", kind: "number" },
  { name: "solids_percent", label: "Solids", unit: "%vol", kind: "number" },
  { name: "sand_percent", label: "Sand", unit: "%vol", kind: "number" },
  { name: "glycol_percent", label: "Glycol", unit: "%vol", kind: "number" },
  { name: "mbt_lb_bbl", label: "MBT", unit: "lb/bbl", kind: "number" },
  { name: "ph", label: "pH", kind: "number" },
  { name: "ph_temp_f", label: "pH temp", unit: "°F", kind: "number" },
  {
    name: "alkalinity_mud_ml",
    label: "Alkalinity mud (Pm)",
    unit: "ml",
    kind: "number",
  },
  { name: "pf_ml", label: "Pf", unit: "ml", kind: "number" },
  { name: "mf_ml", label: "Mf", unit: "ml", kind: "number" },
  { name: "chloride_mg_l", label: "Chlorides", unit: "mg/L", kind: "number" },
  {
    name: "total_hardness_mg_l",
    label: "Total hardness",
    unit: "mg/L",
    kind: "number",
  },
];

export const MUD_SAMPLE_LINES = linesFromDefs<MudSample>(MUD_SAMPLE_DEFS);
