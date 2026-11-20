import {
  AppError,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
  violatedConstraint,
} from "../../lib/errors";
import {
  type ProjectProductDto,
  toProjectProductDto,
} from "./project-product.mapper";
import {
  deleteProjectProductById,
  findProjectProducts,
  insertProjectProduct,
} from "./project-product.repository";
import type {
  CreateProjectProductInput,
  ListProjectProductsQuery,
} from "./project-product.schemas";

const PROJECT_PRODUCT = "Project product";
const PROJECT_FK = "project_product_project_id_projects_id_fk";
const INVENTORY_FK =
  "product_inventory_project_product_id_project_product_id_fk";

export async function listProjectProducts(query: ListProjectProductsQuery) {
  const { rows, total } = await findProjectProducts({
    projectId: query.project_id,
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });
  return {
    items: rows.map(toProjectProductDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function createProjectProduct(
  input: CreateProjectProductInput,
): Promise<ProjectProductDto> {
  // The database constraints are the guarantee. Checking first would race with a parallel
  // request, so we run the write and translate the violation.
  try {
    const row = await insertProjectProduct(input);
    if (!row) throw notFound(PROJECT_PRODUCT);
    return toProjectProductDto(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        409,
        "PROJECT_PRODUCT_EXISTS",
        "This project already uses this product.",
      );
    }
    if (isForeignKeyViolation(error)) {
      throw notFound(
        violatedConstraint(error) === PROJECT_FK ? "Project" : "Product",
      );
    }
    throw error;
  }
}

export async function deleteProjectProduct(id: string): Promise<void> {
  try {
    const deleted = await deleteProjectProductById(id);
    if (!deleted) throw notFound(PROJECT_PRODUCT);
  } catch (error) {
    // Inventory rows of daily reports hold a foreign key to the project product.
    if (
      isForeignKeyViolation(error) &&
      violatedConstraint(error) === INVENTORY_FK
    ) {
      throw new AppError(
        409,
        "PROJECT_PRODUCT_IN_USE",
        "This product is used in an inventory and cannot be removed from the project.",
      );
    }
    throw error;
  }
}
