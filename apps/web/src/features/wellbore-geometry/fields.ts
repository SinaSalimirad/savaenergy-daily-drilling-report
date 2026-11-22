import { WELLBORE_INTERVAL_TYPES } from "schema";
import type { FieldDef } from "../fluid-samples/fields";

export const WELLBORE_TYPE_LABELS: Record<
  (typeof WELLBORE_INTERVAL_TYPES)[number],
  string
> = { casing: "Casing", liner: "Liner", open_hole: "Open hole" };

// The columns of the rig's "Well bore Geometry" table.
export const WELLBORE_DEFS: FieldDef[] = [
  { name: "order", label: "Row", kind: "number", omitEmpty: true },
  {
    name: "interval_type",
    label: "Section type",
    kind: "select",
    options: WELLBORE_INTERVAL_TYPES,
  },
  { name: "top_md_m", label: "Top M.D.", unit: "m", kind: "number" },
  { name: "bottom_md_m", label: "Bottom M.D.", unit: "m", kind: "number" },
  {
    name: "od_in",
    label: "O.D. (empty for an open hole)",
    unit: "in",
    kind: "number",
  },
  {
    name: "id_in",
    label: "I.D. (the hole diameter for an open hole)",
    unit: "in",
    kind: "number",
  },
  {
    name: "linear_weight_lb_ft",
    label: "Linear weight",
    unit: "lb/ft",
    kind: "number",
  },
];
