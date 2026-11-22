import { notFound } from "../../lib/errors";
import { findBits } from "../bits/bit.repository";
import { findDrillStringTools } from "../drill-string/drill-string-tool.repository";
import { findMudSamples } from "../mud-samples/mud-sample.repository";
import { findRheologyReadings } from "../rheology/rheology.repository";
import { findWellboreIntervals } from "../wellbore-intervals/wellbore-interval.repository";
import {
  buildLayout,
  computeHoleCleaning,
  computePressureLoss,
  fluidModels,
  type HoleCleaningResult,
  type PressureLossResult,
} from "./hydraulics.calc";
import {
  findHydraulicInput,
  findReportDepths,
  type HydraulicInputRow,
  upsertHydraulicInput,
} from "./hydraulics.repository";
import type {
  HydraulicsQuery,
  SetHydraulicInputBody,
} from "./hydraulics.schemas";

const REPORT = "Daily report";

// The cuttings of the sheet when the report does not say: a 1/4" chip of shale.
const DEFAULT_CUTTINGS_DIAMETER_IN = 0.25;
const DEFAULT_CUTTINGS_DENSITY_SG = 2.5;

export type HydraulicInputDto = {
  report_id: string;
  flowrate_gpm: number | null;
  rop_m_hr: number | null;
  cuttings_diameter_in: number | null;
  cuttings_density_sg: number | null;
};

const toInputDto = (
  reportId: string,
  row: HydraulicInputRow | undefined,
): HydraulicInputDto => ({
  report_id: reportId,
  flowrate_gpm: row?.flowrate_gpm ?? null,
  rop_m_hr: row?.rop_m_hr ?? null,
  cuttings_diameter_in: row?.cuttings_diameter_in ?? null,
  cuttings_density_sg: row?.cuttings_density_sg ?? null,
});

export async function getHydraulicInput(query: HydraulicsQuery) {
  if (!(await findReportDepths(query.report_id))) throw notFound(REPORT);
  return toInputDto(query.report_id, await findHydraulicInput(query.report_id));
}

export async function setHydraulicInput(body: SetHydraulicInputBody) {
  if (!(await findReportDepths(body.report_id))) throw notFound(REPORT);
  return toInputDto(body.report_id, await upsertHydraulicInput(body));
}

/** Everything the two calculations read, taken from the other pages of the report. */
async function loadContext(reportId: string) {
  const report = await findReportDepths(reportId);
  if (!report) throw notFound(REPORT);

  const [intervals, tools, bits, input, rheologyRows, mudSamples] =
    await Promise.all([
      findWellboreIntervals(reportId),
      findDrillStringTools(reportId),
      findBits(reportId),
      findHydraulicInput(reportId),
      findRheologyReadings(reportId),
      findMudSamples(reportId),
    ]);

  // The latest sample that has the two readings every model needs.
  const reading = [...rheologyRows]
    .reverse()
    .find((row) => row.r600 !== null && row.r300 !== null);
  const weightSample =
    mudSamples.find(
      (sample) =>
        sample.sample_no === reading?.sample_no &&
        sample.mud_weight_pcf !== null,
    ) ??
    [...mudSamples].reverse().find((sample) => sample.mud_weight_pcf !== null);

  const fluid =
    reading && reading.r600 !== null && reading.r300 !== null
      ? fluidModels({
          r600: reading.r600,
          r300: reading.r300,
          r100: reading.r100,
          r3: reading.r3,
        })
      : null;
  return {
    report,
    intervals,
    tools,
    bit: bits[0],
    input,
    reading,
    fluid,
    mudWeightPcf: weightSample?.mud_weight_pcf ?? null,
  };
}

type Context = Awaited<ReturnType<typeof loadContext>>;

/** What the sheet is still missing before it can calculate, in words the user can act on. */
function missingFor(context: Context, needs: { bit: boolean; rop: boolean }) {
  const missing: string[] = [];
  const { report, input } = context;
  if (report.bit_depth_m === null)
    missing.push("The bit depth of the daily report.");
  if (!context.fluid) {
    missing.push(
      context.reading
        ? "Rheology readings at 600 and 300 rpm that give a positive n."
        : "A rheology reading with R600 and R300.",
    );
  }
  if (context.mudWeightPcf === null)
    missing.push("The mud weight of a mud sample.");
  if (!input?.flowrate_gpm) missing.push("The flowrate.");
  if (needs.rop && !input?.rop_m_hr) missing.push("The ROP.");
  if (needs.bit && !context.bit) missing.push("The bit.");
  if (needs.bit && context.bit && context.bit.nozzles.length === 0) {
    missing.push("The nozzles of the bit.");
  }
  return missing;
}

function layoutOf(context: Context) {
  const { report } = context;
  const bitDepth = report.bit_depth_m ?? 0;
  return buildLayout(context.tools, context.intervals, bitDepth);
}

export type PressureLossDto = {
  // What the sheet still lacks. With anything in it, `result` is `null`.
  missing: string[];
  result: PressureLossResult | null;
};

export async function getPressureLoss(
  query: HydraulicsQuery,
): Promise<PressureLossDto> {
  const context = await loadContext(query.report_id);
  const missing = missingFor(context, { bit: true, rop: false });
  const layout = layoutOf(context);
  missing.push(...layout.problems);

  const { report, bit, input, fluid, mudWeightPcf } = context;
  if (
    missing.length > 0 ||
    !bit ||
    !fluid ||
    mudWeightPcf === null ||
    !input?.flowrate_gpm ||
    report.bit_depth_m === null
  ) {
    return { missing, result: null };
  }

  // The deepest casing or liner shoe.
  const shoe = context.intervals
    .filter((item) => item.interval_type !== "open_hole")
    .reduce<number | null>(
      (deepest, item) =>
        deepest === null || item.bottom_md_m > deepest
          ? item.bottom_md_m
          : deepest,
      null,
    );

  return {
    missing,
    result: computePressureLoss({
      layout,
      bit,
      flowrate_gpm: input.flowrate_gpm,
      mud_weight_pcf: mudWeightPcf,
      fluid,
      bit_depth_m: report.bit_depth_m,
      // Without a vertical depth, the well is taken as vertical.
      bit_tvd_m: report.bit_tvd_m ?? report.bit_depth_m,
      shoe_md_m: shoe,
    }),
  };
}

export type HoleCleaningDto = {
  missing: string[];
  result: HoleCleaningResult | null;
};

export async function getHoleCleaning(
  query: HydraulicsQuery,
): Promise<HoleCleaningDto> {
  const context = await loadContext(query.report_id);
  const missing = missingFor(context, { bit: false, rop: true });
  const layout = layoutOf(context);
  missing.push(...layout.problems);

  const { input, fluid, mudWeightPcf } = context;
  if (
    missing.length > 0 ||
    !fluid ||
    mudWeightPcf === null ||
    !input?.flowrate_gpm ||
    !input.rop_m_hr
  ) {
    return { missing, result: null };
  }
  return {
    missing,
    result: computeHoleCleaning({
      layout,
      flowrate_gpm: input.flowrate_gpm,
      mud_weight_pcf: mudWeightPcf,
      fluid,
      rop_m_hr: input.rop_m_hr,
      cuttings_diameter_in:
        input.cuttings_diameter_in ?? DEFAULT_CUTTINGS_DIAMETER_IN,
      cuttings_density_sg:
        input.cuttings_density_sg ?? DEFAULT_CUTTINGS_DENSITY_SG,
    }),
  };
}
