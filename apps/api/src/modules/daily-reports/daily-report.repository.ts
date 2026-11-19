import { count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { dailyReports, sections, wells } from "../../db/schema";
import type {
  CreateDailyReportInput,
  UpdateDailyReportInput,
} from "./daily-report.schemas";

type Executor = DB | Transaction;

// The well and section are joined in, so the list can show them without a request per row.
const reportColumns = {
  ...getTableColumns(dailyReports),
  well_name: wells.name,
  section_order: sections.order,
  section_hole_size: sections.hole_size,
};

export type DailyReportRow = typeof dailyReports.$inferSelect & {
  well_name: string;
  section_order: number;
  section_hole_size: number;
};

type ListParams = { wellId?: string; limit: number; offset: number };

export async function findDailyReports(
  { wellId, limit, offset }: ListParams,
  executor: Executor = db,
) {
  const where = wellId ? eq(dailyReports.well_id, wellId) : undefined;
  // Newest report first. `id` breaks ties so a page never repeats or skips a row.
  const [rows, totals] = await Promise.all([
    executor
      .select(reportColumns)
      .from(dailyReports)
      .innerJoin(wells, eq(wells.id, dailyReports.well_id))
      .innerJoin(sections, eq(sections.id, dailyReports.section_id))
      .where(where)
      .orderBy(desc(dailyReports.report_date), desc(dailyReports.id))
      .limit(limit)
      .offset(offset),
    executor.select({ total: count() }).from(dailyReports).where(where),
  ]);
  return { rows, total: totals[0]?.total ?? 0 };
}

export async function findDailyReportById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select(reportColumns)
    .from(dailyReports)
    .innerJoin(wells, eq(wells.id, dailyReports.well_id))
    .innerJoin(sections, eq(sections.id, dailyReports.section_id))
    .where(eq(dailyReports.id, id));
  return row;
}

export async function insertDailyReport(
  input: CreateDailyReportInput,
  executor: Executor = db,
) {
  // Without a number, the report gets the next one of its well. Two parallel requests can pick
  // the same number; the unique constraint rejects the second one and the service answers 409.
  const nextNumber = sql<number>`(
    select coalesce(max(r.report_no), 0) + 1 from ${dailyReports} r where r.well_id = ${input.well_id}
  )`;
  const [created] = await executor
    .insert(dailyReports)
    .values({ ...input, report_no: input.report_no ?? nextNumber })
    .returning({ id: dailyReports.id });
  return created && findDailyReportById(created.id, executor);
}

export async function updateDailyReportById(
  id: string,
  patch: UpdateDailyReportInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(dailyReports)
    .set(patch)
    .where(eq(dailyReports.id, id))
    .returning({ id: dailyReports.id });
  return row && findDailyReportById(row.id, executor);
}

export async function deleteDailyReportById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .delete(dailyReports)
    .where(eq(dailyReports.id, id))
    .returning({ id: dailyReports.id });
  return row;
}
