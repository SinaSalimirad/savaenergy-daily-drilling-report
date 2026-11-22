import { bitCreateSchema, bitUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createBitSchema = bitCreateSchema;
export type CreateBitInput = z.infer<typeof createBitSchema>;

export const updateBitSchema = bitUpdateSchema;
export type UpdateBitInput = z.infer<typeof updateBitSchema>;

export const bitIdParamsSchema = z.object({ id: z.uuid() });

// The rows are the sheet of one daily report, so the report is required.
export const listBitsQuerySchema = z.object({ report_id: z.uuid() });
export type ListBitsQuery = z.infer<typeof listBitsQuerySchema>;
