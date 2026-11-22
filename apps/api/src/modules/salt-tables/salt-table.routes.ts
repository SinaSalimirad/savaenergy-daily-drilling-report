import { Elysia } from "elysia";
import { listSaltTableQuerySchema } from "./salt-table.schemas";
import { listSaltTable } from "./salt-table.service";

// Reference data: read only. The rows come from the migration.
export const saltTableRoutes = new Elysia({ prefix: "/salt-tables" }).get(
  "/",
  async ({ query }) => ({ data: await listSaltTable(query) }),
  { query: listSaltTableQuerySchema },
);
