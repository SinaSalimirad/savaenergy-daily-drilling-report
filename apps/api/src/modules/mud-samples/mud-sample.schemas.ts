import { mudSampleCreateSchema, mudSampleUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createMudSampleSchema = mudSampleCreateSchema;
export type CreateMudSampleInput = z.infer<typeof createMudSampleSchema>;

export const updateMudSampleSchema = mudSampleUpdateSchema;
export type UpdateMudSampleInput = z.infer<typeof updateMudSampleSchema>;

export const mudSampleIdParamsSchema = z.object({ id: z.uuid() });

// The samples are the sheet of one daily report, so the report is required.
export const listMudSamplesQuerySchema = z.object({ report_id: z.uuid() });
export type ListMudSamplesQuery = z.infer<typeof listMudSamplesQuerySchema>;
