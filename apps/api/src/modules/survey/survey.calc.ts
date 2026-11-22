// Minimum curvature: the standard way to turn a survey (measured depth, inclination, azimuth)
// into vertical depth and the position of the well.

export type Station = {
  md_m: number;
  inclination_deg: number;
  azimuth_deg: number;
};

export type StationResult = {
  tvd_m: number;
  north_m: number;
  east_m: number;
  // Degrees per 30 m.
  dogleg_deg_30m: number;
};

const RAD = Math.PI / 180;
const DOGLEG_LENGTH_M = 30;

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** `stations` must be sorted by measured depth. The surface is the start (0 m, vertical). */
export function computeSurvey(stations: Station[]): StationResult[] {
  let tvd = 0;
  let north = 0;
  let east = 0;
  let previous: Station = { md_m: 0, inclination_deg: 0, azimuth_deg: 0 };

  return stations.map((station) => {
    const i1 = previous.inclination_deg * RAD;
    const i2 = station.inclination_deg * RAD;
    const a1 = previous.azimuth_deg * RAD;
    const a2 = station.azimuth_deg * RAD;
    const length = station.md_m - previous.md_m;

    const cosDogleg =
      Math.cos(i2 - i1) - Math.sin(i1) * Math.sin(i2) * (1 - Math.cos(a2 - a1));
    const dogleg = Math.acos(Math.min(1, Math.max(-1, cosDogleg)));
    // A straight stretch has no curvature, and the ratio factor is then 1.
    const ratio = dogleg < 1e-9 ? 1 : (2 / dogleg) * Math.tan(dogleg / 2);

    north +=
      (length / 2) *
      (Math.sin(i1) * Math.cos(a1) + Math.sin(i2) * Math.cos(a2)) *
      ratio;
    east +=
      (length / 2) *
      (Math.sin(i1) * Math.sin(a1) + Math.sin(i2) * Math.sin(a2)) *
      ratio;
    tvd += (length / 2) * (Math.cos(i1) + Math.cos(i2)) * ratio;

    previous = station;
    return {
      tvd_m: round(tvd, 2),
      north_m: round(north, 2),
      east_m: round(east, 2),
      dogleg_deg_30m:
        length > 0 ? round(((dogleg / RAD) * DOGLEG_LENGTH_M) / length, 2) : 0,
    };
  });
}
