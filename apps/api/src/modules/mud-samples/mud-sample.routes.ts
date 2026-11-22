import { Elysia } from "elysia";
import {
  createMudSampleSchema,
  listMudSamplesQuerySchema,
  mudSampleIdParamsSchema,
  updateMudSampleSchema,
} from "./mud-sample.schemas";
import {
  createMudSample,
  deleteMudSample,
  listMudSamples,
  updateMudSample,
} from "./mud-sample.service";

// Routes only parse input and call the service. Rules live in the service.
// The samples are the sheet of one daily report: `GET` needs `report_id` and returns every
// sample (at most 3), so it has no paging.
export const mudSampleRoutes = new Elysia({ prefix: "/mud-samples" })
  .get("/", async ({ query }) => ({ data: await listMudSamples(query) }), {
    query: listMudSamplesQuerySchema,
  })
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createMudSample(body) }),
    { body: createMudSampleSchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateMudSample(params.id, body),
    }),
    { params: mudSampleIdParamsSchema, body: updateMudSampleSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteMudSample(params.id);
      return status(204, undefined);
    },
    { params: mudSampleIdParamsSchema },
  );
