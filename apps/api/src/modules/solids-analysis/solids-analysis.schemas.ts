import { solidsAnalysisCreateSchema, solidsAnalysisUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createSolidsAnalysisSchema = solidsAnalysisCreateSchema;
export type CreateSolidsAnalysisInput = z.infer<
  typeof createSolidsAnalysisSchema
>;

export const updateSolidsAnalysisSchema = solidsAnalysisUpdateSchema;
export type UpdateSolidsAnalysisInput = z.infer<
  typeof updateSolidsAnalysisSchema
>;

export const solidsAnalysisIdParamsSchema = z.object({ id: z.uuid() });

// The samples are the sheet of one daily report, so the report is required.
export const listSolidsAnalysesQuerySchema = z.object({ report_id: z.uuid() });
export type ListSolidsAnalysesQuery = z.infer<
  typeof listSolidsAnalysesQuerySchema
>;
