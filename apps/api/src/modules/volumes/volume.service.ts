import { notFound } from "../../lib/errors";
import { findReportContext } from "../inventory/inventory.repository";
import { findPitReadings } from "../pit-readings/pit-reading.repository";
import {
  ACCOUNTING_FIELDS,
  type AccountingInput,
  balanceOf,
  cumulative,
  dailyVolumes,
  LOSS_FIELDS,
  type LossInput,
  type ReportEntry,
  type Volumes,
} from "./volume.calc";
import {
  findAccountings,
  findLosses,
  findWellReports,
  upsertAccounting,
  upsertLosses,
} from "./volume.repository";
import type {
  SetMudLossBody,
  SetVolumeAccountingBody,
  VolumeSheetQuery,
} from "./volume.schemas";

const REPORT = "Daily report";

/** The values of one report as the web edits them: every field, `null` when not entered. */
function pick<TKey extends string>(
  row: Record<string, unknown> | undefined,
  fields: readonly TKey[],
): Record<TKey, number | null> {
  return Object.fromEntries(
    fields.map((field) => [
      field,
      (row?.[field] as number | null | undefined) ?? null,
    ]),
  ) as Record<TKey, number | null>;
}

export type VolumeSheetDto = {
  report_id: string;
  // What was typed in for this report.
  accounting: AccountingInput;
  losses: LossInput;
  // The report's column, then the section's and the well's totals up to this report.
  daily: Volumes;
  section: Volumes;
  well: Volumes;
  // What the pits held on this report (active and reserve), and how far it is from the books.
  pit_volume_bbl: number | null;
  difference_bbl: number | null;
  status: "balanced" | "gain" | "loss" | null;
};

/** Walks the reports of the well up to this one, in date order, and builds its sheet. */
async function buildSheet(reportId: string): Promise<VolumeSheetDto> {
  const report = await findReportContext(reportId);
  if (!report) throw notFound(REPORT);

  const reports = await findWellReports(report.well_id);
  const upTo = reports.findIndex((item) => item.id === reportId);
  const history = reports.slice(0, upTo + 1);
  const ids = history.map((item) => item.id);

  const [accountings, losses, pitRows] = await Promise.all([
    findAccountings(ids),
    findLosses(ids),
    findPitReadings(reportId),
  ]);
  const entries: ReportEntry[] = history.map((item) => {
    const accounting = accountings.find((row) => row.report_id === item.id);
    const loss = losses.find((row) => row.report_id === item.id);
    return {
      report_id: item.id,
      section_id: item.section_id,
      accounting: accounting ? pick(accounting, ACCOUNTING_FIELDS) : null,
      losses: loss ? pick(loss, LOSS_FIELDS) : null,
    };
  });

  const daily = dailyVolumes(entries);
  const today = daily[daily.length - 1] as Volumes;
  const inSection = daily.filter(
    (_, index) => entries[index]?.section_id === report.section_id,
  );

  // Cumulative sums are over a group of one or more reports, so they always exist here.
  const well = cumulative(daily) as Volumes;
  const section = cumulative(inSection) as Volumes;

  const readings = pitRows.filter((row) => row.pit.type !== "not mud");
  const pitVolume =
    pitRows.length === 0
      ? null
      : Math.round(
          readings.reduce((sum, row) => sum + row.reading.volume, 0) * 100,
        ) / 100;
  const balance = balanceOf(today.end_volume, pitVolume);

  const mine = entries[entries.length - 1] as ReportEntry;
  return {
    report_id: reportId,
    accounting: mine.accounting ?? pick(undefined, ACCOUNTING_FIELDS),
    losses: mine.losses ?? pick(undefined, LOSS_FIELDS),
    daily: today,
    section,
    well,
    pit_volume_bbl: pitVolume,
    difference_bbl: balance.difference_bbl,
    status: balance.status,
  };
}

export async function getVolumeSheet(query: VolumeSheetQuery) {
  return buildSheet(query.report_id);
}

export async function setVolumeAccounting(body: SetVolumeAccountingBody) {
  if (!(await findReportContext(body.report_id))) throw notFound(REPORT);
  await upsertAccounting(body);
  return buildSheet(body.report_id);
}

export async function setMudLosses(body: SetMudLossBody) {
  if (!(await findReportContext(body.report_id))) throw notFound(REPORT);
  await upsertLosses(body);
  return buildSheet(body.report_id);
}
