import { and, count, desc, eq, ne } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { projects } from "../../db/schema";
import type { CreateProjectInput, UpdateProjectInput } from "./project.schemas";

type Executor = DB | Transaction;
export type ProjectRow = typeof projects.$inferSelect;

type ListParams = { archived: boolean; limit: number; offset: number };

export async function findProjects(
  { archived, limit, offset }: ListParams,
  executor: Executor = db,
) {
  const where = archived
    ? eq(projects.status, "archived")
    : ne(projects.status, "archived");

  // Filtering, ordering and paging happen in SQL. `id` breaks ties so a page never
  // repeats or skips a row when two projects share the same created_at.
  const [rows, totals] = await Promise.all([
    executor
      .select()
      .from(projects)
      .where(where)
      .orderBy(desc(projects.created_at), desc(projects.id))
      .limit(limit)
      .offset(offset),
    executor.select({ total: count() }).from(projects).where(where),
  ]);

  return { rows, total: totals[0]?.total ?? 0 };
}

export async function findProjectById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select()
    .from(projects)
    .where(eq(projects.id, id));
  return row;
}

export async function insertProject(
  input: CreateProjectInput,
  executor: Executor = db,
) {
  const [row] = await executor.insert(projects).values(input).returning();
  return row;
}

export async function updateProjectById(
  id: string,
  patch: UpdateProjectInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(projects)
    .set(patch)
    .where(eq(projects.id, id))
    .returning();
  return row;
}

// The `status` guard makes archive and restore atomic: two parallel requests cannot both
// succeed, and no read-then-write race exists. An empty result means "missing or already in
// that state"; the service looks the row up only then to tell the two apart.
export async function markArchived(id: string, executor: Executor = db) {
  const [row] = await executor
    .update(projects)
    .set({ status: "archived", archived_at: new Date() })
    .where(and(eq(projects.id, id), ne(projects.status, "archived")))
    .returning();
  return row;
}

// The status before archiving is not stored, so a restored project returns to `status`.
export async function markRestored(
  id: string,
  status: Exclude<ProjectRow["status"], "archived">,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(projects)
    .set({ status, archived_at: null, archived_by: null })
    .where(and(eq(projects.id, id), eq(projects.status, "archived")))
    .returning();
  return row;
}

export async function deleteProjectById(id: string, executor: Executor = db) {
  const [row] = await executor
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  return row;
}
