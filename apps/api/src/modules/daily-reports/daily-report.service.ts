import { DAILY_REPORT_CONSTRAINTS } from "../../db/schema";
import {
  AppError,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
  violatedConstraint,
} from "../../lib/errors";
import { type DailyReportDto, toDailyReportDto } from "./daily-report.mapper";
import {
  type DailyReportRow,
  deleteDailyReportById,
  findDailyReportById,
  findDailyReports,
  insertDailyReport,
  updateDailyReportById,
} from "./daily-report.repository";
import type {
  CreateDailyReportInput,
  ListDailyReportsQuery,
  UpdateDailyReportInput,
} from "./daily-report.schemas";

const DAILY_REPORT = "Daily report";

// The database constraints are the guarantee. Checking first would race with a parallel
// request, so we run the write and translate the violation by the constraint it broke.
async function writeDailyReport(
  write: () => Promise<DailyReportRow | undefined>,
): Promise<DailyReportDto> {
  try {
    const row = await write();
    if (!row) throw notFound(DAILY_REPORT);
    return toDailyReportDto(row);
  } catch (error) {
    throw translateViolation(error);
  }
}

function translateViolation(error: unknown): unknown {
  const constraint = violatedConstraint(error);

  if (isUniqueViolation(error)) {
    if (constraint === DAILY_REPORT_CONSTRAINTS.uniqueDate) {
      return new AppError(
        409,
        "DAILY_REPORT_DATE_TAKEN",
        "This well already has a report for this date.",
      );
    }
    if (constraint === DAILY_REPORT_CONSTRAINTS.uniqueNumber) {
      return new AppError(
        409,
        "DAILY_REPORT_NUMBER_TAKEN",
        "This well already has a report with this number.",
      );
    }
  }

  if (isForeignKeyViolation(error)) {
    // The composite key fails both when the section is missing and when it belongs to another well.
    if (constraint === DAILY_REPORT_CONSTRAINTS.sectionBelongsToWell) {
      return new AppError(
        400,
        "SECTION_NOT_IN_WELL",
        "Choose a section that belongs to this well.",
      );
    }
    return notFound("Well");
  }

  return error;
}

export async function listDailyReports(query: ListDailyReportsQuery) {
  const { rows, total } = await findDailyReports({
    wellId: query.well_id,
    projectId: query.project_id,
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });
  return {
    items: rows.map(toDailyReportDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getDailyReport(id: string): Promise<DailyReportDto> {
  const row = await findDailyReportById(id);
  if (!row) throw notFound(DAILY_REPORT);
  return toDailyReportDto(row);
}

export function createDailyReport(input: CreateDailyReportInput) {
  return writeDailyReport(() => insertDailyReport(input));
}

export function updateDailyReport(id: string, patch: UpdateDailyReportInput) {
  return writeDailyReport(() => updateDailyReportById(id, patch));
}

export async function deleteDailyReport(id: string): Promise<void> {
  const deleted = await deleteDailyReportById(id);
  if (!deleted) throw notFound(DAILY_REPORT);
}
