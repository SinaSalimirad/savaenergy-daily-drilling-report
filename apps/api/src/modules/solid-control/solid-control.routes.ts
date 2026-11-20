import { Elysia } from "elysia";
import {
  createSceSchema,
  listSceQuerySchema,
  sceIdParamsSchema,
  updateSceSchema,
} from "./solid-control.schemas";
import {
  createSce,
  deleteSce,
  getSce,
  listSce,
  updateSce,
} from "./solid-control.service";

// Routes only parse input and call the service. Rules live in the service.
// Nothing references a unit yet, so it is deleted with `DELETE`.
export const solidControlRoutes = new Elysia({ prefix: "/solid-control" })
  .get(
    "/",
    async ({ query }) => {
      const { items, meta } = await listSce(query);
      return { data: items, meta };
    },
    { query: listSceQuerySchema },
  )
  .post(
    "/",
    async ({ body, status }) => status(201, { data: await createSce(body) }),
    { body: createSceSchema },
  )
  .get("/:id", async ({ params }) => ({ data: await getSce(params.id) }), {
    params: sceIdParamsSchema,
  })
  .patch(
    "/:id",
    async ({ params, body }) => ({ data: await updateSce(params.id, body) }),
    { params: sceIdParamsSchema, body: updateSceSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteSce(params.id);
      return status(204, undefined);
    },
    { params: sceIdParamsSchema },
  );
