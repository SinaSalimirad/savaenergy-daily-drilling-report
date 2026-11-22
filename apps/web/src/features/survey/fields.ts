import type { FieldDef } from "../fluid-samples/fields";

export const SURVEY_DEFS: FieldDef[] = [
  { name: "md_m", label: "M.D.", unit: "m", kind: "number" },
  { name: "inclination_deg", label: "Inclination", unit: "°", kind: "number" },
  { name: "azimuth_deg", label: "Azimuth", unit: "°", kind: "number" },
];
