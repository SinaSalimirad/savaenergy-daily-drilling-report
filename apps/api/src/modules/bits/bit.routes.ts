import { Elysia } from "elysia";
import {
  bitIdParamsSchema,
  createBitSchema,
  listBitsQuerySchema,
  updateBitSchema,
} from "./bit.schemas";
import { createBit, deleteBit, listBits, updateBit } from "./bit.service";

// Routes only parse input and call the service. Rules live in the service.
// The rows are the sheet of one daily report: `GET` needs `report_id` and returns every row,
// so it has no paging.
export const bitRoutes = new Elysia({ prefix: "/bits" })
  .get("/", async ({ query }) => ({ data: await listBits(query) }), {
    query: listBitsQuerySchema,
  })
  .post(
    "/",
    async ({ body, status }) => status(201, { data: await createBit(body) }),
    { body: createBitSchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateBit(params.id, body),
    }),
    { params: bitIdParamsSchema, body: updateBitSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteBit(params.id);
      return status(204, undefined);
    },
    { params: bitIdParamsSchema },
  );
