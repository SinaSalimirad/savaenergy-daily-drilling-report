import { notFound } from "../../lib/errors";
import { translateSampleError } from "../_shared/sample-errors";
import { findReportContext } from "../inventory/inventory.repository";
import { findSaltTableRows } from "../salt-tables/salt-table.repository";
import {
  type SolidsAnalysisDto,
  toSolidsAnalysisDto,
} from "./solids-analysis.mapper";
import {
  deleteSolidsAnalysisById,
  findSolidsAnalyses,
  insertSolidsAnalysis,
  updateSolidsAnalysisById,
} from "./solids-analysis.repository";
import type {
  CreateSolidsAnalysisInput,
  ListSolidsAnalysesQuery,
  UpdateSolidsAnalysisInput,
} from "./solids-analysis.schemas";

const REPORT = "Daily report";
const SAMPLE = "Solids analysis";

// The salt of the rig's solids analysis is NaCl: its table turns chlorides into salt water.
const brineTable = () => findSaltTableRows({ salt_type: "NaCl" });

export async function listSolidsAnalyses(query: ListSolidsAnalysesQuery) {
  const report = await findReportContext(query.report_id);
  if (!report) throw notFound(REPORT);
  const [rows, brine] = await Promise.all([
    findSolidsAnalyses(report.id),
    brineTable(),
  ]);
  return rows.map((row) => toSolidsAnalysisDto(row, brine));
}

export async function createSolidsAnalysis(
  input: CreateSolidsAnalysisInput,
): Promise<SolidsAnalysisDto> {
  const report = await findReportContext(input.report_id);
  if (!report) throw notFound(REPORT);
  try {
    const created = await insertSolidsAnalysis(input);
    if (!created) throw notFound(SAMPLE);
    return toSolidsAnalysisDto(created, await brineTable());
  } catch (error) {
    return translateSampleError(error, "solids analysis");
  }
}

export async function updateSolidsAnalysis(
  id: string,
  patch: UpdateSolidsAnalysisInput,
): Promise<SolidsAnalysisDto> {
  const updated = await updateSolidsAnalysisById(id, patch);
  if (!updated) throw notFound(SAMPLE);
  return toSolidsAnalysisDto(updated, await brineTable());
}

export async function deleteSolidsAnalysis(id: string): Promise<void> {
  const deleted = await deleteSolidsAnalysisById(id);
  if (!deleted) throw notFound(SAMPLE);
}
