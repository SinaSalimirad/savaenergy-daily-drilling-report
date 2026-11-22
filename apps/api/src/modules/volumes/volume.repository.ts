import { asc, eq, inArray } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { dailyReports, mudLosses, volumeAccountings } from "../../db/schema";
import type { SetMudLossBody, SetVolumeAccountingBody } from "./volume.schemas";

type Executor = DB | Transaction;

export type VolumeAccountingRow = typeof volumeAccountings.$inferSelect;
export type MudLossRow = typeof mudLosses.$inferSelect;

/** The reports of a well, oldest first (the report number breaks ties on the same day). */
export async function findWellReports(wellId: string, executor: Executor = db) {
  return executor
    .select({
      id: dailyReports.id,
      section_id: dailyReports.section_id,
      report_date: dailyReports.report_date,
    })
    .from(dailyReports)
    .where(eq(dailyReports.well_id, wellId))
    .orderBy(asc(dailyReports.report_date), asc(dailyReports.report_no));
}

export async function findAccountings(
  reportIds: string[],
  executor: Executor = db,
) {
  if (reportIds.length === 0) return [];
  return executor
    .select()
    .from(volumeAccountings)
    .where(inArray(volumeAccountings.report_id, reportIds));
}

export async function findLosses(reportIds: string[], executor: Executor = db) {
  if (reportIds.length === 0) return [];
  return executor
    .select()
    .from(mudLosses)
    .where(inArray(mudLosses.report_id, reportIds));
}

/** One set per report: a second call replaces the values of the first. */
export async function upsertAccounting(
  input: SetVolumeAccountingBody,
  executor: Executor = db,
) {
  const { report_id, ...values } = input;
  const [row] = await executor
    .insert(volumeAccountings)
    .values({ report_id, ...values })
    .onConflictDoUpdate({
      target: volumeAccountings.report_id,
      set: { ...values, updated_at: new Date() },
    })
    .returning();
  return row;
}

export async function upsertLosses(
  input: SetMudLossBody,
  executor: Executor = db,
) {
  const { report_id, ...values } = input;
  const [row] = await executor
    .insert(mudLosses)
    .values({ report_id, ...values })
    .onConflictDoUpdate({
      target: mudLosses.report_id,
      set: { ...values, updated_at: new Date() },
    })
    .returning();
  return row;
}
