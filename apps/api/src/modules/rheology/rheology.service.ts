import { notFound } from "../../lib/errors";
import { translateSampleError } from "../_shared/sample-errors";
import { findReportContext } from "../inventory/inventory.repository";
import {
  type RheologyReadingDto,
  toRheologyReadingDto,
} from "./rheology.mapper";
import {
  deleteRheologyReadingById,
  findRheologyReadings,
  insertRheologyReading,
  updateRheologyReadingById,
} from "./rheology.repository";
import type {
  CreateRheologyReadingInput,
  ListRheologyQuery,
  UpdateRheologyReadingInput,
} from "./rheology.schemas";

const REPORT = "Daily report";
const SAMPLE = "Rheology reading";

export async function listRheologyReadings(query: ListRheologyQuery) {
  const report = await findReportContext(query.report_id);
  if (!report) throw notFound(REPORT);
  const rows = await findRheologyReadings(report.id);
  return rows.map(toRheologyReadingDto);
}

export async function createRheologyReading(
  input: CreateRheologyReadingInput,
): Promise<RheologyReadingDto> {
  const report = await findReportContext(input.report_id);
  if (!report) throw notFound(REPORT);
  try {
    const created = await insertRheologyReading(input);
    if (!created) throw notFound(SAMPLE);
    return toRheologyReadingDto(created);
  } catch (error) {
    return translateSampleError(error, "rheology reading");
  }
}

export async function updateRheologyReading(
  id: string,
  patch: UpdateRheologyReadingInput,
): Promise<RheologyReadingDto> {
  const updated = await updateRheologyReadingById(id, patch);
  if (!updated) throw notFound(SAMPLE);
  return toRheologyReadingDto(updated);
}

export async function deleteRheologyReading(id: string): Promise<void> {
  const deleted = await deleteRheologyReadingById(id);
  if (!deleted) throw notFound(SAMPLE);
}
