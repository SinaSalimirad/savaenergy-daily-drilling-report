import { Elysia } from "elysia";
import {
  createPumpSchema,
  listPumpsQuerySchema,
  pumpIdParamsSchema,
  updatePumpSchema,
} from "./pump.schemas";
import {
  createPump,
  deletePump,
  getPump,
  listPumps,
  updatePump,
} from "./pump.service";

// Routes only parse input and call the service. Rules live in the service.
// Pumps have no archive: they are deleted with `DELETE`.
export const pumpRoutes = new Elysia({ prefix: "/pumps" })
  .get(
    "/",
    async ({ query }) => {
      const { items, meta } = await listPumps(query);
      return { data: items, meta };
    },
    { query: listPumpsQuerySchema },
  )
  .post(
    "/",
    async ({ body, status }) => status(201, { data: await createPump(body) }),
    { body: createPumpSchema },
  )
  .get("/:id", async ({ params }) => ({ data: await getPump(params.id) }), {
    params: pumpIdParamsSchema,
  })
  .patch(
    "/:id",
    async ({ params, body }) => ({ data: await updatePump(params.id, body) }),
    { params: pumpIdParamsSchema, body: updatePumpSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deletePump(params.id);
      return status(204, undefined);
    },
    { params: pumpIdParamsSchema },
  );
