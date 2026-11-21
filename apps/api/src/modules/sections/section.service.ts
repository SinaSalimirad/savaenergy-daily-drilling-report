import {
  AppError,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { type SectionDto, toSectionDto } from "./section.mapper";
import {
  deleteSectionById,
  findSectionById,
  findSections,
  insertSection,
  moveSectionToOrder,
  type SectionRow,
  updateSectionById,
} from "./section.repository";
import type {
  CreateSectionInput,
  ListSectionsQuery,
  MoveSectionInput,
  UpdateSectionInput,
} from "./section.schemas";

const SECTION = "Section";

// The database constraints are the guarantee. Checking first would race with a parallel
// request, so we run the write and translate the violation.
async function writeSection(
  write: () => Promise<SectionRow | undefined>,
): Promise<SectionDto> {
  try {
    const row = await write();
    if (!row) throw notFound(SECTION);
    return toSectionDto(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "SECTION_SORT_ORDER_TAKEN",
        "This well already has a section with this order.",
      );
    }
    if (isForeignKeyViolation(error)) throw notFound("Well");
    throw error;
  }
}

export async function listSections(query: ListSectionsQuery) {
  const { rows, total } = await findSections({
    wellId: query.well_id,
    projectId: query.project_id,
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });
  return {
    items: rows.map(toSectionDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getSection(id: string): Promise<SectionDto> {
  const row = await findSectionById(id);
  if (!row) throw notFound(SECTION);
  return toSectionDto(row);
}

export function createSection(input: CreateSectionInput) {
  return writeSection(() => insertSection(input));
}

export function updateSection(id: string, patch: UpdateSectionInput) {
  return writeSection(() => updateSectionById(id, patch));
}

export async function moveSection(
  id: string,
  { to_order }: MoveSectionInput,
): Promise<SectionDto> {
  const section = await findSectionById(id);
  if (!section) throw notFound(SECTION);
  // Moving onto its own place changes nothing.
  if (section.sort_order === to_order) return toSectionDto(section);

  return writeSection(() => moveSectionToOrder(section, to_order));
}

export async function deleteSection(id: string): Promise<void> {
  const deleted = await deleteSectionById(id);
  if (!deleted) throw notFound(SECTION);
}
