// The API RP 13D power-law hydraulics (K in equivalent cP, so the viscosity is `K * shear rate^(n - 1)`) and a settling-velocity hole cleaning model, in field
// units (inches, feet, gpm, ppg, psi, cP). Depths come in metres and go out in metres. Every
// function here is pure: the service loads the data and hands it over.

const FT_PER_M = 3.28084;
const PPG_PER_PCF = 1 / 7.48052;
const WATER_PPG = 8.3454;
const GRAVITY_FT_S2 = 32.174;
const FT_S_PER_M_MIN = 1 / 18.288;

export type Regime = "laminar" | "transition" | "turbulent";

// ---- Layout: where every tool is, and which hole surrounds it ----

export type StringTool = {
  tool_type: string;
  length_m: number;
  od_in: number;
  id_in: number;
};

export type GeometryInterval = {
  interval_type: "casing" | "liner" | "open_hole";
  top_md_m: number;
  bottom_md_m: number;
  id_in: number;
};

type PlacedTool = StringTool & { top_md_m: number; bottom_md_m: number };

export type Layout = {
  tools: PlacedTool[];
  annulus: {
    from_md_m: number;
    to_md_m: number;
    hole_id_in: number;
    pipe_od_in: number;
  }[];
  problems: string[];
};

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/**
 * Places the tools from the bit up. `tools` go from the surface to the bit; when they are
 * shorter than the hole, the top tool (the drill pipe) is taken to reach the surface.
 */
function placeTools(tools: StringTool[], bitDepth: number, problems: string[]) {
  const total = tools.reduce((sum, tool) => sum + tool.length_m, 0);
  if (tools.length === 0) {
    problems.push("Add the drill string.");
    return [];
  }
  if (total > bitDepth + 0.01) {
    problems.push(
      `The drill string (${round(total, 2)} m) is longer than the bit depth (${bitDepth} m).`,
    );
    return [];
  }
  const placed: PlacedTool[] = [];
  let position = bitDepth;
  for (const tool of [...tools].reverse()) {
    placed.unshift({
      ...tool,
      top_md_m: position - tool.length_m,
      bottom_md_m: position,
    });
    position -= tool.length_m;
  }
  const top = placed[0];
  if (top) top.top_md_m = 0;
  return placed;
}

/** The tool and the wall that meet at one depth, or what is wrong there. */
function meetingAt(
  placed: PlacedTool[],
  intervals: GeometryInterval[],
  from: number,
  to: number,
) {
  const middle = (from + to) / 2;
  const tool = placed.find(
    (item) => item.top_md_m <= middle && middle < item.bottom_md_m,
  );
  // Where casing and open hole overlap, the tighter one is the wall.
  const wall = intervals
    .filter((item) => item.top_md_m <= middle && middle < item.bottom_md_m)
    .sort((a, b) => a.id_in - b.id_in)[0];
  const range = `${round(from, 1)}-${round(to, 1)} m`;
  if (!tool || !wall) {
    return {
      problem: `The wellbore geometry does not cover ${range}.`,
      hole_id_in: 0,
      pipe_od_in: 0,
    };
  }
  if (wall.id_in <= tool.od_in) {
    return {
      problem: `At ${range} the ${tool.tool_type} (${tool.od_in}") does not fit in the ${wall.id_in}" hole.`,
      hole_id_in: 0,
      pipe_od_in: 0,
    };
  }
  return { problem: undefined, hole_id_in: wall.id_in, pipe_od_in: tool.od_in };
}

