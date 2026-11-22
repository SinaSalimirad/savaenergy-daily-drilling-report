// The mud volume accounting of the rig's sheet, in barrels:
//   end volume = start + received - returned + built - total losses
// where "built" is the water, chemicals and diesel added. The sheet also adds every item up for
// the section and for the well, so the calculation walks the reports of the well in date order.

export const ACCOUNTING_FIELDS = [
  "start_volume_bbl",
  "water_added_bbl",
  "chemical_volume_bbl",
  "diesel_added_bbl",
  "received_bbl",
  "returned_bbl",
] as const;

export const LOSS_FIELDS = [
  "dumped_bbl",
  "shakers_bbl",
  "evaporation_bbl",
  "super_clone_bbl",
  "trip_loss_bbl",
  "desander_desilter_bbl",
  "pit_cleaning_bbl",
  "other_bbl",
  "formation_bbl",
  "left_in_hole_bbl",
] as const;

type Amounts<TKey extends string> = Record<TKey, number | null>;
export type AccountingInput = Amounts<(typeof ACCOUNTING_FIELDS)[number]>;
export type LossInput = Amounts<(typeof LOSS_FIELDS)[number]>;

export type ReportEntry = {
  report_id: string;
  section_id: string;
  accounting: AccountingInput | null;
  losses: LossInput | null;
};

/** Every number of one report's column of the sheet. */
export type Volumes = {
  start_volume: number;
  water_added: number;
  chemical_volume: number;
  diesel_added: number;
  received: number;
  returned: number;
  built: number;
  dumped: number;
  shakers: number;
  evaporation: number;
  super_clone: number;
  trip_loss: number;
  desander_desilter: number;
  pit_cleaning: number;
  other: number;
  formation: number;
  left_in_hole: number;
  total_losses: number;
  end_volume: number;
};

const round = (value: number) => Math.round(value * 100) / 100;
const orZero = (value: number | null | undefined) => value ?? 0;

/**
 * The daily volumes of each entry, in order. An entry without a start volume continues from the
 * end volume of the one before it.
 */
export function dailyVolumes(entries: ReportEntry[]): Volumes[] {
  let previousEnd = 0;
  return entries.map((entry) => {
    const a = entry.accounting;
    const l = entry.losses;
    const start = a?.start_volume_bbl ?? previousEnd;
    const built =
      orZero(a?.water_added_bbl) +
      orZero(a?.chemical_volume_bbl) +
      orZero(a?.diesel_added_bbl);
    const losses = {
      dumped: orZero(l?.dumped_bbl),
      shakers: orZero(l?.shakers_bbl),
      evaporation: orZero(l?.evaporation_bbl),
      super_clone: orZero(l?.super_clone_bbl),
      trip_loss: orZero(l?.trip_loss_bbl),
      desander_desilter: orZero(l?.desander_desilter_bbl),
      pit_cleaning: orZero(l?.pit_cleaning_bbl),
      other: orZero(l?.other_bbl),
      formation: orZero(l?.formation_bbl),
      left_in_hole: orZero(l?.left_in_hole_bbl),
    };
    const total = Object.values(losses).reduce((sum, value) => sum + value, 0);
    const received = orZero(a?.received_bbl);
    const returned = orZero(a?.returned_bbl);
    const end = start + received - returned + built - total;
    previousEnd = end;
    return {
      start_volume: round(start),
      water_added: orZero(a?.water_added_bbl),
      chemical_volume: orZero(a?.chemical_volume_bbl),
      diesel_added: orZero(a?.diesel_added_bbl),
      received,
      returned,
      built: round(built),
      ...losses,
      total_losses: round(total),
      end_volume: round(end),
    };
  });
}

/**
 * The same items added up over a group of reports: every item but the start and the end volume
 * is a sum. The start is the first report's, and the end is the last report's.
 */
export function cumulative(group: Volumes[]): Volumes | null {
  const first = group[0];
  const last = group[group.length - 1];
  if (!first || !last) return null;
  const total = { ...last };
  for (const key of Object.keys(total) as (keyof Volumes)[]) {
    total[key] = round(group.reduce((sum, item) => sum + item[key], 0));
  }
  total.start_volume = first.start_volume;
  total.end_volume = last.end_volume;
  return total;
}

export type BalanceStatus = "balanced" | "gain" | "loss";

// The pits may differ from the books by this share of the volume and still be balanced.
const BALANCE_TOLERANCE = 0.01;

/** Compares the books (end volume) with the pits (what was measured on the report). */
export function balanceOf(endVolume: number, pitVolume: number | null) {
  if (pitVolume === null) return { difference_bbl: null, status: null };
  const difference = round(pitVolume - endVolume);
  const allowed =
    Math.max(Math.abs(endVolume), Math.abs(pitVolume)) * BALANCE_TOLERANCE;
  let status: BalanceStatus = "balanced";
  if (difference > allowed) status = "gain";
  else if (difference < -allowed) status = "loss";
  return { difference_bbl: difference, status };
}
