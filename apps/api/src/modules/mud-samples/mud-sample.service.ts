import { notFound } from "../../lib/errors";
import { translateSampleError } from "../_shared/sample-errors";
import { findReportContext } from "../inventory/inventory.repository";
import { type MudSampleDto, toMudSampleDto } from "./mud-sample.mapper";
import {
  deleteMudSampleById,
  findMudSamples,
  insertMudSample,
  updateMudSampleById,
} from "./mud-sample.repository";
import type {
  CreateMudSampleInput,
  ListMudSamplesQuery,
  UpdateMudSampleInput,
} from "./mud-sample.schemas";

const REPORT = "Daily report";
const MUD_SAMPLE = "Mud sample";

export async function listMudSamples(query: ListMudSamplesQuery) {
  const report = await findReportContext(query.report_id);
  if (!report) throw notFound(REPORT);
  const rows = await findMudSamples(report.id);
  return rows.map(toMudSampleDto);
}

export async function createMudSample(
  input: CreateMudSampleInput,
): Promise<MudSampleDto> {
  const report = await findReportContext(input.report_id);
  if (!report) throw notFound(REPORT);
  try {
    const created = await insertMudSample(input);
    if (!created) throw notFound(MUD_SAMPLE);
    return toMudSampleDto(created);
  } catch (error) {
    return translateSampleError(error, "mud sample");
  }
}

export async function updateMudSample(
  id: string,
  patch: UpdateMudSampleInput,
): Promise<MudSampleDto> {
  const updated = await updateMudSampleById(id, patch);
  if (!updated) throw notFound(MUD_SAMPLE);
  return toMudSampleDto(updated);
}

export async function deleteMudSample(id: string): Promise<void> {
  const deleted = await deleteMudSampleById(id);
  if (!deleted) throw notFound(MUD_SAMPLE);
}
