import { asc, count, eq } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { products, projectProducts } from "../../db/schema";
import type {
  CreateProjectProductInput,
  UpdateProjectProductInput,
} from "./project-product.schemas";

type Executor = DB | Transaction;

// The product is joined in, so the list can show its name and packaging without a request per row.
const selection = { project_product: projectProducts, product: products };

export type ProjectProductRow = {
  project_product: typeof projectProducts.$inferSelect;
  product: typeof products.$inferSelect;
};

type ListParams = { projectId?: string; limit: number; offset: number };

export async function findProjectProducts(
  { projectId, limit, offset }: ListParams,
  executor: Executor = db,
) {
  const where = projectId
    ? eq(projectProducts.project_id, projectId)
    : undefined;
  // By product name. `id` breaks ties so a page never repeats or skips a row.
  const [rows, totals] = await Promise.all([
    executor
      .select(selection)
      .from(projectProducts)
      .innerJoin(products, eq(products.id, projectProducts.product_id))
      .where(where)
      .orderBy(asc(products.name), asc(projectProducts.id))
      .limit(limit)
      .offset(offset),
    executor.select({ total: count() }).from(projectProducts).where(where),
  ]);
  return { rows, total: totals[0]?.total ?? 0 };
}

export async function findProjectProductById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .select(selection)
    .from(projectProducts)
    .innerJoin(products, eq(products.id, projectProducts.product_id))
    .where(eq(projectProducts.id, id));
  return row;
}

export async function insertProjectProduct(
  input: CreateProjectProductInput,
  executor: Executor = db,
) {
  const [created] = await executor
    .insert(projectProducts)
    .values({ ...input, price: input.price ?? null })
    .returning({ id: projectProducts.id });
  return created && findProjectProductById(created.id, executor);
}

export async function updateProjectProductById(
  id: string,
  patch: UpdateProjectProductInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(projectProducts)
    .set(patch)
    .where(eq(projectProducts.id, id))
    .returning({ id: projectProducts.id });
  return row && findProjectProductById(row.id, executor);
}

export async function deleteProjectProductById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .delete(projectProducts)
    .where(eq(projectProducts.id, id))
    .returning({ id: projectProducts.id });
  return row;
}
