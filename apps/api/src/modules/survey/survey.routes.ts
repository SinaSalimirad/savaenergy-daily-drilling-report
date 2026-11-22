import { Elysia } from "elysia";
import {
  createSurveyStationSchema,
  listSurveyQuerySchema,
  surveyStationIdParamsSchema,
  updateSurveyStationSchema,
} from "./survey.schemas";
import {
  createSurveyStation,
  deleteSurveyStation,
  listSurvey,
  updateSurveyStation,
} from "./survey.service";

// Routes only parse input and call the service. Rules live in the service.
// The survey is the sheet of one well: `GET` needs `well_id` and returns every station.
export const surveyRoutes = new Elysia({ prefix: "/survey" })
  .get("/", async ({ query }) => ({ data: await listSurvey(query) }), {
    query: listSurveyQuerySchema,
  })
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createSurveyStation(body) }),
    { body: createSurveyStationSchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateSurveyStation(params.id, body),
    }),
    { params: surveyStationIdParamsSchema, body: updateSurveyStationSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteSurveyStation(params.id);
      return status(204, undefined);
    },
    { params: surveyStationIdParamsSchema },
  );
