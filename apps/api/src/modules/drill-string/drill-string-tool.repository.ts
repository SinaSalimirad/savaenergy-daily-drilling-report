import { asc, eq, sql } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { drillStringTools } from "../../db/schema";
import type {
  CreateDrillStringToolInput,
  UpdateDrillStringToolInput,
} from "./drill-string-tool.schemas";

type Executor = DB | Transaction;

export type DrillStringToolRow = typeof drillStringTools.$inferSelect;

export async function findDrillStringTools(
  reportId: string,
  executor: Executor = db,
) {
  // `id` breaks ties so the order never changes between requests.
  return executor
    .select()
    .from(drillStringTools)
    .where(eq(drillStringTools.report_id, reportId))
    .orderBy(asc(drillStringTools.order), asc(drillStringTools.id));
}

export async function findDrillStringToolById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .select()
    .from(drillStringTools)
    .where(eq(drillStringTools.id, id));
  return row;
}

export async function insertDrillStringTool(
  input: CreateDrillStringToolInput,
  executor: Executor = db,
) {
  // Without a row number, the row goes last.
  const nextOrder = sql<number>`(
    select coalesce(max(r."order"), 0) + 1 from ${drillStringTools} r where r.report_id = ${input.report_id}
  )`;
  const [created] = await executor
    .insert(drillStringTools)
    .values({ ...input, order: input.order ?? nextOrder })
    .returning();
  return created;
}

export async function updateDrillStringToolById(
  id: string,
  patch: UpdateDrillStringToolInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(drillStringTools)
    .set(patch)
    .where(eq(drillStringTools.id, id))
    .returning();
  return row;
}

export async function deleteDrillStringToolById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .delete(drillStringTools)
    .where(eq(drillStringTools.id, id))
    .returning({ id: drillStringTools.id });
  return row;
}
