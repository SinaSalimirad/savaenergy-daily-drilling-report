import { pitReadingCreateSchema, pitReadingUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createPitReadingSchema = pitReadingCreateSchema;
export type CreatePitReadingInput = z.infer<typeof createPitReadingSchema>;

export const updatePitReadingSchema = pitReadingUpdateSchema;
export type UpdatePitReadingInput = z.infer<typeof updatePitReadingSchema>;

export const pitReadingIdParamsSchema = z.object({ id: z.uuid() });

// The readings are the sheet of one daily report, so the report is required.
export const listPitReadingsQuerySchema = z.object({ report_id: z.uuid() });
export type ListPitReadingsQuery = z.infer<typeof listPitReadingsQuerySchema>;
