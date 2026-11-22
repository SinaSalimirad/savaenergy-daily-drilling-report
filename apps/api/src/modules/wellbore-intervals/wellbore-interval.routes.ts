import { Elysia } from "elysia";
import {
  createWellboreIntervalSchema,
  listWellboreIntervalsQuerySchema,
  updateWellboreIntervalSchema,
  wellboreIntervalIdParamsSchema,
} from "./wellbore-interval.schemas";
import {
  createWellboreInterval,
  deleteWellboreInterval,
  listWellboreIntervals,
  updateWellboreInterval,
} from "./wellbore-interval.service";

// Routes only parse input and call the service. Rules live in the service.
// The rows are the sheet of one daily report: `GET` needs `report_id` and returns every row,
// so it has no paging.
export const wellboreIntervalRoutes = new Elysia({
  prefix: "/wellbore-intervals",
})
  .get(
    "/",
    async ({ query }) => ({ data: await listWellboreIntervals(query) }),
    {
      query: listWellboreIntervalsQuerySchema,
    },
  )
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createWellboreInterval(body) }),
    { body: createWellboreIntervalSchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateWellboreInterval(params.id, body),
    }),
    {
      params: wellboreIntervalIdParamsSchema,
      body: updateWellboreIntervalSchema,
    },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteWellboreInterval(params.id);
      return status(204, undefined);
    },
    { params: wellboreIntervalIdParamsSchema },
  );
