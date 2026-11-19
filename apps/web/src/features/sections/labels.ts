import { formatHoleSize, HOLE_SIZES, HOLE_TYPES } from "schema";
import type { SelectOption } from "@/components/ui/select";

// Labels are a display concern. The value lists come from packages/schema.
// A select holds text, so a hole size travels as text and is converted back on submit.
export const HOLE_SIZE_OPTIONS: SelectOption[] = HOLE_SIZES.map((size) => ({
  value: String(size),
  label: formatHoleSize(size),
}));

const HOLE_TYPE_LABELS: Record<(typeof HOLE_TYPES)[number], string> = {
  conductor: "Conductor",
  casing: "Casing",
  liner: "Liner",
  open_hole: "Open hole",
};

export const holeTypeLabel = (type: keyof typeof HOLE_TYPE_LABELS) =>
  HOLE_TYPE_LABELS[type];

// A select cannot hold an empty value, so "not set" uses this stand-in.
export const NONE = "none";
export const HOLE_TYPE_OPTIONS: SelectOption[] = [
  { value: NONE, label: "Not set" },
  ...HOLE_TYPES.map((type) => ({ value: type, label: HOLE_TYPE_LABELS[type] })),
];
