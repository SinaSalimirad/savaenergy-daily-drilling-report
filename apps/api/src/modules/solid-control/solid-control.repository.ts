import { asc, count, eq, getTableColumns, sql } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { projects, sce } from "../../db/schema";
import type { CreateSceInput, UpdateSceInput } from "./solid-control.schemas";

type Executor = DB | Transaction;

// The project name is joined in, so the list can show it without a request per row.
const sceColumns = { ...getTableColumns(sce), project_name: projects.name };

export type SceRow = typeof sce.$inferSelect & { project_name: string };

type ListParams = { projectId?: string; limit: number; offset: number };

export async function findSce(
  { projectId, limit, offset }: ListParams,
  executor: Executor = db,
) {
  const where = projectId ? eq(sce.project_id, projectId) : undefined;
  // Grouped by project and following the sheet's rows. `id` breaks ties so a page never
  // repeats or skips a row.
  const [rows, totals] = await Promise.all([
    executor
      .select(sceColumns)
      .from(sce)
      .innerJoin(projects, eq(projects.id, sce.project_id))
      .where(where)
      .orderBy(asc(projects.name), asc(sce.sort_order), asc(sce.id))
      .limit(limit)
      .offset(offset),
    executor.select({ total: count() }).from(sce).where(where),
  ]);
  return { rows, total: totals[0]?.total ?? 0 };
}

export async function findSceById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select(sceColumns)
    .from(sce)
    .innerJoin(projects, eq(projects.id, sce.project_id))
    .where(eq(sce.id, id));
  return row;
}

export async function insertSce(
  input: CreateSceInput,
  executor: Executor = db,
) {
  // Without a row or a number, the unit goes last (the row among the project's units, the
  // number among the units of its type). Two parallel requests can pick the same number; the
  // unique constraints reject the second one and the service answers 409.
  const nextOrder = sql<number>`(
    select coalesce(max(s."sort_order"), 0) + 1 from ${sce} s where s.project_id = ${input.project_id}
  )`;
  const nextUnitNo = sql<number>`(
    select coalesce(max(s.unit_no), 0) + 1 from ${sce} s
    where s.project_id = ${input.project_id} and s.type = ${input.type}
  )`;
  const [created] = await executor
    .insert(sce)
    .values({
      ...input,
      sort_order: input.sort_order ?? nextOrder,
      unit_no: input.unit_no ?? nextUnitNo,
    })
    .returning({ id: sce.id });
  return created && findSceById(created.id, executor);
}

export async function updateSceById(
  id: string,
  patch: UpdateSceInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(sce)
    .set(patch)
    .where(eq(sce.id, id))
    .returning({ id: sce.id });
  return row && findSceById(row.id, executor);
}

export async function deleteSceById(id: string, executor: Executor = db) {
  const [row] = await executor
    .delete(sce)
    .where(eq(sce.id, id))
    .returning({ id: sce.id });
  return row;
}
