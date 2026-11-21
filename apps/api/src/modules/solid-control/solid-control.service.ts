import {
  AppError,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
  violatedConstraint,
} from "../../lib/errors";
import { type SceDto, toSceDto } from "./solid-control.mapper";
import {
  deleteSceById,
  findSce,
  findSceById,
  insertSce,
  type SceRow,
  updateSceById,
} from "./solid-control.repository";
import type {
  CreateSceInput,
  ListSceQuery,
  UpdateSceInput,
} from "./solid-control.schemas";

const SCE = "Solid control equipment";
const UNIT_NO_UNIQUE = "solid_control_equipment_project_id_type_unit_no_unique";

// The database constraints are the guarantee. Checking first would race with a parallel
// request, so we run the write and translate the violation.
async function writeSce(
  write: () => Promise<SceRow | undefined>,
): Promise<SceDto> {
  try {
    const row = await write();
    if (!row) throw notFound(SCE);
    return toSceDto(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      // Two rules share this code: the row of the sheet, and the number within a type.
      if (violatedConstraint(error) === UNIT_NO_UNIQUE) {
        throw new AppError(
          409,
          "SCE_UNIT_NO_TAKEN",
          "This project already has a unit of this type with this number.",
        );
      }
      throw new AppError(
        409,
        "SCE_SORT_ORDER_TAKEN",
        "This project already has a unit with this row.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound("Project");
    throw error;
  }
}

export async function listSce(query: ListSceQuery) {
  const { rows, total } = await findSce({
    projectId: query.project_id,
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });
  return {
    items: rows.map(toSceDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getSce(id: string): Promise<SceDto> {
  const row = await findSceById(id);
  if (!row) throw notFound(SCE);
  return toSceDto(row);
}

export function createSce(input: CreateSceInput) {
  return writeSce(() => insertSce(input));
}

export function updateSce(id: string, patch: UpdateSceInput) {
  return writeSce(() => updateSceById(id, patch));
}

export async function deleteSce(id: string): Promise<void> {
  const deleted = await deleteSceById(id);
  if (!deleted) throw notFound(SCE);
}
