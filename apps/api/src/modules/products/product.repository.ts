import { asc, count, eq } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { products } from "../../db/schema";
import type { ProductInputBody } from "./product.schemas";

type Executor = DB | Transaction;

export type ProductRow = typeof products.$inferSelect;

type ListParams = { limit: number; offset: number };

// A product only has the fields of its kind. Every other column is set to null, so changing
// the kind of a product also clears the fields of the old kind.
function toColumns(input: ProductInputBody) {
  return {
    package_size: null,
    package_unit: null,
    specific_gravity: null,
    length_m: null,
    width_m: null,
    ...input,
  };
}

export async function findProducts(
  { limit, offset }: ListParams,
  executor: Executor = db,
) {
  // By name. `id` breaks ties so a page never repeats or skips a row.
  const [rows, totals] = await Promise.all([
    executor
      .select()
      .from(products)
      .orderBy(asc(products.name), asc(products.id))
      .limit(limit)
      .offset(offset),
    executor.select({ total: count() }).from(products),
  ]);
  return { rows, total: totals[0]?.total ?? 0 };
}

export async function findProductById(id: string, executor: Executor = db) {
  const [row] = await executor
    .select()
    .from(products)
    .where(eq(products.id, id));
  return row;
}

export async function insertProduct(
  input: ProductInputBody,
  executor: Executor = db,
) {
  const [row] = await executor
    .insert(products)
    .values(toColumns(input))
    .returning();
  return row;
}

export async function updateProductById(
  id: string,
  input: ProductInputBody,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(products)
    .set(toColumns(input))
    .where(eq(products.id, id))
    .returning();
  return row;
}

export async function deleteProductById(id: string, executor: Executor = db) {
  const [row] = await executor
    .delete(products)
    .where(eq(products.id, id))
    .returning({ id: products.id });
  return row;
}
