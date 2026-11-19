import { Elysia } from "elysia";
import {
  createDailyReportSchema,
  dailyReportIdParamsSchema,
  listDailyReportsQuerySchema,
  updateDailyReportSchema,
} from "./daily-report.schemas";
import {
  createDailyReport,
  deleteDailyReport,
  getDailyReport,
  listDailyReports,
  updateDailyReport,
} from "./daily-report.service";

// Routes only parse input and call the service. Rules live in the service.
// Daily reports have no archive: they are deleted with `DELETE`.
export const dailyReportRoutes = new Elysia({ prefix: "/daily-reports" })
  .get(
    "/",
    async ({ query }) => {
      const { items, meta } = await listDailyReports(query);
      return { data: items, meta };
    },
    { query: listDailyReportsQuerySchema },
  )
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createDailyReport(body) }),
    { body: createDailyReportSchema },
  )
  .get(
    "/:id",
    async ({ params }) => ({ data: await getDailyReport(params.id) }),
    { params: dailyReportIdParamsSchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateDailyReport(params.id, body),
    }),
    { params: dailyReportIdParamsSchema, body: updateDailyReportSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteDailyReport(params.id);
      return status(204, undefined);
    },
    { params: dailyReportIdParamsSchema },
  );
