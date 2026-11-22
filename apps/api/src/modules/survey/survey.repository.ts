import { asc, eq } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { surveyStations, wells } from "../../db/schema";
import type {
  CreateSurveyStationInput,
  UpdateSurveyStationInput,
} from "./survey.schemas";

type Executor = DB | Transaction;

export type SurveyStationRow = typeof surveyStations.$inferSelect;

export async function findWellById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select({ id: wells.id })
    .from(wells)
    .where(eq(wells.id, id));
  return row;
}

export async function findSurveyStations(
  wellId: string,
  executor: Executor = db,
) {
  return executor
    .select()
    .from(surveyStations)
    .where(eq(surveyStations.well_id, wellId))
    .orderBy(asc(surveyStations.md_m));
}

export async function insertSurveyStation(
  input: CreateSurveyStationInput,
  executor: Executor = db,
) {
  const [created] = await executor
    .insert(surveyStations)
    .values(input)
    .returning();
  return created;
}

export async function updateSurveyStationById(
  id: string,
  patch: UpdateSurveyStationInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(surveyStations)
    .set(patch)
    .where(eq(surveyStations.id, id))
    .returning();
  return row;
}

export async function deleteSurveyStationById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .delete(surveyStations)
    .where(eq(surveyStations.id, id))
    .returning({ id: surveyStations.id, well_id: surveyStations.well_id });
  return row;
}
