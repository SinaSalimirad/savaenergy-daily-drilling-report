import {
  AppError,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { type PumpDto, toPumpDto } from "./pump.mapper";
import {
  deletePumpById,
  findPumpById,
  findPumps,
  insertPump,
  type PumpRow,
  updatePumpById,
} from "./pump.repository";
import type {
  CreatePumpInput,
  ListPumpsQuery,
  UpdatePumpInput,
} from "./pump.schemas";

const PUMP = "Pump";

// The database constraints are the guarantee. Checking first would race with a parallel
// request, so we run the write and translate the violation.
async function writePump(
  write: () => Promise<PumpRow | undefined>,
): Promise<PumpDto> {
  try {
    const row = await write();
    if (!row) throw notFound(PUMP);
    return toPumpDto(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "PUMP_ORDER_TAKEN",
        "This project already has a pump with this order.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound("Project");
    throw error;
  }
}

export async function listPumps(query: ListPumpsQuery) {
  const { rows, total } = await findPumps({
    projectId: query.project_id,
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });
  return {
    items: rows.map(toPumpDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getPump(id: string): Promise<PumpDto> {
  const row = await findPumpById(id);
  if (!row) throw notFound(PUMP);
  return toPumpDto(row);
}

export function createPump(input: CreatePumpInput) {
  return writePump(() => insertPump(input));
}

export function updatePump(id: string, patch: UpdatePumpInput) {
  return writePump(() => updatePumpById(id, patch));
}

export async function deletePump(id: string): Promise<void> {
  const deleted = await deletePumpById(id);
  if (!deleted) throw notFound(PUMP);
}
