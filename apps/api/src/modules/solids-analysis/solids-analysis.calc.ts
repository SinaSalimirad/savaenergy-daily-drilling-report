// The API standard solids analysis of a water-based mud (API RP 13B-1), as the rig's
// "Solid Ana" sheet does it: the retort and the chlorides give the volume of dissolved salt,
// and the mud weight then splits the rest between low and high gravity solids.

/** One row of the NaCl salt table: the brine at one weight percent of salt. */
export type BrineRow = {
  weight_percent: number;
  density_kg_l: number;
  chloride_mg_l: number;
  water_bbl: number;
};

export type SolidsInput = {
  mud_weight_pcf: number | null;
  mbt_lb_bbl: number | null;
  chloride_mg_l: number | null;
  oil_percent: number | null;
  water_percent: number | null;
  solids_percent: number | null;
  glycol_percent: number | null;
};

export type SolidsResults = {
  salt_weight_percent: number | null; // % NaCl by weight in the water
  salt_water_sg: number | null;
  salt_volume_percent: number | null; // % of the mud, dissolved in the water
  corrected_solids_percent: number | null; // retort solids minus the salt
  average_solids_sg: number | null;
  bentonite_percent: number | null; // % of the mud volume
  bentonite_lb_bbl: number | null;
  low_gravity_percent: number | null; // bentonite included
  low_gravity_lb_bbl: number | null;
  drilled_solids_percent: number | null; // low gravity solids without the bentonite
  high_gravity_percent: number | null;
  high_gravity_lb_bbl: number | null;
};

const EMPTY_RESULTS: SolidsResults = {
  salt_weight_percent: null,
  salt_water_sg: null,
  salt_volume_percent: null,
  corrected_solids_percent: null,
  average_solids_sg: null,
  bentonite_percent: null,
  bentonite_lb_bbl: null,
  low_gravity_percent: null,
  low_gravity_lb_bbl: null,
  drilled_solids_percent: null,
  high_gravity_percent: null,
  high_gravity_lb_bbl: null,
};

// Densities (S.G.) of what the mud holds. The oil, glycol and barite values are the sheet's.
const OIL_SG = 0.84;
const GLYCOL_SG = 0.97;
const LOW_GRAVITY_SG = 2.6;
const HIGH_GRAVITY_SG = 4.18;
const BENTONITE_SG = 2.6;
const WATER_PCF = 62.35;
// Pounds of water in a barrel: a solid of S.G. 1 at 1% of the volume weighs 3.5 lb/bbl.
const LB_BBL_PER_PERCENT_SG = 3.5;

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** Linear interpolation of `pick(y)` between the two rows around `x` (clamped to the table). */
function interpolate(
  rows: BrineRow[],
  x: number,
  key: (row: BrineRow) => number,
  pick: (row: BrineRow) => number,
) {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return null;
  if (x <= key(first)) return pick(first);
  if (x >= key(last)) return pick(last);
  const upperIndex = rows.findIndex((row) => key(row) >= x);
  const upper = rows[upperIndex];
  const lower = rows[upperIndex - 1];
  if (!upper || !lower) return null;
  const share = (x - key(lower)) / (key(upper) - key(lower));
  return pick(lower) + share * (pick(upper) - pick(lower));
}

export function computeSolidsAnalysis(
  input: SolidsInput,
  brine: BrineRow[],
): SolidsResults {
  const oil = input.oil_percent ?? 0;
  const glycol = input.glycol_percent ?? 0;
  const { mud_weight_pcf: mudWeight, water_percent: water } = input;
  const retortSolids = input.solids_percent;
  if (mudWeight === null || water === null || retortSolids === null) {
    return EMPTY_RESULTS;
  }

  // The chlorides tell how salty the water is. No chlorides, no salt.
  const chlorides = input.chloride_mg_l ?? 0;
  const saltWeight =
    chlorides > 0
      ? interpolate(
          brine,
          chlorides,
          (row) => row.chloride_mg_l,
          (row) => row.weight_percent,
        )
      : 0;
  const saltWaterSg =
    chlorides > 0
      ? interpolate(
          brine,
          chlorides,
          (row) => row.chloride_mg_l,
          (row) => row.density_kg_l,
        )
      : 1;
  const waterBbl =
    chlorides > 0
      ? interpolate(
          brine,
          chlorides,
          (row) => row.chloride_mg_l,
          (row) => row.water_bbl,
        )
      : 1;
  if (saltWeight === null || saltWaterSg === null || waterBbl === null) {
    return EMPTY_RESULTS;
  }

  // The retort measures the water only: the salt that was dissolved in it stays behind as
  // "solids", so it is taken out of them.
  const saltVolume = water * (1 - waterBbl);
  const brineVolume = water + saltVolume;
  const correctedSolids = retortSolids - saltVolume;
  const results = {
    ...EMPTY_RESULTS,
    salt_weight_percent: round(saltWeight, 2),
    salt_water_sg: round(saltWaterSg, 3),
    salt_volume_percent: round(saltVolume, 2),
    corrected_solids_percent: round(correctedSolids, 2),
  };
  if (correctedSolids <= 0) return results;

  // What is left of the mud weight after the liquids is carried by the solids.
  const mudSg = mudWeight / WATER_PCF;
  const averageSg =
    (100 * mudSg -
      brineVolume * saltWaterSg -
      oil * OIL_SG -
      glycol * GLYCOL_SG) /
    correctedSolids;

  // Bentonite is estimated from the MBT. Two kinds of solids share the rest: low gravity
  // (S.G. 2.6) and barite (4.18), whose average must be the average S.G. of the solids.
  const bentoniteLb = input.mbt_lb_bbl ?? 0;
  const bentonite = bentoniteLb / (BENTONITE_SG * LB_BBL_PER_PERCENT_SG);
  const highShare =
    (averageSg - LOW_GRAVITY_SG) / (HIGH_GRAVITY_SG - LOW_GRAVITY_SG);
  const high = Math.min(Math.max(highShare, 0), 1) * correctedSolids;
  const low = correctedSolids - high;
  const drilled = Math.max(low - bentonite, 0);

  return {
    ...results,
    average_solids_sg: round(averageSg, 2),
    bentonite_percent: round(bentonite, 2),
    bentonite_lb_bbl: round(bentoniteLb, 1),
    low_gravity_percent: round(low, 2),
    low_gravity_lb_bbl: round(low * LOW_GRAVITY_SG * LB_BBL_PER_PERCENT_SG, 1),
    drilled_solids_percent: round(drilled, 2),
    high_gravity_percent: round(high, 2),
    high_gravity_lb_bbl: round(
      high * HIGH_GRAVITY_SG * LB_BBL_PER_PERCENT_SG,
      1,
    ),
  };
}
