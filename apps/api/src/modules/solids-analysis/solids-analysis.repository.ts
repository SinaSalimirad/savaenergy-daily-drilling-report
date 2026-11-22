import { asc, eq, sql } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { solidsAnalyses } from "../../db/schema";
import type {
  CreateSolidsAnalysisInput,
  UpdateSolidsAnalysisInput,
} from "./solids-analysis.schemas";

type Executor = DB | Transaction;

export type SolidsAnalysisRow = typeof solidsAnalyses.$inferSelect;

export async function findSolidsAnalyses(
  reportId: string,
  executor: Executor = db,
) {
  // `id` breaks ties so the order never changes between requests.
  return executor
    .select()
    .from(solidsAnalyses)
    .where(eq(solidsAnalyses.report_id, reportId))
    .orderBy(asc(solidsAnalyses.sample_no), asc(solidsAnalyses.id));
}

export async function findSolidsAnalysisById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .select()
    .from(solidsAnalyses)
    .where(eq(solidsAnalyses.id, id));
  return row;
}

export async function insertSolidsAnalysis(
  input: CreateSolidsAnalysisInput,
  executor: Executor = db,
) {
  // Without a number, the sample takes the next free one.
  const nextNumber = sql<number>`(
    select coalesce(max(s.sample_no), 0) + 1 from ${solidsAnalyses} s where s.report_id = ${input.report_id}
  )`;
  const [created] = await executor
    .insert(solidsAnalyses)
    .values({ ...input, sample_no: input.sample_no ?? nextNumber })
    .returning();
  return created;
}

export async function updateSolidsAnalysisById(
  id: string,
  patch: UpdateSolidsAnalysisInput,
  executor: Executor = db,
) {
  const [row] = await executor
    .update(solidsAnalyses)
    .set(patch)
    .where(eq(solidsAnalyses.id, id))
    .returning();
  return row;
}

export async function deleteSolidsAnalysisById(
  id: string,
  executor: Executor = db,
) {
  const [row] = await executor
    .delete(solidsAnalyses)
    .where(eq(solidsAnalyses.id, id))
    .returning({ id: solidsAnalyses.id });
  return row;
}
