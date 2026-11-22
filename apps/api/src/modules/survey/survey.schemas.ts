import { surveyStationCreateSchema, surveyStationUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createSurveyStationSchema = surveyStationCreateSchema;
export type CreateSurveyStationInput = z.infer<
  typeof createSurveyStationSchema
>;

export const updateSurveyStationSchema = surveyStationUpdateSchema;
export type UpdateSurveyStationInput = z.infer<
  typeof updateSurveyStationSchema
>;

export const surveyStationIdParamsSchema = z.object({ id: z.uuid() });

// The survey belongs to a well, so the well is required.
export const listSurveyQuerySchema = z.object({ well_id: z.uuid() });
export type ListSurveyQuery = z.infer<typeof listSurveyQuerySchema>;
