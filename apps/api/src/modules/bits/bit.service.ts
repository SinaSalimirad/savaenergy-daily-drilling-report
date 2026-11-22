import {
  AppError,
  isCheckViolation,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { findReportContext } from "../inventory/inventory.repository";
import { type BitDto, toBitDto } from "./bit.mapper";
import {
  deleteBitById,
  findBits,
  insertBit,
  updateBitById,
} from "./bit.repository";
import type {
  CreateBitInput,
  ListBitsQuery,
  UpdateBitInput,
} from "./bit.schemas";

const REPORT = "Daily report";
const ROW = "Bit";

// The database constraints are the guarantee. Checking first would race with a parallel
// request, so we run the write and translate the violation.
async function write(run: () => Promise<BitDto | undefined>): Promise<BitDto> {
  try {
    const dto = await run();
    if (!dto) throw notFound(ROW);
    return dto;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "BIT_EXISTS",
        "This report already has a bit. Edit it instead.",
      );
    }
    if (isCheckViolation(error)) {
      throw new AppError(
        409,
        "BIT_NOT_VALID",
        "These values do not fit together. Check the depths and the diameters.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound(REPORT);
    throw error;
  }
}

export async function listBits(query: ListBitsQuery) {
  const report = await findReportContext(query.report_id);
  if (!report) throw notFound(REPORT);
  const rows = await findBits(report.id);
  return rows.map(toBitDto);
}

export async function createBit(input: CreateBitInput) {
  const report = await findReportContext(input.report_id);
  if (!report) throw notFound(REPORT);
  return write(async () => {
    const created = await insertBit(input);
    return created && toBitDto(created);
  });
}

export function updateBit(id: string, patch: UpdateBitInput) {
  return write(async () => {
    const updated = await updateBitById(id, patch);
    return updated && toBitDto(updated);
  });
}

export async function deleteBit(id: string): Promise<void> {
  const deleted = await deleteBitById(id);
  if (!deleted) throw notFound(ROW);
}
