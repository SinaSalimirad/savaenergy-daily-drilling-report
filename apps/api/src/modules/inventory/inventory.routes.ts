import { Elysia } from "elysia";
import {
  createInventorySchema,
  inventoryIdParamsSchema,
  listInventoryQuerySchema,
  updateInventorySchema,
} from "./inventory.schemas";
import {
  createInventoryRow,
  deleteInventoryRow,
  listInventory,
  updateInventoryRow,
} from "./inventory.service";

// Routes only parse input and call the service. Rules live in the service.
// The inventory is the sheet of one daily report: `GET` needs `report_id` and returns every row,
// so it has no paging (a report has at most one row per product of the project).
export const inventoryRoutes = new Elysia({ prefix: "/inventory" })
  .get("/", async ({ query }) => ({ data: await listInventory(query) }), {
    query: listInventoryQuerySchema,
  })
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createInventoryRow(body) }),
    { body: createInventorySchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateInventoryRow(params.id, body),
    }),
    { params: inventoryIdParamsSchema, body: updateInventorySchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteInventoryRow(params.id);
      return status(204, undefined);
    },
    { params: inventoryIdParamsSchema },
  );
