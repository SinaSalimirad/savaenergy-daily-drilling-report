import { asc, eq, sql } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { rheologyReadings } from "../../db/schema";
import type {
  CreateRheologyReadingInput,
  UpdateRheologyReadingInput,
} from "./rheology.schemas";

type Executor = DB | Transaction;

export type RheologyReadingRow = typeof rheologyReadings.$inferSelect;

export async function findRheologyReadings(
  reportId: string,
  executor: Executor = db,
) {
  // `id` breaks ties so the order never changes between requests.
  return executor
    .select()
    .from(rheologyReadings)
    .where(eq(rheologyReadings.report_id, reportId))
    .orderBy(asc(rheologyReadings.sample_no), asc(rheologyReadings.id));
}

export async function findRheologyReadingById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .select()
    .from(rheologyReadings)
    .where(eq(rheologyReadings.id, id));
  return row;
}

export async function insertRheologyReading(
  input: CreateRheologyReadingInput,
  executor: Executor = db,
) {
  // Without a number, the sample takes the next free one.
  const nextNumber = sql<number>`(
    select coalesce(max(s.sample_no), 0) + 1 from ${rheologyReadings} s where s.report_id = ${input.report_id}
  )`;
  const [created] = await executor
    .insert(rheologyReadings)
    .values({ ...input, sample_no: input.sample_no ?? nextNumber })
    .returning();
  return created;
}

export async function updateRheologyReadingById(
  id: string,
  patch: UpdateRheologyReadingInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(rheologyReadings)
    .set(patch)
    .where(eq(rheologyReadings.id, id))
    .returning();
  return row;
}

export async function deleteRheologyReadingById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .delete(rheologyReadings)
    .where(eq(rheologyReadings.id, id))
    .returning({ id: rheologyReadings.id });
  return row;
}
