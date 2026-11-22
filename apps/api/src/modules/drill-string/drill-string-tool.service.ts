import {
  AppError,
  isCheckViolation,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { findReportContext } from "../inventory/inventory.repository";
import {
  type DrillStringToolDto,
  toDrillStringToolDto,
} from "./drill-string-tool.mapper";
import {
  deleteDrillStringToolById,
  findDrillStringTools,
  insertDrillStringTool,
  updateDrillStringToolById,
} from "./drill-string-tool.repository";
import type {
  CreateDrillStringToolInput,
  ListDrillStringToolsQuery,
  UpdateDrillStringToolInput,
} from "./drill-string-tool.schemas";

const REPORT = "Daily report";
const ROW = "Drill string tool";

// The database constraints are the guarantee. Checking first would race with a parallel
// request, so we run the write and translate the violation.
async function write(
  run: () => Promise<DrillStringToolDto | undefined>,
): Promise<DrillStringToolDto> {
  try {
    const dto = await run();
    if (!dto) throw notFound(ROW);
    return dto;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "DRILL_STRING_ORDER_TAKEN",
        "This report already has a tool with this row number.",
      );
    }
    if (isCheckViolation(error)) {
      throw new AppError(
        409,
        "DRILL_STRING_TOOL_NOT_VALID",
        "These values do not fit together. Check the depths and the diameters.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound(REPORT);
    throw error;
  }
}

export async function listDrillStringTools(query: ListDrillStringToolsQuery) {
  const report = await findReportContext(query.report_id);
  if (!report) throw notFound(REPORT);
  const rows = await findDrillStringTools(report.id);
  return rows.map(toDrillStringToolDto);
}

export async function createDrillStringTool(input: CreateDrillStringToolInput) {
  const report = await findReportContext(input.report_id);
  if (!report) throw notFound(REPORT);
  return write(async () => {
    const created = await insertDrillStringTool(input);
    return created && toDrillStringToolDto(created);
  });
}

export function updateDrillStringTool(
  id: string,
  patch: UpdateDrillStringToolInput,
) {
  return write(async () => {
    const updated = await updateDrillStringToolById(id, patch);
    return updated && toDrillStringToolDto(updated);
  });
}

export async function deleteDrillStringTool(id: string): Promise<void> {
  const deleted = await deleteDrillStringToolById(id);
  if (!deleted) throw notFound(ROW);
}
