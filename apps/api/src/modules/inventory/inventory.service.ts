import {
  AppError,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { finalStock, totalsFor } from "./inventory.calc";
import { type InventoryDto, toInventoryDto } from "./inventory.mapper";
import {
  deleteInventoryRowById,
  findInventoryRowById,
  findInventoryRows,
  findMovements,
  findPreviousRow,
  findProjectProductById,
  findReportContext,
  type InventoryRowData,
  insertInventoryRow,
  type ReportContext,
  updateInventoryRowById,
} from "./inventory.repository";
import type {
  CreateInventoryInput,
  ListInventoryQuery,
  UpdateInventoryInput,
} from "./inventory.schemas";

const REPORT = "Daily report";
const INVENTORY_ROW = "Inventory row";

/** Adds the computed totals to rows of one report. One query reads the history of them all. */
async function toDtos(
  report: ReportContext,
  rows: InventoryRowData[],
): Promise<InventoryDto[]> {
  const history = await findMovements({
    wellId: report.well_id,
    projectProductIds: rows.map((row) => row.inventory.project_product_id),
    date: report.report_date,
  });
  return rows.map((row) =>
    toInventoryDto(
      row,
      totalsFor(history, {
        projectProductId: row.inventory.project_product_id,
        reportDate: report.report_date,
        sectionId: report.section_id,
      }),
    ),
  );
}

async function dtoById(id: string): Promise<InventoryDto> {
  const row = await findInventoryRowById(id);
  if (!row) throw notFound(INVENTORY_ROW);
  const report = await findReportContext(row.inventory.report_id);
  if (!report) throw notFound(REPORT);
  const [dto] = await toDtos(report, [row]);
  if (!dto) throw notFound(INVENTORY_ROW);
  return dto;
}

export async function listInventory(query: ListInventoryQuery) {
  const report = await findReportContext(query.report_id);
  if (!report) throw notFound(REPORT);
  const rows = await findInventoryRows(report.id);
  return toDtos(report, rows);
}

export async function createInventoryRow(
  input: CreateInventoryInput,
): Promise<InventoryDto> {
  const report = await findReportContext(input.report_id);
  if (!report) throw notFound(REPORT);

  const link = await findProjectProductById(input.project_product_id);
  if (!link) throw notFound("Project product");
  // A report can only list the products of its own project.
  if (link.project_id !== report.project_id) {
    throw new AppError(
      409,
      "INVENTORY_PRODUCT_NOT_IN_PROJECT",
      "This product is not used by the project of this report.",
    );
  }

  // Without an initial stock, the stock continues from the last report of the well.
  let initial = input.initial;
  if (initial === undefined) {
    const previous = await findPreviousRow({
      wellId: report.well_id,
      projectProductId: link.id,
      date: report.report_date,
    });
    initial = previous ? finalStock(previous) : 0;
  }

  try {
    const created = await insertInventoryRow({
      report_id: report.id,
      project_product_id: link.id,
      initial,
      received: input.received ?? 0,
      used: input.used ?? 0,
      returned: input.returned ?? 0,
    });
    if (!created) throw notFound(INVENTORY_ROW);
    return await dtoById(created.id);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "INVENTORY_ROW_EXISTS",
        "This product is already in the inventory of this report.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound(REPORT);
    throw error;
  }
}

export async function updateInventoryRow(
  id: string,
  patch: UpdateInventoryInput,
): Promise<InventoryDto> {
  const updated = await updateInventoryRowById(id, patch);
  if (!updated) throw notFound(INVENTORY_ROW);
  return dtoById(id);
}

export async function deleteInventoryRow(id: string): Promise<void> {
  const deleted = await deleteInventoryRowById(id);
  if (!deleted) throw notFound(INVENTORY_ROW);
}
