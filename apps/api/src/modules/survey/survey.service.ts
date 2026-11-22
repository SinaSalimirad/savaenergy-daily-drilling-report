import {
  AppError,
  isCheckViolation,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { computeSurvey } from "./survey.calc";
import { toSurveyStationDto } from "./survey.mapper";
import {
  deleteSurveyStationById,
  findSurveyStations,
  findWellById,
  insertSurveyStation,
  updateSurveyStationById,
} from "./survey.repository";
import type {
  CreateSurveyStationInput,
  ListSurveyQuery,
  UpdateSurveyStationInput,
} from "./survey.schemas";

const WELL = "Well";
const STATION = "Survey station";

/** The whole survey of a well, with the computed columns. One change moves every station below. */
async function surveyOf(wellId: string) {
  const rows = await findSurveyStations(wellId);
  const results = computeSurvey(rows);
  return rows.map((row, index) =>
    toSurveyStationDto(row, results[index] as (typeof results)[number]),
  );
}

// The database constraints are the guarantee. Checking first would race with a parallel
// request, so we run the write and translate the violation.
async function write<T>(run: () => Promise<T | undefined>): Promise<T> {
  try {
    const result = await run();
    if (result === undefined) throw notFound(STATION);
    return result;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "SURVEY_DEPTH_TAKEN",
        "This well already has a station at this depth.",
      );
    }
    if (isCheckViolation(error)) {
      throw new AppError(
        409,
        "SURVEY_NOT_VALID",
        "The inclination or the azimuth is out of range.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound(WELL);
    throw error;
  }
}

export async function listSurvey(query: ListSurveyQuery) {
  if (!(await findWellById(query.well_id))) throw notFound(WELL);
  return surveyOf(query.well_id);
}

export async function createSurveyStation(input: CreateSurveyStationInput) {
  const created = await write(() => insertSurveyStation(input));
  return (await surveyOf(created.well_id)).find(
    (item) => item.id === created.id,
  );
}

export async function updateSurveyStation(
  id: string,
  patch: UpdateSurveyStationInput,
) {
  const updated = await write(() => updateSurveyStationById(id, patch));
  return (await surveyOf(updated.well_id)).find(
    (item) => item.id === updated.id,
  );
}

export async function deleteSurveyStation(id: string): Promise<void> {
  const deleted = await deleteSurveyStationById(id);
  if (!deleted) throw notFound(STATION);
}
