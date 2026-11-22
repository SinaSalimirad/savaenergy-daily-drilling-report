import { asc, eq } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { bits } from "../../db/schema";
import type { CreateBitInput, UpdateBitInput } from "./bit.schemas";

type Executor = DB | Transaction;

export type BitRow = typeof bits.$inferSelect;

export async function findBits(reportId: string, executor: Executor = db) {
  // `id` breaks ties so the order never changes between requests.
  return executor
    .select()
    .from(bits)
    .where(eq(bits.report_id, reportId))
    .orderBy(asc(bits.id));
}

export async function findBitById(id: string, executor: Executor = db) {
  const [row] = await executor.select().from(bits).where(eq(bits.id, id));
  return row;
}

export async function insertBit(
  input: CreateBitInput,
  executor: Executor = db,
) {
  const [created] = await executor.insert(bits).values(input).returning();
  return created;
}

export async function updateBitById(
  id: string,
  patch: UpdateBitInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(bits)
    .set(patch)
    .where(eq(bits.id, id))
    .returning();
  return row;
}

export async function deleteBitById(id: string, executor: Executor = db) {
  const [row] = await executor
    .delete(bits)
    .where(eq(bits.id, id))
    .returning({ id: bits.id });
  return row;
}
