import {
  AppError,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
  violatedConstraint,
} from "../../lib/errors";
import { type ProjectDto, toProjectDto } from "./project.mapper";
import {
  deleteProjectById,
  findProjectById,
  findProjects,
  insertProject,
  markArchived,
  markRestored,
  type ProjectRow,
  updateProjectById,
} from "./project.repository";
import type {
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from "./project.schemas";

const PROJECT = "Project";
const PROJECT_PRODUCT_FK = "project_product_project_id_projects_id_fk";
const PUMP_FK = "pumps_project_id_projects_id_fk";
const SCE_FK = "solid_control_equipment_project_id_projects_id_fk";

const nameTaken = () =>
  new AppError(
    409,
    "PROJECT_NAME_TAKEN",
    "A project with this name already exists.",
  );

// The unique constraint is the guarantee. Checking "does the name exist?" before the write
// would race with a parallel request, so we run the write and translate the violation.
async function writeProject(
  write: () => Promise<ProjectRow | undefined>,
): Promise<ProjectDto> {
  try {
    const row = await write();
    if (!row) throw notFound(PROJECT);
    return toProjectDto(row);
  } catch (error) {
    if (isUniqueViolation(error)) throw nameTaken();
    throw error;
  }
}

export async function listProjects(query: ListProjectsQuery) {
  const { rows, total } = await findProjects({
    archived: query.archived === "true",
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });

  return {
    items: rows.map(toProjectDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getProject(id: string): Promise<ProjectDto> {
  const row = await findProjectById(id);
  if (!row) throw notFound(PROJECT);
  return toProjectDto(row);
}

export function createProject(input: CreateProjectInput) {
  return writeProject(() => insertProject(input));
}

export function updateProject(id: string, patch: UpdateProjectInput) {
  return writeProject(() => updateProjectById(id, patch));
}

export async function archiveProject(id: string): Promise<ProjectDto> {
  const row = await markArchived(id);
  if (row) return toProjectDto(row);

  // Nothing was updated: either the id is unknown or the project is already archived.
  if (!(await findProjectById(id))) throw notFound(PROJECT);
  throw new AppError(
    409,
    "PROJECT_ALREADY_ARCHIVED",
    "This project is already archived.",
  );
}

export async function restoreProject(id: string): Promise<ProjectDto> {
  const row = await markRestored(id);
  if (row) return toProjectDto(row);

  if (!(await findProjectById(id))) throw notFound(PROJECT);
  throw new AppError(
    409,
    "PROJECT_NOT_ARCHIVED",
    "This project is not archived.",
  );
}

export async function deleteProject(id: string): Promise<void> {
  // The foreign key from wells is the guarantee. Counting the wells first would race with a
  // parallel request that adds one, so we run the delete and translate the violation.
  try {
    const deleted = await deleteProjectById(id);
    if (!deleted) throw notFound(PROJECT);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      // Wells, products, pumps and solid control equipment of the project all hold a foreign key to it.
      if (violatedConstraint(error) === PROJECT_PRODUCT_FK) {
        throw new AppError(
          409,
          "PROJECT_HAS_PRODUCTS",
          "This project still has products. Remove them first.",
        );
      }
      if (violatedConstraint(error) === PUMP_FK) {
        throw new AppError(
          409,
          "PROJECT_HAS_PUMPS",
          "This project still has pumps. Delete them first.",
        );
      }
      if (violatedConstraint(error) === SCE_FK) {
        throw new AppError(
          409,
          "PROJECT_HAS_SOLID_CONTROL",
          "This project still has solid control equipment. Delete it first.",
        );
      }
      throw new AppError(
        409,
        "PROJECT_HAS_WELLS",
        "This project still has wells. Delete them first.",
      );
    }
    throw error;
  }
}
