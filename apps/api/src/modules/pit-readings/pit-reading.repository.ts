import { asc, eq } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { pitReadings, pits } from "../../db/schema";
import type { UpdatePitReadingInput } from "./pit-reading.schemas";

type Executor = DB | Transaction;

// The pit is joined in, so the sheet can show its name, type and capacity without a request
// per row.
const selection = { reading: pitReadings, pit: pits };

export type PitReadingRow = {
  reading: typeof pitReadings.$inferSelect;
  pit: typeof pits.$inferSelect;
};

function rowsQuery(executor: Executor) {
  return executor
    .select(selection)
    .from(pitReadings)
    .innerJoin(pits, eq(pits.id, pitReadings.pit_id));
}

export async function findPitReadings(
  reportId: string,
  executor: Executor = db,
) {
  // The pits follow their order on the rig's sheet. `id` breaks ties so the order never
  // changes between requests.
  return rowsQuery(executor)
    .where(eq(pitReadings.report_id, reportId))
    .orderBy(asc(pits.order), asc(pitReadings.id));
}

export async function findPitReadingById(id: string, executor: Executor = db) {
  const [row] = await rowsQuery(executor).where(eq(pitReadings.id, id));
  return row;
}

export async function insertPitReading(
  values: {
    report_id: string;
    pit_id: string;
    volume: number;
    mud_weight?: number | null;
    mud_type?: string | null;
  },
  executor: Executor = db,
) {
  const [created] = await executor
    .insert(pitReadings)
    .values(values)
    .returning({ id: pitReadings.id });
  return created;
}

export async function updatePitReadingById(
  id: string,
  patch: UpdatePitReadingInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(pitReadings)
    .set(patch)
    .where(eq(pitReadings.id, id))
    .returning({ id: pitReadings.id });
  return row;
}

export async function deletePitReadingById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .delete(pitReadings)
    .where(eq(pitReadings.id, id))
    .returning({ id: pitReadings.id });
  return row;
}
