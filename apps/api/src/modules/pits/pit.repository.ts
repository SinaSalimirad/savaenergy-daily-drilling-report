import { and, asc, count, eq, getTableColumns, sql } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { pits, projects } from "../../db/schema";
import type { CreatePitInput, UpdatePitInput } from "./pit.schemas";

type Executor = DB | Transaction;

// The project name is joined in, so the list can show it without a request per row.
const pitColumns = {
  ...getTableColumns(pits),
  project_name: projects.name,
};

export type PitRow = typeof pits.$inferSelect & { project_name: string };

type ListParams = { projectId?: string; limit: number; offset: number };

export async function findPits(
  { projectId, limit, offset }: ListParams,
  executor: Executor = db,
) {
  const where = and(projectId ? eq(pits.project_id, projectId) : undefined);
  // Pits are grouped by project and follow their order inside it. `id` breaks ties (the order
  // is not unique) so a page never repeats or skips a row.
  const [rows, totals] = await Promise.all([
    executor
      .select(pitColumns)
      .from(pits)
      .innerJoin(projects, eq(projects.id, pits.project_id))
      .where(where)
      .orderBy(asc(projects.name), asc(pits.order), asc(pits.id))
      .limit(limit)
      .offset(offset),
    executor.select({ total: count() }).from(pits).where(where),
  ]);
  return { rows, total: totals[0]?.total ?? 0 };
}

export async function findPitById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select(pitColumns)
    .from(pits)
    .innerJoin(projects, eq(projects.id, pits.project_id))
    .where(eq(pits.id, id));
  return row;
}

export async function insertPit(
  input: CreatePitInput,
  executor: Executor = db,
) {
  // Without an order, the pit goes last.
  const nextOrder = sql<number>`(
    select coalesce(max(p."order"), 0) + 1 from ${pits} p where p.project_id = ${input.project_id}
  )`;
  const [created] = await executor
    .insert(pits)
    .values({ ...input, order: input.order ?? nextOrder })
    .returning({ id: pits.id });
  return created && findPitById(created.id, executor);
}

export async function updatePitById(
  id: string,
  patch: UpdatePitInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(pits)
    .set(patch)
    .where(eq(pits.id, id))
    .returning({ id: pits.id });
  return row && findPitById(row.id, executor);
}

export async function deletePitById(id: string, executor: Executor = db) {
  const [row] = await executor
    .delete(pits)
    .where(eq(pits.id, id))
    .returning({ id: pits.id });
  return row;
}
