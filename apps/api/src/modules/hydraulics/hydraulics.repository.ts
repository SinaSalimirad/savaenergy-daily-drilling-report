import { eq } from "drizzle-orm";
import type { HydraulicInputSet } from "schema";
import { type DB, db, type Transaction } from "../../db";
import { dailyReports, hydraulicInputs } from "../../db/schema";

type Executor = DB | Transaction;

export type HydraulicInputRow = typeof hydraulicInputs.$inferSelect;

export async function findReportDepths(
  reportId: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .select({
      id: dailyReports.id,
      bit_depth_m: dailyReports.bit_depth_m,
      bit_tvd_m: dailyReports.bit_tvd_m,
    })
    .from(dailyReports)
    .where(eq(dailyReports.id, reportId));
  return row;
}

export async function findHydraulicInput(
  reportId: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .select()
    .from(hydraulicInputs)
    .where(eq(hydraulicInputs.report_id, reportId));
  return row;
}

/** One set per report: a second call replaces the values of the first. */
export async function upsertHydraulicInput(
  input: HydraulicInputSet,
  executor: Executor = db,
) {
  const { report_id, ...values } = input;
  const [row] = await executor
    .insert(hydraulicInputs)
    .values({ report_id, ...values })
    .onConflictDoUpdate({
      target: hydraulicInputs.report_id,
      set: { ...values, updated_at: new Date() },
    })
    .returning();
  return row;
}
