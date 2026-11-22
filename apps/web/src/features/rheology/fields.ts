import type { FieldDef } from "../fluid-samples/fields";
import { computedLine, linesFromDefs } from "../fluid-samples/lines";
import type { RheologyReading } from "./api";

// The viscometer readings and gels of the rig's mud report.
export const RHEOLOGY_DEFS: FieldDef[] = [
  { name: "sample_time", label: "Time", kind: "time" },
  { name: "temperature_f", label: "Temperature", unit: "°F", kind: "number" },
  { name: "r600", label: "R600", kind: "number" },
  { name: "r300", label: "R300", kind: "number" },
  { name: "r200", label: "R200", kind: "number" },
  { name: "r100", label: "R100", kind: "number" },
  { name: "r6", label: "R6", kind: "number" },
  { name: "r3", label: "R3", kind: "number" },
  { name: "gel_10s", label: "Gel 10 s", unit: "lb/100ft²", kind: "number" },
  { name: "gel_10m", label: "Gel 10 min", unit: "lb/100ft²", kind: "number" },
  { name: "gel_30m", label: "Gel 30 min", unit: "lb/100ft²", kind: "number" },
];

// The readings, then what the server computes from them (API standard formulas).
export const RHEOLOGY_LINES = [
  ...linesFromDefs<RheologyReading>(RHEOLOGY_DEFS),
  computedLine<RheologyReading>("PV", "cP", "plastic_viscosity", 1),
  computedLine<RheologyReading>("YP", "lb/100ft²", "yield_point", 1),
  computedLine<RheologyReading>("n (power law)", undefined, "n_power_law", 3),
  computedLine<RheologyReading>("K (power law)", "eq. cP", "k_power_law", 2),
  computedLine<RheologyReading>(
    "LSYP",
    "lb/100ft²",
    "low_shear_yield_point",
    1,
  ),
  computedLine<RheologyReading>(
    "n (Herschel-Bulkley)",
    undefined,
    "n_herschel_bulkley",
    3,
  ),
  computedLine<RheologyReading>(
    "K (Herschel-Bulkley)",
    "eq. cP",
    "k_herschel_bulkley",
    2,
  ),
];
