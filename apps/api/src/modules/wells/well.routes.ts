import { Elysia } from "elysia";
import {
  createWellSchema,
  listWellsQuerySchema,
  updateWellSchema,
  wellIdParamsSchema,
} from "./well.schemas";
import {
  createWell,
  deleteWell,
  getWell,
  listWells,
  updateWell,
} from "./well.service";

// Routes only parse input and call the service. Rules live in the service.
export const wellRoutes = new Elysia({ prefix: "/wells" })
  .get(
    "/",
    async ({ query }) => {
      const { items, meta } = await listWells(query);
      return { data: items, meta };
    },
    { query: listWellsQuerySchema },
  )
  .post(
    "/",
    async ({ body, status }) => status(201, { data: await createWell(body) }),
    { body: createWellSchema },
  )
  .get("/:id", async ({ params }) => ({ data: await getWell(params.id) }), {
    params: wellIdParamsSchema,
  })
  .patch(
    "/:id",
    async ({ params, body }) => ({ data: await updateWell(params.id, body) }),
    { params: wellIdParamsSchema, body: updateWellSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteWell(params.id);
      return status(204, undefined);
    },
    { params: wellIdParamsSchema },
  );
