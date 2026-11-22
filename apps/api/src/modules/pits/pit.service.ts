import {
  AppError,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { type PitDto, toPitDto } from "./pit.mapper";
import {
  deletePitById,
  findPitById,
  findPits,
  insertPit,
  type PitRow,
  updatePitById,
} from "./pit.repository";
import type {
  CreatePitInput,
  ListPitsQuery,
  UpdatePitInput,
} from "./pit.schemas";

const PIT = "Pit";

// The database constraints are the guarantee. Checking first would race with a parallel
// request, so we run the write and translate the violation.
async function writePit(
  write: () => Promise<PitRow | undefined>,
): Promise<PitDto> {
  try {
    const row = await write();
    if (!row) throw notFound(PIT);
    return toPitDto(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "PIT_NAME_TAKEN",
        "This project already has a pit with this name.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound("Project");
    throw error;
  }
}

export async function listPits(query: ListPitsQuery) {
  const { rows, total } = await findPits({
    projectId: query.project_id,
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });
  return {
    items: rows.map(toPitDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getPit(id: string): Promise<PitDto> {
  const row = await findPitById(id);
  if (!row) throw notFound(PIT);
  return toPitDto(row);
}

export function createPit(input: CreatePitInput) {
  return writePit(() => insertPit(input));
}

export function updatePit(id: string, patch: UpdatePitInput) {
  return writePit(() => updatePitById(id, patch));
}

export async function deletePit(id: string): Promise<void> {
  try {
    const deleted = await deletePitById(id);
    if (!deleted) throw notFound(PIT);
  } catch (error) {
    // The pit readings of the daily reports hold a foreign key to the pit.
    if (isForeignKeyViolation(error)) {
      throw new AppError(
        409,
        "PIT_HAS_READINGS",
        "This pit still has readings in daily reports. Remove them first.",
      );
    }
    throw error;
  }
}
