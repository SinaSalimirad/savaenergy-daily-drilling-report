import type { PitReadingRow } from "./pit-reading.repository";

/** The shape the web app receives, through Eden. */
export type PitReadingDto = {
  id: string;
  report_id: string;
  pit_id: string;
  pit_name: string;
  pit_type: PitReadingRow["pit"]["type"];
  // Barrels. `null` when the capacity of the pit is not known.
  pit_capacity: number | null;
  // The position of the pit on the rig's sheet.
  pit_order: number;
  // Barrels in the pit on this report.
  volume: number;
  // Pounds per cubic foot. `null` when not known.
  mud_weight: number | null;
  mud_type: string | null;
  // Metric tonnes of mud in the pit. `null` when the mud weight is not known.
  tonnage: number | null;
};

// The sheet's constants: water weighs 62.35 pcf, and a cubic metre is 6.29 barrels.
const WATER_PCF = 62.35;
const BARRELS_PER_CUBIC_METRE = 6.29;
const TONNAGE_DECIMALS = 1000;

/** Specific gravity times cubic metres: (pcf / 62.35) x (bbl / 6.29). */
export function tonnageOf(volume: number, mudWeight: number | null) {
  if (mudWeight === null) return null;
  const tonnes = (mudWeight / WATER_PCF) * (volume / BARRELS_PER_CUBIC_METRE);
  return Math.round(tonnes * TONNAGE_DECIMALS) / TONNAGE_DECIMALS;
}

export function toPitReadingDto({
  reading,
  pit,
}: PitReadingRow): PitReadingDto {
  return {
    id: reading.id,
    report_id: reading.report_id,
    pit_id: reading.pit_id,
    pit_name: pit.name,
    pit_type: pit.type,
    pit_capacity: pit.capacity,
    pit_order: pit.order,
    volume: reading.volume,
    mud_weight: reading.mud_weight,
    mud_type: reading.mud_type,
    tonnage: tonnageOf(reading.volume, reading.mud_weight),
  };
}
