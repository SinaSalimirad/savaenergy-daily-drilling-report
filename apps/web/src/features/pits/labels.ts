import { PIT_TYPES, type PitType } from "schema";
import type { SelectOption } from "@/components/ui/select";

// Labels are a display concern. The value lists come from packages/schema.
const PIT_TYPE_LABELS: Record<PitType, string> = {
  active: "Active",
  reserve: "Reserve",
  "not mud": "Not mud",
};

export const pitTypeLabel = (type: PitType) => PIT_TYPE_LABELS[type];

export const PIT_TYPE_OPTIONS: SelectOption[] = PIT_TYPES.map((type) => ({
  value: type,
  label: PIT_TYPE_LABELS[type],
}));

const CAPACITY_FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `250` -> `250.00`, `1250.5` -> `1,250.50`: the sheet shows capacities in barrels. */
export const formatCapacity = (value: number) => CAPACITY_FORMAT.format(value);
