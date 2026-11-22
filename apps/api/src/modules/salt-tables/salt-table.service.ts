import { toSaltTableRowDto } from "./salt-table.mapper";
import { findSaltTableRows } from "./salt-table.repository";
import type { ListSaltTableQuery } from "./salt-table.schemas";

export async function listSaltTable(query: ListSaltTableQuery) {
  const rows = await findSaltTableRows(query);
  return rows.map(toSaltTableRowDto);
}
