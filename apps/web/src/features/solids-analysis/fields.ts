import type { FieldDef } from "../fluid-samples/fields";
import { computedLine, linesFromDefs } from "../fluid-samples/lines";
import type { SolidsAnalysis } from "./api";

// What the retort and the titrations measured.
export const SOLIDS_ANALYSIS_DEFS: FieldDef[] = [
  { name: "sample_time", label: "Time", kind: "time" },
  { name: "mud_weight_pcf", label: "Mud weight", unit: "pcf", kind: "number" },
  { name: "mbt_lb_bbl", label: "MBT", unit: "lb/bbl", kind: "number" },
  { name: "chloride_mg_l", label: "Chlorides", unit: "mg/L", kind: "number" },
  { name: "oil_percent", label: "Oil", unit: "%vol", kind: "number" },
  { name: "water_percent", label: "Water", unit: "%vol", kind: "number" },
  { name: "solids_percent", label: "Solids", unit: "%vol", kind: "number" },
  { name: "glycol_percent", label: "Glycol", unit: "%vol", kind: "number" },
];

// The measurements, then what the server computes from them (API RP 13B-1 formulas).
export const SOLIDS_ANALYSIS_LINES = [
  ...linesFromDefs<SolidsAnalysis>(SOLIDS_ANALYSIS_DEFS),
  computedLine<SolidsAnalysis>("NaCl", "%wt", "salt_weight_percent", 2),
  computedLine<SolidsAnalysis>(
    "Salt water S.G.",
    undefined,
    "salt_water_sg",
    3,
  ),
  computedLine<SolidsAnalysis>("Salt volume", "%vol", "salt_volume_percent", 2),
  computedLine<SolidsAnalysis>(
    "Corrected solids",
    "%vol",
    "corrected_solids_percent",
    2,
  ),
  computedLine<SolidsAnalysis>(
    "Solids average S.G.",
    undefined,
    "average_solids_sg",
    2,
  ),
  computedLine<SolidsAnalysis>("Bentonite", "%vol", "bentonite_percent", 2),
  computedLine<SolidsAnalysis>("Bentonite", "lb/bbl", "bentonite_lb_bbl", 1),
  computedLine<SolidsAnalysis>("Low gravity", "%vol", "low_gravity_percent", 2),
  computedLine<SolidsAnalysis>(
    "Low gravity",
    "lb/bbl",
    "low_gravity_lb_bbl",
    1,
  ),
  computedLine<SolidsAnalysis>(
    "Drilled solids",
    "%vol",
    "drilled_solids_percent",
    2,
  ),
  computedLine<SolidsAnalysis>(
    "High gravity",
    "%vol",
    "high_gravity_percent",
    2,
  ),
  computedLine<SolidsAnalysis>(
    "High gravity",
    "lb/bbl",
    "high_gravity_lb_bbl",
    1,
  ),
];
