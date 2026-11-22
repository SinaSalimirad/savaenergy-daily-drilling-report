// The API standard formulas for a 6-speed Fann viscometer. Dial readings are in lb/100 ft², and
// 511 is the shear rate (1/s) of the 300 rpm dial.
const SHEAR_RATE_300 = 511;

export type RheologyInput = {
  r600: number | null;
  r300: number | null;
  r6: number | null;
  r3: number | null;
};

export type RheologyResults = {
  // Bingham plastic model.
  plastic_viscosity: number | null; // cP
  yield_point: number | null; // lb/100 ft²
  // Power law model.
  n_power_law: number | null;
  k_power_law: number | null; // equivalent cP
  // Herschel-Bulkley model, with the low shear yield point as its yield stress.
  low_shear_yield_point: number | null; // lb/100 ft²
  n_herschel_bulkley: number | null;
  k_herschel_bulkley: number | null; // equivalent cP
};

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** `n` and `K` of a model whose stress is `reading - yieldStress`, or `null` when undefined. */
function flowIndex(r600: number, r300: number, yieldStress: number) {
  const high = r600 - yieldStress;
  const low = r300 - yieldStress;
  if (high <= 0 || low <= 0) return { n: null, k: null };
  const n = Math.log10(high / low) / Math.log10(2);
  if (n <= 0) return { n: null, k: null };
  const k = (510 * low) / SHEAR_RATE_300 ** n;
  return { n: round(n, 3), k: round(k, 2) };
}

export function computeRheology({
  r600,
  r300,
  r6,
  r3,
}: RheologyInput): RheologyResults {
  const hasBingham = r600 !== null && r300 !== null;
  const plastic = hasBingham ? r600 - r300 : null;
  const lsyp = r6 !== null && r3 !== null ? Math.max(2 * r3 - r6, 0) : null;

  const powerLaw = hasBingham ? flowIndex(r600, r300, 0) : { n: null, k: null };
  const herschel =
    hasBingham && lsyp !== null
      ? flowIndex(r600, r300, lsyp)
      : { n: null, k: null };

  return {
    plastic_viscosity: plastic === null ? null : round(plastic, 1),
    yield_point:
      plastic === null || r300 === null ? null : round(r300 - plastic, 1),
    n_power_law: powerLaw.n,
    k_power_law: powerLaw.k,
    low_shear_yield_point: lsyp === null ? null : round(lsyp, 1),
    n_herschel_bulkley: herschel.n,
    k_herschel_bulkley: herschel.k,
  };
}
