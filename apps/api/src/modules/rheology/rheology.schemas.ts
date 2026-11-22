import { rheologyCreateSchema, rheologyUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createRheologySchema = rheologyCreateSchema;
export type CreateRheologyReadingInput = z.infer<typeof createRheologySchema>;

export const updateRheologySchema = rheologyUpdateSchema;
export type UpdateRheologyReadingInput = z.infer<typeof updateRheologySchema>;

export const rheologyIdParamsSchema = z.object({ id: z.uuid() });

// The samples are the sheet of one daily report, so the report is required.
export const listRheologyQuerySchema = z.object({ report_id: z.uuid() });
export type ListRheologyQuery = z.infer<typeof listRheologyQuerySchema>;
