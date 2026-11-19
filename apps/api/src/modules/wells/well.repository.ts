import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  isNotNull,
  isNull,
} from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { projects, wells } from "../../db/schema";
import type { CreateWellInput, UpdateWellInput } from "./well.schemas";

type Executor = DB | Transaction;

// The project name is joined in, so the list can show it without a request per row.
const wellColumns = { ...getTableColumns(wells), project_name: projects.name };

export type WellRow = typeof wells.$inferSelect & { project_name: string };

type ListParams = { archived: boolean; limit: number; offset: number };

export async function findWells(
  { archived, limit, offset }: ListParams,
  executor: Executor = db,
) {
  const where = archived
    ? isNotNull(wells.archived_at)
    : isNull(wells.archived_at);
  // `id` breaks ties so a page never repeats or skips a row with the same created_at.
  const [rows, totals] = await Promise.all([
    executor
      .select(wellColumns)
      .from(wells)
      .innerJoin(projects, eq(projects.id, wells.project_id))
      .where(where)
      .orderBy(desc(wells.created_at), desc(wells.id))
      .limit(limit)
      .offset(offset),
    executor.select({ total: count() }).from(wells).where(where),
  ]);
  return { rows, total: totals[0]?.total ?? 0 };
}

export async function findWellById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select(wellColumns)
    .from(wells)
    .innerJoin(projects, eq(projects.id, wells.project_id))
    .where(eq(wells.id, id));
  return row;
}

export async function insertWell(
  input: CreateWellInput,
  executor: Executor = db,
) {
  const [created] = await executor
    .insert(wells)
    .values(input)
    .returning({ id: wells.id });
  return created && findWellById(created.id, executor);
}

export async function updateWellById(
  id: string,
  patch: UpdateWellInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(wells)
    .set(patch)
    .where(eq(wells.id, id))
    .returning({ id: wells.id });
  return row && findWellById(row.id, executor);
}

// The `archived_at` guard makes archive and restore atomic: two parallel requests cannot both
// succeed. An empty result means "missing or already in that state". `status` is not touched,
// so a restored well returns to the status it had.
export async function markArchived(id: string, executor: Executor = db) {
  const [row] = await executor
    .update(wells)
    .set({ archived_at: new Date() })
    .where(and(eq(wells.id, id), isNull(wells.archived_at)))
    .returning({ id: wells.id });
  return row && findWellById(row.id, executor);
}

export async function markRestored(id: string, executor: Executor = db) {
  const [row] = await executor
    .update(wells)
    .set({ archived_at: null, archived_by: null })
    .where(and(eq(wells.id, id), isNotNull(wells.archived_at)))
    .returning({ id: wells.id });
  return row && findWellById(row.id, executor);
}

export async function deleteWellById(id: string, executor: Executor = db) {
  const [row] = await executor
    .delete(wells)
    .where(eq(wells.id, id))
    .returning({ id: wells.id });
  return row;
}
