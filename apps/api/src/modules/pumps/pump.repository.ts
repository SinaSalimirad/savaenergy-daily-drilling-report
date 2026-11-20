import { and, asc, count, eq, getTableColumns, sql } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { projects, pumps } from "../../db/schema";
import type { CreatePumpInput, UpdatePumpInput } from "./pump.schemas";

type Executor = DB | Transaction;

// The project name is joined in, so the list can show it without a request per row.
const pumpColumns = {
  ...getTableColumns(pumps),
  project_name: projects.name,
};

export type PumpRow = typeof pumps.$inferSelect & { project_name: string };

type ListParams = { projectId?: string; limit: number; offset: number };

export async function findPumps(
  { projectId, limit, offset }: ListParams,
  executor: Executor = db,
) {
  const where = and(projectId ? eq(pumps.project_id, projectId) : undefined);
  // Pumps are grouped by project and follow their order inside it. `id` breaks ties so a page
  // never repeats or skips a row.
  const [rows, totals] = await Promise.all([
    executor
      .select(pumpColumns)
      .from(pumps)
      .innerJoin(projects, eq(projects.id, pumps.project_id))
      .where(where)
      .orderBy(asc(projects.name), asc(pumps.order), asc(pumps.id))
      .limit(limit)
      .offset(offset),
    executor.select({ total: count() }).from(pumps).where(where),
  ]);
  return { rows, total: totals[0]?.total ?? 0 };
}

export async function findPumpById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select(pumpColumns)
    .from(pumps)
    .innerJoin(projects, eq(projects.id, pumps.project_id))
    .where(eq(pumps.id, id));
  return row;
}

export async function insertPump(
  input: CreatePumpInput,
  executor: Executor = db,
) {
  // Without an order, the pump goes last. Two parallel requests can pick the same number;
  // the unique constraint rejects the second one and the service answers 409.
  const nextOrder = sql<number>`(
    select coalesce(max(p."order"), 0) + 1 from ${pumps} p where p.project_id = ${input.project_id}
  )`;
  const [created] = await executor
    .insert(pumps)
    .values({ ...input, order: input.order ?? nextOrder })
    .returning({ id: pumps.id });
  return created && findPumpById(created.id, executor);
}

export async function updatePumpById(
  id: string,
  patch: UpdatePumpInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(pumps)
    .set(patch)
    .where(eq(pumps.id, id))
    .returning({ id: pumps.id });
  return row && findPumpById(row.id, executor);
}

export async function deletePumpById(id: string, executor: Executor = db) {
  const [row] = await executor
    .delete(pumps)
    .where(eq(pumps.id, id))
    .returning({ id: pumps.id });
  return row;
}
