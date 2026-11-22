import { asc, eq, sql } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { mudSamples } from "../../db/schema";
import type {
  CreateMudSampleInput,
  UpdateMudSampleInput,
} from "./mud-sample.schemas";

type Executor = DB | Transaction;

export type MudSampleRow = typeof mudSamples.$inferSelect;

export async function findMudSamples(
  reportId: string,
  executor: Executor = db,
) {
  // `id` breaks ties so the order never changes between requests.
  return executor
    .select()
    .from(mudSamples)
    .where(eq(mudSamples.report_id, reportId))
    .orderBy(asc(mudSamples.sample_no), asc(mudSamples.id));
}

export async function findMudSampleById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select()
    .from(mudSamples)
    .where(eq(mudSamples.id, id));
  return row;
}

export async function insertMudSample(
  input: CreateMudSampleInput,
  executor: Executor = db,
) {
  // Without a number, the sample takes the next free one.
  const nextNumber = sql<number>`(
    select coalesce(max(s.sample_no), 0) + 1 from ${mudSamples} s where s.report_id = ${input.report_id}
  )`;
  const [created] = await executor
    .insert(mudSamples)
    .values({ ...input, sample_no: input.sample_no ?? nextNumber })
    .returning();
  return created;
}

export async function updateMudSampleById(
  id: string,
  patch: UpdateMudSampleInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(mudSamples)
    .set(patch)
    .where(eq(mudSamples.id, id))
    .returning();
  return row;
}

export async function deleteMudSampleById(id: string, executor: Executor = db) {
  const [row] = await executor
    .delete(mudSamples)
    .where(eq(mudSamples.id, id))
    .returning({ id: mudSamples.id });
  return row;
}
