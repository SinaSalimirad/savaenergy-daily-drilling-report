import { Elysia } from "elysia";
import {
  createPitReadingSchema,
  listPitReadingsQuerySchema,
  pitReadingIdParamsSchema,
  updatePitReadingSchema,
} from "./pit-reading.schemas";
import {
  createPitReading,
  deletePitReading,
  listPitReadings,
  updatePitReading,
} from "./pit-reading.service";

// Routes only parse input and call the service. Rules live in the service.
// The readings are the sheet of one daily report: `GET` needs `report_id` and returns every
// row, so it has no paging (a report has at most one reading per pit).
export const pitReadingRoutes = new Elysia({ prefix: "/pit-readings" })
  .get("/", async ({ query }) => ({ data: await listPitReadings(query) }), {
    query: listPitReadingsQuerySchema,
  })
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createPitReading(body) }),
    { body: createPitReadingSchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updatePitReading(params.id, body),
    }),
    { params: pitReadingIdParamsSchema, body: updatePitReadingSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deletePitReading(params.id);
      return status(204, undefined);
    },
    { params: pitReadingIdParamsSchema },
  );