export function buildLayout(
  tools: StringTool[],
  intervals: GeometryInterval[],
  bitDepth: number,
): Layout {
  const problems: string[] = [];
  const placed = placeTools(tools, bitDepth, problems);
  if (intervals.length === 0) problems.push("Add the wellbore geometry.");
  if (placed.length === 0 || intervals.length === 0) {
    return { tools: placed, annulus: [], problems };
  }

  const points = new Set<number>([0, bitDepth]);
  for (const edge of [
    ...placed.flatMap((tool) => [tool.top_md_m, tool.bottom_md_m]),
    ...intervals.flatMap((item) => [item.top_md_m, item.bottom_md_m]),
  ]) {
    if (edge > 0 && edge < bitDepth) points.add(edge);
  }
  const depths = [...points].sort((a, b) => a - b);

  const annulus: Layout["annulus"] = [];
  for (let index = 0; index < depths.length - 1; index++) {
    const from = depths[index] as number;
    const to = depths[index + 1] as number;
    const found = meetingAt(placed, intervals, from, to);
    if (found.problem !== undefined) {
      problems.push(found.problem);
      continue;
    }
    // Neighbours with the same pipe in the same hole are one stretch.
    const last = annulus[annulus.length - 1];
    if (
      last &&
      last.to_md_m === from &&
      last.hole_id_in === found.hole_id_in &&
      last.pipe_od_in === found.pipe_od_in
    ) {
      last.to_md_m = to;
    } else {
      annulus.push({
        from_md_m: from,
        to_md_m: to,
        hole_id_in: found.hole_id_in,
        pipe_od_in: found.pipe_od_in,
      });
    }
  }
  return { tools: placed, annulus, problems };
}

// ---- Fluid ----

export type PowerLaw = { n: number; k: number };

export type FluidReadings = {
  r600: number;
  r300: number;
  r100: number | null;
  r3: number | null;
};

/**
 * Pipe flow uses the 600 and 300 rpm readings, the annulus the 100 and 3 rpm readings (API RP
 * 13D). Without those two, the annulus uses the pipe's values.
 */
export function fluidModels(readings: FluidReadings) {
  const { r600, r300, r100, r3 } = readings;
  if (r600 <= r300 || r300 <= 0) return null;
  const nPipe = Math.log10(r600 / r300) / Math.log10(2);
  const pipe: PowerLaw = { n: nPipe, k: (510 * r300) / 511 ** nPipe };
  if (r100 === null || r3 === null || r100 <= r3 || r3 <= 0) {
    return { pipe, annulus: pipe };
  }
  const nAnnulus = 0.657 * Math.log10(r100 / r3);
  return {
    pipe,
    annulus: { n: nAnnulus, k: (510 * r100) / 170.2 ** nAnnulus },
  };
}

type FlowResult = {
  velocity_ft_s: number;
  viscosity_cp: number;
  reynolds: number;
  regime: Regime;
  gradient_psi_ft: number;
};

const turbulentFriction = (reynolds: number, n: number) =>
  (Math.log10(n) + 3.93) / 50 / reynolds ** ((1.75 - Math.log10(n)) / 7);

function friction(reynolds: number, n: number, laminarConstant: number) {
  const laminarLimit = 3470 - 1370 * n;
  const turbulentLimit = 4270 - 1370 * n;
  if (reynolds <= laminarLimit) {
    return { f: laminarConstant / reynolds, regime: "laminar" as const };
  }
  if (reynolds >= turbulentLimit) {
    return { f: turbulentFriction(reynolds, n), regime: "turbulent" as const };
  }
  // Between the two limits the factor moves in a straight line from one to the other.
  const low = laminarConstant / laminarLimit;
  const high = turbulentFriction(turbulentLimit, n);
  const share = (reynolds - laminarLimit) / (turbulentLimit - laminarLimit);
  return { f: low + share * (high - low), regime: "transition" as const };
}

function pipeFlow(
  flowrate: number,
  idIn: number,
  weightPpg: number,
  { n, k }: PowerLaw,
): FlowResult {
  const velocity = (0.408 * flowrate) / idIn ** 2;
  const viscosity =
    k * (((96 * velocity) / idIn) * ((3 * n + 1) / (4 * n))) ** (n - 1);
  const reynolds = (928 * weightPpg * velocity * idIn) / viscosity;
  const { f, regime } = friction(reynolds, n, 16);
  return {
    velocity_ft_s: velocity,
    viscosity_cp: viscosity,
    reynolds,
    regime,
    gradient_psi_ft: (f * weightPpg * velocity ** 2) / (25.81 * idIn),
  };
}

