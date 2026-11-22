import {
  AppError,
  isCheckViolation,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { findReportContext } from "../inventory/inventory.repository";
import {
  toWellboreIntervalDto,
  type WellboreIntervalDto,
} from "./wellbore-interval.mapper";
import {
  deleteWellboreIntervalById,
  findWellboreIntervals,
  insertWellboreInterval,
  updateWellboreIntervalById,
} from "./wellbore-interval.repository";
import type {
  CreateWellboreIntervalInput,
  ListWellboreIntervalsQuery,
  UpdateWellboreIntervalInput,
} from "./wellbore-interval.schemas";

const REPORT = "Daily report";
const ROW = "Wellbore interval";

// The database constraints are the guarantee. Checking first would race with a parallel
// request, so we run the write and translate the violation.
async function write(
  run: () => Promise<WellboreIntervalDto | undefined>,
): Promise<WellboreIntervalDto> {
  try {
    const dto = await run();
    if (!dto) throw notFound(ROW);
    return dto;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "WELLBORE_INTERVAL_ORDER_TAKEN",
        "This report already has a wellbore interval with this row number.",
      );
    }
    if (isCheckViolation(error)) {
      throw new AppError(
        409,
        "WELLBORE_INTERVAL_NOT_VALID",
        "These values do not fit together. Check the depths and the diameters.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound(REPORT);
    throw error;
  }
}

export async function listWellboreIntervals(query: ListWellboreIntervalsQuery) {
  const report = await findReportContext(query.report_id);
  if (!report) throw notFound(REPORT);
  const rows = await findWellboreIntervals(report.id);
  return rows.map(toWellboreIntervalDto);
}

export async function createWellboreInterval(
  input: CreateWellboreIntervalInput,
) {
  const report = await findReportContext(input.report_id);
  if (!report) throw notFound(REPORT);
  return write(async () => {
    const created = await insertWellboreInterval(input);
    return created && toWellboreIntervalDto(created);
  });
}

export function updateWellboreInterval(
  id: string,
  patch: UpdateWellboreIntervalInput,
) {
  return write(async () => {
    const updated = await updateWellboreIntervalById(id, patch);
    return updated && toWellboreIntervalDto(updated);
  });
}

export async function deleteWellboreInterval(id: string): Promise<void> {
  const deleted = await deleteWellboreIntervalById(id);
  if (!deleted) throw notFound(ROW);
}
