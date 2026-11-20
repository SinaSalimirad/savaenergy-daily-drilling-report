import {
  AppError,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";
import { type ProductDto, toProductDto } from "./product.mapper";
import {
  deleteProductById,
  findProductById,
  findProducts,
  insertProduct,
  type ProductRow,
  updateProductById,
} from "./product.repository";
import type { ListProductsQuery, ProductInputBody } from "./product.schemas";

const PRODUCT = "Product";

export async function listProducts(query: ListProductsQuery) {
  const { rows, total } = await findProducts({
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });
  return {
    items: rows.map(toProductDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getProduct(id: string): Promise<ProductDto> {
  const row = await findProductById(id);
  if (!row) throw notFound(PRODUCT);
  return toProductDto(row);
}

// The unique indexes are the guarantee. Checking "does it exist?" first would race with a
// parallel request, so we run the write and translate the violation.
async function writeProduct(
  write: () => Promise<ProductRow | undefined>,
): Promise<ProductDto> {
  try {
    const row = await write();
    if (!row) throw notFound(PRODUCT);
    return toProductDto(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(409, "PRODUCT_EXISTS", "This product already exists.");
    }
    throw error;
  }
}

export function createProduct(input: ProductInputBody): Promise<ProductDto> {
  return writeProduct(() => insertProduct(input));
}

export function updateProduct(
  id: string,
  input: ProductInputBody,
): Promise<ProductDto> {
  return writeProduct(() => updateProductById(id, input));
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const deleted = await deleteProductById(id);
    if (!deleted) throw notFound(PRODUCT);
  } catch (error) {
    // The database is the guarantee: a project that uses the product holds a foreign key to it.
    if (isForeignKeyViolation(error)) {
      throw new AppError(
        409,
        "PRODUCT_IN_USE",
        "This product is used by a project and cannot be deleted.",
      );
    }
    throw error;
  }
}
