import {
  and,
  asc,
  count,
  eq,
  getTableColumns,
  gt,
  gte,
  lt,
  lte,
  sql,
} from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { projects, sections, wells } from "../../db/schema";
import type { CreateSectionInput, UpdateSectionInput } from "./section.schemas";

type Executor = DB | Transaction;

// The well and project names are joined in, so the list can show it without a request per row.
const sectionColumns = {
  ...getTableColumns(sections),
  well_name: wells.name,
  project_name: projects.name,
};

export type SectionRow = typeof sections.$inferSelect & {
  well_name: string;
  project_name: string;
};

type ListParams = {
  wellId?: string;
  projectId?: string;
  limit: number;
  offset: number;
};

export async function findSections(
  { wellId, projectId, limit, offset }: ListParams,
  executor: Executor = db,
) {
  // The project is reached through the well, so the list and the total both join `wells`.
  const where = and(
    wellId ? eq(sections.well_id, wellId) : undefined,
    projectId ? eq(wells.project_id, projectId) : undefined,
  );
  // Sections are grouped by well and follow their order inside it. `id` breaks ties so a page
  // never repeats or skips a row.
  const [rows, totals] = await Promise.all([
    executor
      .select(sectionColumns)
      .from(sections)
      .innerJoin(wells, eq(wells.id, sections.well_id))
      .innerJoin(projects, eq(projects.id, wells.project_id))
      .where(where)
      .orderBy(asc(wells.name), asc(sections.sort_order), asc(sections.id))
      .limit(limit)
      .offset(offset),
    executor
      .select({ total: count() })
      .from(sections)
      .innerJoin(wells, eq(wells.id, sections.well_id))
      .where(where),
  ]);
  return { rows, total: totals[0]?.total ?? 0 };
}

export async function findSectionById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select(sectionColumns)
    .from(sections)
    .innerJoin(wells, eq(wells.id, sections.well_id))
    .innerJoin(projects, eq(projects.id, wells.project_id))
    .where(eq(sections.id, id));
  return row;
}

export async function insertSection(
  input: CreateSectionInput,
  executor: Executor = db,
) {
  // Without an order, the section goes last. Two parallel requests can pick the same number;
  // the unique constraint rejects the second one and the service answers 409.
  const nextOrder = sql<number>`(
    select coalesce(max(s."sort_order"), 0) + 1 from ${sections} s where s.well_id = ${input.well_id}
  )`;
  const [created] = await executor
    .insert(sections)
    .values({ ...input, sort_order: input.sort_order ?? nextOrder })
    .returning({ id: sections.id });
  return created && findSectionById(created.id, executor);
}

export async function updateSectionById(
  id: string,
  patch: UpdateSectionInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(sections)
    .set(patch)
    .where(eq(sections.id, id))
    .returning({ id: sections.id });
  return row && findSectionById(row.id, executor);
}

export async function deleteSectionById(id: string, executor: Executor = db) {
  const [row] = await executor
    .delete(sections)
    .where(eq(sections.id, id))
    .returning({ id: sections.id });
  return row;
}

// A unique constraint is checked row by row, so shifting orders in place (2 -> 3 while a 3 still
// exists) fails. The sections that move are first parked far above any real order, then put in
// their final place. Both steps run in one transaction, so nobody sees the parked state.
const PARK_OFFSET = 1_000_000;
const MOVED_PARKING_ORDER = 2 * PARK_OFFSET;

/** Moves a section to `toOrder` and shifts the sections in between by one. */
export async function moveSectionToOrder(
  section: { id: string; well_id: string; sort_order: number },
  toOrder: number,
) {
  await db.transaction(async (tx) => {
    const movingDown = toOrder > section.sort_order;
    // The sections whose order changes: the moved one and everything between it and the target.
    const range = movingDown
      ? and(
          gt(sections.sort_order, section.sort_order),
          lte(sections.sort_order, toOrder),
        )
      : and(
          gte(sections.sort_order, toOrder),
          lt(sections.sort_order, section.sort_order),
        );
    const sameWell = eq(sections.well_id, section.well_id);

    await tx
      .update(sections)
      .set({ sort_order: sql`${sections.sort_order} + ${PARK_OFFSET}` })
      .where(and(sameWell, range));
    await tx
      .update(sections)
      // Its own spot, so it cannot meet a parked section.
      .set({ sort_order: MOVED_PARKING_ORDER })
      .where(eq(sections.id, section.id));

    // The moved section takes the target; the others step toward the place it left.
    await tx
      .update(sections)
      .set({
        sort_order: sql`${sections.sort_order} - ${PARK_OFFSET} + ${movingDown ? -1 : 1}`,
      })
      .where(
        and(
          sameWell,
          gte(sections.sort_order, PARK_OFFSET),
          sql`${sections.id} <> ${section.id}`,
        ),
      );
    await tx
      .update(sections)
      .set({ sort_order: toOrder })
      .where(eq(sections.id, section.id));
  });
  return findSectionById(section.id);
}
