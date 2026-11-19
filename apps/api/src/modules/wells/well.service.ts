import {
  AppError,
  isCheckViolation,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { toWellDto, type WellDto } from "./well.mapper";
import {
  deleteWellById,
  findWellById,
  findWells,
  insertWell,
  markArchived,
  markRestored,
  updateWellById,
  type WellRow,
} from "./well.repository";
import type {
  CreateWellInput,
  ListWellsQuery,
  UpdateWellInput,
} from "./well.schemas";

const WELL = "Well";
// The status before archiving is not stored, so restore needs a fixed target.
const RESTORED_STATUS = "planned";

// The database constraints are the guarantee. Checking first would race with a parallel
// request, so we run the write and translate the violation.
async function writeWell(
  write: () => Promise<WellRow | undefined>,
): Promise<WellDto> {
  try {
    const row = await write();
    if (!row) throw notFound(WELL);
    return toWellDto(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "WELL_NAME_TAKEN",
        "This project already has a well with this name.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound("Project");
    // The only check a validated request can still break is "no water depth on an onshore rig", for
    // example a patch that sets a depth on a well that is stored as onshore.
    if (isCheckViolation(error)) {
      throw new AppError(
        409,
        "WELL_WATER_DEPTH_ONSHORE",
        "Water depth applies to offshore wells only.",
      );
    }
    throw error;
  }
}

export async function listWells(query: ListWellsQuery) {
  const { rows, total } = await findWells({
    archived: query.archived === "true",
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });
  return {
    items: rows.map(toWellDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getWell(id: string): Promise<WellDto> {
  const row = await findWellById(id);
  if (!row) throw notFound(WELL);
  return toWellDto(row);
}

export function createWell(input: CreateWellInput) {
  return writeWell(() => insertWell(input));
}

export function updateWell(id: string, patch: UpdateWellInput) {
  // Moving a well to an onshore rig clears its depth, so the two fields cannot disagree.
  const next =
    patch.rig_type === "onshore" ? { ...patch, water_depth: null } : patch;
  return writeWell(() => updateWellById(id, next));
}

export async function archiveWell(id: string): Promise<WellDto> {
  const row = await markArchived(id);
  if (row) return toWellDto(row);
  if (!(await findWellById(id))) throw notFound(WELL);
  throw new AppError(
    409,
    "WELL_ALREADY_ARCHIVED",
    "This well is already archived.",
  );
}

export async function restoreWell(id: string): Promise<WellDto> {
  const row = await markRestored(id, RESTORED_STATUS);
  if (row) return toWellDto(row);
  if (!(await findWellById(id))) throw notFound(WELL);
  throw new AppError(409, "WELL_NOT_ARCHIVED", "This well is not archived.");
}

export async function deleteWell(id: string): Promise<void> {
  const deleted = await deleteWellById(id);
  if (!deleted) throw notFound(WELL);
}
