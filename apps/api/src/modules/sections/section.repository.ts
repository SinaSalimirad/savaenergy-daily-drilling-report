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
import { sections, wells } from "../../db/schema";
import type { CreateSectionInput, UpdateSectionInput } from "./section.schemas";

type Executor = DB | Transaction;

// The well name is joined in, so the list can show it without a request per row.
const sectionColumns = {
  ...getTableColumns(sections),
  well_name: wells.name,
};

export type SectionRow = typeof sections.$inferSelect & { well_name: string };

type ListParams = { wellId?: string; limit: number; offset: number };

export async function findSections(
  { wellId, limit, offset }: ListParams,
  executor: Executor = db,
) {
  const where = wellId ? eq(sections.well_id, wellId) : undefined;
  // Sections are grouped by well and follow their order inside it. `id` breaks ties so a page
  // never repeats or skips a row.
  const [rows, totals] = await Promise.all([
    executor
      .select(sectionColumns)
      .from(sections)
      .innerJoin(wells, eq(wells.id, sections.well_id))
      .where(where)
      .orderBy(asc(wells.name), asc(sections.order), asc(sections.id))
      .limit(limit)
      .offset(offset),
    executor.select({ total: count() }).from(sections).where(where),
  ]);
  return { rows, total: totals[0]?.total ?? 0 };
}

export async function findSectionById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select(sectionColumns)
    .from(sections)
    .innerJoin(wells, eq(wells.id, sections.well_id))
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
    select coalesce(max(s."order"), 0) + 1 from ${sections} s where s.well_id = ${input.well_id}
  )`;
  const [created] = await executor
    .insert(sections)
    .values({ ...input, order: input.order ?? nextOrder })
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
  section: { id: string; well_id: string; order: number },
  toOrder: number,
) {
  await db.transaction(async (tx) => {
    const movingDown = toOrder > section.order;
    // The sections whose order changes: the moved one and everything between it and the target.
    const range = movingDown
      ? and(gt(sections.order, section.order), lte(sections.order, toOrder))
      : and(gte(sections.order, toOrder), lt(sections.order, section.order));
    const sameWell = eq(sections.well_id, section.well_id);

    await tx
      .update(sections)
      .set({ order: sql`${sections.order} + ${PARK_OFFSET}` })
      .where(and(sameWell, range));
    await tx
      .update(sections)
      // Its own spot, so it cannot meet a parked section.
      .set({ order: MOVED_PARKING_ORDER })
      .where(eq(sections.id, section.id));

    // The moved section takes the target; the others step toward the place it left.
    await tx
      .update(sections)
      .set({
        order: sql`${sections.order} - ${PARK_OFFSET} + ${movingDown ? -1 : 1}`,
      })
      .where(
        and(
          sameWell,
          gte(sections.order, PARK_OFFSET),
          sql`${sections.id} <> ${section.id}`,
        ),
      );
    await tx
      .update(sections)
      .set({ order: toOrder })
      .where(eq(sections.id, section.id));
  });
  return findSectionById(section.id);
}