function annulusFlow(
  flowrate: number,
  holeIn: number,
  pipeIn: number,
  weightPpg: number,
  { n, k }: PowerLaw,
): FlowResult {
  const gap = holeIn - pipeIn;
  const velocity = (0.408 * flowrate) / (holeIn ** 2 - pipeIn ** 2);
  const viscosity =
    k * (((144 * velocity) / gap) * ((2 * n + 1) / (3 * n))) ** (n - 1);
  const reynolds = (928 * weightPpg * velocity * gap) / viscosity;
  const { f, regime } = friction(reynolds, n, 24);
  return {
    velocity_ft_s: velocity,
    viscosity_cp: viscosity,
    reynolds,
    regime,
    gradient_psi_ft: (f * weightPpg * velocity ** 2) / (25.81 * gap),
  };
}

// ---- Pressure loss ----

export type PressureLossInput = {
  layout: Layout;
  bit: { size_in: number; nozzles: { size_32nds: number; qty: number }[] };
  flowrate_gpm: number;
  mud_weight_pcf: number;
  fluid: NonNullable<ReturnType<typeof fluidModels>>;
  bit_depth_m: number;
  bit_tvd_m: number;
  // The deepest end of a casing or liner: the ECD is also given there.
  shoe_md_m: number | null;
};

export type PressureLossResult = {
  pipe: {
    tool_type: string;
    from_md_m: number;
    to_md_m: number;
    length_m: number;
    id_in: number;
    velocity_m_min: number;
    reynolds: number;
    regime: Regime;
    pressure_loss_psi: number;
  }[];
  annulus: {
    from_md_m: number;
    to_md_m: number;
    length_m: number;
    hole_id_in: number;
    pipe_od_in: number;
    velocity_m_min: number;
    reynolds: number;
    regime: Regime;
    pressure_loss_psi: number;
  }[];
  bit: {
    tfa_in2: number;
    pressure_loss_psi: number;
    hhp: number;
    hsi: number;
    jet_velocity_m_s: number;
    impact_force_lbf: number;
  };
  pipe_pressure_loss_psi: number;
  annulus_pressure_loss_psi: number;
  // Pump pressure needed to circulate: pipe + bit + annulus (no surface lines or motor).
  total_pressure_loss_psi: number;
  ecd_at_bit_pcf: number;
  ecd_at_shoe_pcf: number | null;
};

const IMPACT_DISCHARGE_COEFFICIENT = 0.95;

/** The total flow area of the nozzles, in square inches. */
export const totalFlowArea = (nozzles: { size_32nds: number; qty: number }[]) =>
  nozzles.reduce(
    (sum, nozzle) => sum + nozzle.qty * 0.7854 * (nozzle.size_32nds / 32) ** 2,
    0,
  );

