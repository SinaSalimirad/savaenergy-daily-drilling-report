import { PUMP_TYPES, type PumpType } from "schema";
import type { SelectOption } from "@/components/ui/select";

// Labels are a display concern. The value lists come from packages/schema.
const PUMP_TYPE_LABELS: Record<PumpType, string> = {
  triplex: "Triplex",
  duplex: "Duplex",
};

export const pumpTypeLabel = (type: PumpType) => PUMP_TYPE_LABELS[type];

export const PUMP_TYPE_OPTIONS: SelectOption[] = PUMP_TYPES.map((type) => ({
  value: type,
  label: PUMP_TYPE_LABELS[type],
}));

/** `6` -> `6.00`: the sheet shows liner diameters and outputs with two decimals. */
export const formatTwoDecimals = (value: number) => value.toFixed(2);
