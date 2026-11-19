import {
  and,
  count,
  desc,
  eq,
  exists,
  getTableColumns,
  isNotNull,
  isNull,
  sql,
} from "drizzle-orm";
import type { ProjectStatus } from "schema";
import { type DB, db, type Transaction } from "../../db";
import { projects, wells } from "../../db/schema";
import type { CreateProjectInput, UpdateProjectInput } from "./project.schemas";

type Executor = DB | Transaction;

// `status` is not a column: it is derived on every read, so it can never disagree with the
// wells or with `archived_at`. Archived wins, then an active well, otherwise inactive.
const status = sql<ProjectStatus>`case
  when ${projects.archived_at} is not null then 'archived'
  when ${exists(
    db
      .select({ one: sql`1` })
      .from(wells)
      .where(
        and(eq(wells.project_id, projects.id), eq(wells.status, "active")),
      ),
  )} then 'active'
  else 'inactive'
end`.as("status");

const projectColumns = { ...getTableColumns(projects), status };

export type ProjectRow = typeof projects.$inferSelect & {
  status: ProjectStatus;
};

type ListParams = { archived: boolean; limit: number; offset: number };

export async function findProjects(
  { archived, limit, offset }: ListParams,
  executor: Executor = db,
) {
  const where = archived
    ? isNotNull(projects.archived_at)
    : isNull(projects.archived_at);

  // Filtering, ordering and paging happen in SQL. `id` breaks ties so a page never
  // repeats or skips a row when two projects share the same created_at.
  const [rows, totals] = await Promise.all([
    executor
      .select(projectColumns)
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
    .select(projectColumns)
    .from(projects)
    .where(eq(projects.id, id));
  return row;
}

export async function insertProject(
  input: CreateProjectInput,
  executor: Executor = db,
) {
  const [created] = await executor
    .insert(projects)
    .values(input)
    .returning({ id: projects.id });
  return created && findProjectById(created.id, executor);
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
    .returning({ id: projects.id });
  return row && findProjectById(row.id, executor);
}

// The `archived_at` guard makes archive and restore atomic: two parallel requests cannot both
// succeed, and no read-then-write race exists. An empty result means "missing or already in
// that state"; the service looks the row up only then to tell the two apart.
export async function markArchived(id: string, executor: Executor = db) {
  const [row] = await executor
    .update(projects)
    .set({ archived_at: new Date() })
    .where(and(eq(projects.id, id), isNull(projects.archived_at)))
    .returning({ id: projects.id });
  return row && findProjectById(row.id, executor);
}

export async function markRestored(id: string, executor: Executor = db) {
  const [row] = await executor
    .update(projects)
    .set({ archived_at: null, archived_by: null })
    .where(and(eq(projects.id, id), isNotNull(projects.archived_at)))
    .returning({ id: projects.id });
  return row && findProjectById(row.id, executor);
}

export async function deleteProjectById(id: string, executor: Executor = db) {
  const [row] = await executor
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  return row;
}
