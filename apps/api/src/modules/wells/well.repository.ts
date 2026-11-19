import { and, count, desc, eq, getTableColumns, ne } from "drizzle-orm";
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
    ? eq(wells.status, "archived")
    : ne(wells.status, "archived");
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

// The `status` guard makes archive and restore atomic: two parallel requests cannot both
// succeed. An empty result means "missing or already in that state".
export async function markArchived(id: string, executor: Executor = db) {
  const [row] = await executor
    .update(wells)
    .set({ status: "archived", archived_at: new Date() })
    .where(and(eq(wells.id, id), ne(wells.status, "archived")))
    .returning({ id: wells.id });
  return row && findWellById(row.id, executor);
}

// The status before archiving is not stored, so a restored well returns to `status`.
export async function markRestored(
  id: string,
  status: Exclude<WellRow["status"], "archived">,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(wells)
    .set({ status, archived_at: null, archived_by: null })
    .where(and(eq(wells.id, id), eq(wells.status, "archived")))
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
