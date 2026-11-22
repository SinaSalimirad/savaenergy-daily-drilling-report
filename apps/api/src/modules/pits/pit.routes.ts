import { Elysia } from "elysia";
import {
  createPitSchema,
  listPitsQuerySchema,
  pitIdParamsSchema,
  updatePitSchema,
} from "./pit.schemas";
import {
  createPit,
  deletePit,
  getPit,
  listPits,
  updatePit,
} from "./pit.service";

// Routes only parse input and call the service. Rules live in the service.
// Pits have no archive: they are deleted with `DELETE`.
export const pitRoutes = new Elysia({ prefix: "/pits" })
  .get(
    "/",
    async ({ query }) => {
      const { items, meta } = await listPits(query);
      return { data: items, meta };
    },
    { query: listPitsQuerySchema },
  )
  .post(
    "/",
    async ({ body, status }) => status(201, { data: await createPit(body) }),
    { body: createPitSchema },
  )
  .get("/:id", async ({ params }) => ({ data: await getPit(params.id) }), {
    params: pitIdParamsSchema,
  })
  .patch(
    "/:id",
    async ({ params, body }) => ({ data: await updatePit(params.id, body) }),
    { params: pitIdParamsSchema, body: updatePitSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deletePit(params.id);
      return status(204, undefined);
    },
    { params: pitIdParamsSchema },
  );
