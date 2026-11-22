import type { PitType } from "schema";
import type { PitReading } from "./api";

const NUMBER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `250` -> `250.00`, `1250.5` -> `1,250.50`. */
export const formatAmount = (value: number) => NUMBER.format(value);

export const EMPTY_VALUE = "—";

export type PitTypeTotal = {
  type: PitType;
  volume: number;
  tonnage: number;
};

// The three groups of the sheet's summary, in its order.
const SUMMARY_TYPES: PitType[] = ["active", "reserve", "not mud"];

/** Volume and tonnage of the readings, per pit type, as the summary under the sheet shows. */
export function totalsByPitType(readings: PitReading[]): PitTypeTotal[] {
  return SUMMARY_TYPES.map((type) => {
    const group = readings.filter((reading) => reading.pit_type === type);
    return {
      type,
      volume: group.reduce((sum, reading) => sum + reading.volume, 0),
      tonnage: group.reduce((sum, reading) => sum + (reading.tonnage ?? 0), 0),
    };
  });
}