export function computePressureLoss(
  input: PressureLossInput,
): PressureLossResult {
  const weightPpg = input.mud_weight_pcf * PPG_PER_PCF;
  const q = input.flowrate_gpm;

  const pipe = input.layout.tools.map((tool) => {
    const flow = pipeFlow(q, tool.id_in, weightPpg, input.fluid.pipe);
    const loss = flow.gradient_psi_ft * tool.length_m * FT_PER_M;
    return {
      tool_type: tool.tool_type,
      from_md_m: round(tool.top_md_m, 2),
      to_md_m: round(tool.bottom_md_m, 2),
      length_m: round(tool.bottom_md_m - tool.top_md_m, 2),
      id_in: tool.id_in,
      velocity_m_min: round(flow.velocity_ft_s / FT_S_PER_M_MIN, 1),
      reynolds: Math.round(flow.reynolds),
      regime: flow.regime,
      pressure_loss_psi: loss,
    };
  });

  const annulus = input.layout.annulus.map((segment) => {
    const flow = annulusFlow(
      q,
      segment.hole_id_in,
      segment.pipe_od_in,
      weightPpg,
      input.fluid.annulus,
    );
    const length = segment.to_md_m - segment.from_md_m;
    return {
      from_md_m: round(segment.from_md_m, 2),
      to_md_m: round(segment.to_md_m, 2),
      length_m: round(length, 2),
      hole_id_in: segment.hole_id_in,
      pipe_od_in: segment.pipe_od_in,
      velocity_m_min: round(flow.velocity_ft_s / FT_S_PER_M_MIN, 1),
      reynolds: Math.round(flow.reynolds),
      regime: flow.regime,
      pressure_loss_psi: flow.gradient_psi_ft * length * FT_PER_M,
    };
  });

  const tfa = totalFlowArea(input.bit.nozzles);
  const bitLoss = (weightPpg * q ** 2) / (10858 * tfa ** 2);
  const hhp = (bitLoss * q) / 1714;

  const annulusTotal = annulus.reduce(
    (sum, item) => sum + item.pressure_loss_psi,
    0,
  );
  const pipeTotal = pipe.reduce((sum, item) => sum + item.pressure_loss_psi, 0);
  const tvdFt = input.bit_tvd_m * FT_PER_M;

  // The ECD at the shoe counts only the annulus above it, on the vertical depth of the shoe
  // (the bit's vertical depth in proportion to the measured depth).
  let ecdAtShoe: number | null = null;
  const shoeMd = input.shoe_md_m;
  if (shoeMd !== null && shoeMd > 0) {
    const shoeTvdFt = shoeMd * (input.bit_tvd_m / input.bit_depth_m) * FT_PER_M;
    const aboveShoe = annulus
      .filter((item) => item.to_md_m <= shoeMd)
      .reduce((sum, item) => sum + item.pressure_loss_psi, 0);
    ecdAtShoe = (weightPpg + aboveShoe / (0.052 * shoeTvdFt)) / PPG_PER_PCF;
  }

  return {
    pipe: pipe.map((item) => ({
      ...item,
      pressure_loss_psi: round(item.pressure_loss_psi, 1),
    })),
    annulus: annulus.map((item) => ({
      ...item,
      pressure_loss_psi: round(item.pressure_loss_psi, 1),
    })),
    bit: {
      tfa_in2: round(tfa, 3),
      pressure_loss_psi: round(bitLoss, 1),
      hhp: round(hhp, 1),
      hsi: round(hhp / (0.7854 * input.bit.size_in ** 2), 2),
      jet_velocity_m_s: round((0.3208 * q) / tfa / FT_PER_M, 1),
      impact_force_lbf: round(
        0.01823 *
          IMPACT_DISCHARGE_COEFFICIENT *
          q *
          Math.sqrt(weightPpg * bitLoss),
        0,
      ),
    },
    pipe_pressure_loss_psi: round(pipeTotal, 1),
    annulus_pressure_loss_psi: round(annulusTotal, 1),
    total_pressure_loss_psi: round(pipeTotal + bitLoss + annulusTotal, 1),
    ecd_at_bit_pcf: round(
      (weightPpg + annulusTotal / (0.052 * tvdFt)) / PPG_PER_PCF,
      2,
    ),
    ecd_at_shoe_pcf: ecdAtShoe === null ? null : round(ecdAtShoe, 2),
  };
}

// ---- Hole cleaning ----

export type HoleCleaningInput = {
  layout: Layout;
  flowrate_gpm: number;
  mud_weight_pcf: number;
  fluid: NonNullable<ReturnType<typeof fluidModels>>;
  rop_m_hr: number;
  cuttings_diameter_in: number;
  cuttings_density_sg: number;
};

