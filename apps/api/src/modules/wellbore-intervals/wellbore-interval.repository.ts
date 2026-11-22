import { asc, eq, sql } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { wellboreIntervals } from "../../db/schema";
import type {
  CreateWellboreIntervalInput,
  UpdateWellboreIntervalInput,
} from "./wellbore-interval.schemas";

type Executor = DB | Transaction;

export type WellboreIntervalRow = typeof wellboreIntervals.$inferSelect;

export async function findWellboreIntervals(
  reportId: string,
  executor: Executor = db,
) {
  // `id` breaks ties so the order never changes between requests.
  return executor
    .select()
    .from(wellboreIntervals)
    .where(eq(wellboreIntervals.report_id, reportId))
    .orderBy(asc(wellboreIntervals.order), asc(wellboreIntervals.id));
}

export async function findWellboreIntervalById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .select()
    .from(wellboreIntervals)
    .where(eq(wellboreIntervals.id, id));
  return row;
}

export async function insertWellboreInterval(
  input: CreateWellboreIntervalInput,
  executor: Executor = db,
) {
  // Without a row number, the row goes last.
  const nextOrder = sql<number>`(
    select coalesce(max(r."order"), 0) + 1 from ${wellboreIntervals} r where r.report_id = ${input.report_id}
  )`;
  const [created] = await executor
    .insert(wellboreIntervals)
    .values({ ...input, order: input.order ?? nextOrder })
    .returning();
  return created;
}

export async function updateWellboreIntervalById(
  id: string,
  patch: UpdateWellboreIntervalInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(wellboreIntervals)
    .set(patch)
    .where(eq(wellboreIntervals.id, id))
    .returning();
  return row;
}

export async function deleteWellboreIntervalById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .delete(wellboreIntervals)
    .where(eq(wellboreIntervals.id, id))
    .returning({ id: wellboreIntervals.id });
  return row;
}
