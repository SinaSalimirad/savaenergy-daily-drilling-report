"use client";

import { ReportValuesDialog } from "../../fluid-samples/components/report-values-dialog";
import type { FieldDef } from "../../fluid-samples/fields";
import { type HydraulicInput, useSetHydraulicInput } from "../api";

export const FLOW_FIELDS: FieldDef[] = [
  { name: "flowrate_gpm", label: "Flowrate", unit: "gpm", kind: "number" },
  { name: "rop_m_hr", label: "ROP", unit: "m/hr", kind: "number" },
];

export const CUTTINGS_FIELDS: FieldDef[] = [
  {
    name: "cuttings_diameter_in",
    label: "Cuttings diameter",
    unit: "in",
    kind: "number",
  },
  {
    name: "cuttings_density_sg",
    label: "Cuttings density",
    unit: "S.G.",
    kind: "number",
  },
];

/** Sets the daily inputs of the hydraulics (flowrate, ROP, cuttings) of one report. */
export function HydraulicInputsDialog({
  reportId,
  defs,
  input,
}: {
  reportId: string;
  defs: FieldDef[];
  input: HydraulicInput | undefined;
}) {
  const save = useSetHydraulicInput();
  return (
    <ReportValuesDialog
      title="Daily inputs"
      description="What the calculation needs besides the geometry, the string, the bit and the mud."
      triggerLabel="Inputs"
      reportId={reportId}
      defs={defs}
      values={input}
      save={save}
    />
  );
}
