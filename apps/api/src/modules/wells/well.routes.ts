import { Elysia } from "elysia";
import {
  createWellSchema,
  listWellsQuerySchema,
  updateWellSchema,
  wellIdParamsSchema,
} from "./well.schemas";
import {
  archiveWell,
  createWell,
  deleteWell,
  getWell,
  listWells,
  restoreWell,
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
  .post(
    "/:id/archive",
    async ({ params }) => ({ data: await archiveWell(params.id) }),
    { params: wellIdParamsSchema },
  )
  .post(
    "/:id/restore",
    async ({ params }) => ({ data: await restoreWell(params.id) }),
    { params: wellIdParamsSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteWell(params.id);
      return status(204, undefined);
    },
    { params: wellIdParamsSchema },
  );
