import {
  AppError,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { findReportContext } from "../inventory/inventory.repository";
import { findPitById } from "../pits/pit.repository";
import { type PitReadingDto, toPitReadingDto } from "./pit-reading.mapper";
import {
  deletePitReadingById,
  findPitReadingById,
  findPitReadings,
  insertPitReading,
  updatePitReadingById,
} from "./pit-reading.repository";
import type {
  CreatePitReadingInput,
  ListPitReadingsQuery,
  UpdatePitReadingInput,
} from "./pit-reading.schemas";

const REPORT = "Daily report";
const PIT_READING = "Pit reading";

async function dtoById(id: string): Promise<PitReadingDto> {
  const row = await findPitReadingById(id);
  if (!row) throw notFound(PIT_READING);
  return toPitReadingDto(row);
}

export async function listPitReadings(query: ListPitReadingsQuery) {
  const report = await findReportContext(query.report_id);
  if (!report) throw notFound(REPORT);
  const rows = await findPitReadings(report.id);
  return rows.map(toPitReadingDto);
}

export async function createPitReading(
  input: CreatePitReadingInput,
): Promise<PitReadingDto> {
  const report = await findReportContext(input.report_id);
  if (!report) throw notFound(REPORT);

  const pit = await findPitById(input.pit_id);
  if (!pit) throw notFound("Pit");
  // A report can only read the pits of its own project.
  if (pit.project_id !== report.project_id) {
    throw new AppError(
      409,
      "PIT_READING_PIT_NOT_IN_PROJECT",
      "This pit does not belong to the project of this report.",
    );
  }

  try {
    const created = await insertPitReading(input);
    if (!created) throw notFound(PIT_READING);
    return await dtoById(created.id);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "PIT_READING_EXISTS",
        "This pit already has a reading in this report.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound(REPORT);
    throw error;
  }
}

export async function updatePitReading(
  id: string,
  patch: UpdatePitReadingInput,
): Promise<PitReadingDto> {
  const updated = await updatePitReadingById(id, patch);
  if (!updated) throw notFound(PIT_READING);
  return dtoById(id);
}

export async function deletePitReading(id: string): Promise<void> {
  const deleted = await deletePitReadingById(id);
  if (!deleted) throw notFound(PIT_READING);
}