export type CleaningStatus = "good" | "poor" | "not_cleaning";

export type HoleCleaningResult = {
  from_md_m: number;
  to_md_m: number;
  hole_id_in: number;
  pipe_od_in: number;
  annular_velocity_m_min: number;
  slip_velocity_m_min: number;
  transport_velocity_m_min: number;
  transport_ratio_percent: number;
  // Percent of the annulus volume that is cuttings. `null` when they are not carried up.
  cuttings_concentration_percent: number | null;
  status: CleaningStatus;
}[];

// 5% is the usual limit of cuttings in the annulus.
const MAX_CONCENTRATION_PERCENT = 5;

/**
 * The speed at which a cutting sinks in the moving mud: the drag of a sphere (Schiller-Naumann
 * drag coefficient) against its weight in the mud, solved by iteration.
 */
export function slipVelocity(
  diameterIn: number,
  cuttingsSg: number,
  weightPpg: number,
  viscosityCp: number,
) {
  const cuttingsPpg = cuttingsSg * WATER_PPG;
  if (cuttingsPpg <= weightPpg) return 0;
  const diameterFt = diameterIn / 12;
  const excess = (cuttingsPpg - weightPpg) / weightPpg;
  let velocity = 1; // ft/s, the first guess
  for (let step = 0; step < 100; step++) {
    const reynolds = (928 * weightPpg * velocity * diameterIn) / viscosityCp;
    const drag =
      reynolds < 1000 ? (24 / reynolds) * (1 + 0.15 * reynolds ** 0.687) : 0.44;
    const next = Math.sqrt(
      (4 * GRAVITY_FT_S2 * diameterFt * excess) / (3 * drag),
    );
    if (Math.abs(next - velocity) < 1e-6) return next;
    // Half of the new guess and half of the old one: it settles instead of swinging.
    velocity = (velocity + next) / 2;
  }
  return velocity;
}

export function computeHoleCleaning(
  input: HoleCleaningInput,
): HoleCleaningResult {
  const weightPpg = input.mud_weight_pcf * PPG_PER_PCF;
  const ropFtHr = input.rop_m_hr * FT_PER_M;

  return input.layout.annulus.map((segment) => {
    const flow = annulusFlow(
      input.flowrate_gpm,
      segment.hole_id_in,
      segment.pipe_od_in,
      weightPpg,
      input.fluid.annulus,
    );
    const slip = slipVelocity(
      input.cuttings_diameter_in,
      input.cuttings_density_sg,
      weightPpg,
      flow.viscosity_cp,
    );
    const transport = flow.velocity_ft_s - slip;
    const ratio = transport / flow.velocity_ft_s;
    // Cuttings made per minute, spread over what the mud carries up: ROP x hole area / (Q x ratio).
    const concentration =
      transport > 0
        ? (ropFtHr * segment.hole_id_in ** 2) /
          (14.7 * input.flowrate_gpm * ratio)
        : null;
    let status: CleaningStatus = "not_cleaning";
    if (concentration !== null) {
      status = concentration <= MAX_CONCENTRATION_PERCENT ? "good" : "poor";
    }
    return {
      from_md_m: round(segment.from_md_m, 2),
      to_md_m: round(segment.to_md_m, 2),
      hole_id_in: segment.hole_id_in,
      pipe_od_in: segment.pipe_od_in,
      annular_velocity_m_min: round(flow.velocity_ft_s / FT_S_PER_M_MIN, 1),
      slip_velocity_m_min: round(slip / FT_S_PER_M_MIN, 1),
      transport_velocity_m_min: round(transport / FT_S_PER_M_MIN, 1),
      transport_ratio_percent: round(ratio * 100, 1),
      cuttings_concentration_percent:
        concentration === null ? null : round(concentration, 2),
      status,
    };
  });
}
