import { AppError, isForeignKeyViolation, notFound } from "../../lib/errors";
import { type ProductDto, toProductDto } from "./product.mapper";
import {
  deleteProductById,
  findProductById,
  findProducts,
  insertProduct,
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

export async function createProduct(
  input: ProductInputBody,
): Promise<ProductDto> {
  const row = await insertProduct(input);
  if (!row) throw notFound(PRODUCT);
  return toProductDto(row);
}

export async function updateProduct(
  id: string,
  input: ProductInputBody,
): Promise<ProductDto> {
  const row = await updateProductById(id, input);
  if (!row) throw notFound(PRODUCT);
  return toProductDto(row);
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
