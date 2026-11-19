import { PRODUCT_KINDS, PRODUCT_PACKAGE_UNITS } from "schema";
import type { SelectOption } from "@/components/ui/select";

// Labels are a display concern. The value lists come from packages/schema, and `Record`
// makes the compiler fail here when a value is added there without a label.
const KIND_LABELS: Record<(typeof PRODUCT_KINDS)[number], string> = {
  bulk: "Bulk",
  dimensional: "Dimensional",
  equipment: "Equipment",
};

export const productKindLabel = (kind: keyof typeof KIND_LABELS) =>
  KIND_LABELS[kind];

export const KIND_OPTIONS: SelectOption[] = PRODUCT_KINDS.map((kind) => ({
  value: kind,
  label: KIND_LABELS[kind],
}));

const UNIT_LABELS: Record<(typeof PRODUCT_PACKAGE_UNITS)[number], string> = {
  kg: "kg",
  lb: "lb",
  mt: "mt",
  gal: "gal",
  l: "L",
  m3: "m³",
  bbl: "bbl",
};

export const packageUnitLabel = (unit: keyof typeof UNIT_LABELS) =>
  UNIT_LABELS[unit];

export const PACKAGE_UNIT_OPTIONS: SelectOption[] = PRODUCT_PACKAGE_UNITS.map(
  (unit) => ({ value: unit, label: UNIT_LABELS[unit] }),
);
