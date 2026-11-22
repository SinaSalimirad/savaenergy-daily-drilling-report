import { asc, eq } from "drizzle-orm";
import { type DB, db, type Transaction } from "../../db";
import { saltTableRows } from "../../db/schema";
import type { ListSaltTableQuery } from "./salt-table.schemas";

type Executor = DB | Transaction;

export type SaltTableRow = typeof saltTableRows.$inferSelect;

export async function findSaltTableRows(
  { salt_type }: ListSaltTableQuery,
  executor: Executor = db,
) {
  return executor
    .select()
    .from(saltTableRows)
    .where(eq(saltTableRows.salt_type, salt_type))
    .orderBy(asc(saltTableRows.weight_percent));
}
