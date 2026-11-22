import { Elysia } from "elysia";
import {
  createDrillStringToolSchema,
  drillStringToolIdParamsSchema,
  listDrillStringToolsQuerySchema,
  updateDrillStringToolSchema,
} from "./drill-string-tool.schemas";
import {
  createDrillStringTool,
  deleteDrillStringTool,
  listDrillStringTools,
  updateDrillStringTool,
} from "./drill-string-tool.service";

// Routes only parse input and call the service. Rules live in the service.
// The rows are the sheet of one daily report: `GET` needs `report_id` and returns every row,
// so it has no paging.
export const drillStringToolRoutes = new Elysia({ prefix: "/drill-string" })
  .get(
    "/",
    async ({ query }) => ({ data: await listDrillStringTools(query) }),
    {
      query: listDrillStringToolsQuerySchema,
    },
  )
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createDrillStringTool(body) }),
    { body: createDrillStringToolSchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateDrillStringTool(params.id, body),
    }),
    {
      params: drillStringToolIdParamsSchema,
      body: updateDrillStringToolSchema,
    },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteDrillStringTool(params.id);
      return status(204, undefined);
    },
    { params: drillStringToolIdParamsSchema },
  );
