import { Elysia } from "elysia";
import {
  createRheologySchema,
  listRheologyQuerySchema,
  rheologyIdParamsSchema,
  updateRheologySchema,
} from "./rheology.schemas";
import {
  createRheologyReading,
  deleteRheologyReading,
  listRheologyReadings,
  updateRheologyReading,
} from "./rheology.service";

// Routes only parse input and call the service. Rules live in the service.
// The samples are the sheet of one daily report: `GET` needs `report_id` and returns every
// sample (at most 3), so it has no paging.
export const rheologyRoutes = new Elysia({ prefix: "/rheology" })
  .get(
    "/",
    async ({ query }) => ({ data: await listRheologyReadings(query) }),
    {
      query: listRheologyQuerySchema,
    },
  )
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createRheologyReading(body) }),
    { body: createRheologySchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateRheologyReading(params.id, body),
    }),
    { params: rheologyIdParamsSchema, body: updateRheologySchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteRheologyReading(params.id);
      return status(204, undefined);
    },
    { params: rheologyIdParamsSchema },
  );
