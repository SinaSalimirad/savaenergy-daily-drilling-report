import { Elysia } from "elysia";
import {
  createSolidsAnalysisSchema,
  listSolidsAnalysesQuerySchema,
  solidsAnalysisIdParamsSchema,
  updateSolidsAnalysisSchema,
} from "./solids-analysis.schemas";
import {
  createSolidsAnalysis,
  deleteSolidsAnalysis,
  listSolidsAnalyses,
  updateSolidsAnalysis,
} from "./solids-analysis.service";

// Routes only parse input and call the service. Rules live in the service.
// The samples are the sheet of one daily report: `GET` needs `report_id` and returns every
// sample (at most 3), so it has no paging.
export const solidsAnalysisRoutes = new Elysia({ prefix: "/solids-analysis" })
  .get("/", async ({ query }) => ({ data: await listSolidsAnalyses(query) }), {
    query: listSolidsAnalysesQuerySchema,
  })
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createSolidsAnalysis(body) }),
    { body: createSolidsAnalysisSchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateSolidsAnalysis(params.id, body),
    }),
    { params: solidsAnalysisIdParamsSchema, body: updateSolidsAnalysisSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteSolidsAnalysis(params.id);
      return status(204, undefined);
    },
    { params: solidsAnalysisIdParamsSchema },
  );
