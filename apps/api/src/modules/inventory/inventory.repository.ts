import { and, asc, desc, eq, inArray, lt, lte } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import {
  dailyReports,
  productInventories,
  products,
  projectProducts,
  wells,
} from "../../db/schema";
import type { Movement } from "./inventory.calc";
import type { UpdateInventoryInput } from "./inventory.schemas";

type Executor = DB | Transaction;

const selection = {
  inventory: productInventories,
  link: projectProducts,
  product: products,
};

export type InventoryRowData = {
  inventory: typeof productInventories.$inferSelect;
  link: typeof projectProducts.$inferSelect;
  product: typeof products.$inferSelect;
};

/** What the sheet needs to know about its report: the well, the day and the section. */
export type ReportContext = {
  id: string;
  well_id: string;
  project_id: string;
  report_date: string;
  section_id: string;
};

export async function findReportContext(
  reportId: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .select({
      id: dailyReports.id,
      well_id: dailyReports.well_id,
      project_id: wells.project_id,
      report_date: dailyReports.report_date,
      section_id: dailyReports.section_id,
    })
    .from(dailyReports)
    .innerJoin(wells, eq(wells.id, dailyReports.well_id))
    .where(eq(dailyReports.id, reportId));
  return row;
}

function rowsQuery(executor: Executor) {
  return executor
    .select(selection)
    .from(productInventories)
    .innerJoin(
      projectProducts,
      eq(projectProducts.id, productInventories.project_product_id),
    )
    .innerJoin(products, eq(products.id, projectProducts.product_id));
}

export async function findInventoryRows(
  reportId: string,
  executor: Executor = db,
) {
  // By product name. `id` breaks ties so the order never changes between requests.
  return rowsQuery(executor)
    .where(eq(productInventories.report_id, reportId))
    .orderBy(asc(products.name), asc(productInventories.id));
}

export async function findInventoryRowById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await rowsQuery(executor).where(eq(productInventories.id, id));
  return row;
}

export async function findProjectProductById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .select()
    .from(projectProducts)
    .where(eq(projectProducts.id, id));
  return row;
}

/** Every movement of the given products in one well, up to and including `date`. */
export async function findMovements(
  {
    wellId,
    projectProductIds,
    date,
  }: {
    wellId: string;
    projectProductIds: string[];
    date: string;
  },
  executor: Executor = db,
): Promise<Movement[]> {
  if (projectProductIds.length === 0) return [];
  const rows = await executor
    .select({
      projectProductId: productInventories.project_product_id,
      reportDate: dailyReports.report_date,
      sectionId: dailyReports.section_id,
      received: productInventories.received,
      used: productInventories.used,
      returned: productInventories.returned,
    })
    .from(productInventories)
    .innerJoin(dailyReports, eq(dailyReports.id, productInventories.report_id))
    .where(
      and(
        eq(dailyReports.well_id, wellId),
        lte(dailyReports.report_date, date),
        inArray(productInventories.project_product_id, projectProductIds),
      ),
    );
  return rows;
}

/** The row of the latest report before `date` in the same well, if the product had one. */
export async function findPreviousRow(
  {
    wellId,
    projectProductId,
    date,
  }: {
    wellId: string;
    projectProductId: string;
    date: string;
  },
  executor: Executor = db,
) {
  const [row] = await executor
    .select({
      initial: productInventories.initial,
      received: productInventories.received,
      used: productInventories.used,
      returned: productInventories.returned,
    })
    .from(productInventories)
    .innerJoin(dailyReports, eq(dailyReports.id, productInventories.report_id))
    .where(
      and(
        eq(dailyReports.well_id, wellId),
        lt(dailyReports.report_date, date),
        eq(productInventories.project_product_id, projectProductId),
      ),
    )
    .orderBy(desc(dailyReports.report_date))
    .limit(1);
  return row;
}

export async function insertInventoryRow(
  values: {
    report_id: string;
    project_product_id: string;
    initial: number;
    received: number;
    used: number;
    returned: number;
  },
  executor: Executor = db,
) {
  const [created] = await executor
    .insert(productInventories)
    .values(values)
    .returning({ id: productInventories.id });
  return created;
}

export async function updateInventoryRowById(
  id: string,
  patch: UpdateInventoryInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(productInventories)
    .set(patch)
    .where(eq(productInventories.id, id))
    .returning({ id: productInventories.id });
  return row;
}

export async function deleteInventoryRowById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .delete(productInventories)
    .where(eq(productInventories.id, id))
    .returning({ id: productInventories.id });
  return row;
}
