import { pumpCreateSchema, pumpUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createPumpSchema = pumpCreateSchema;
export type CreatePumpInput = z.infer<typeof createPumpSchema>;

export const updatePumpSchema = pumpUpdateSchema;
export type UpdatePumpInput = z.infer<typeof updatePumpSchema>;

export const pumpIdParamsSchema = z.object({ id: z.uuid() });

export const listPumpsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  // Only the pumps of one project. Without it, every pump is listed.
  project_id: z.uuid().optional(),
});
export type ListPumpsQuery = z.infer<typeof listPumpsQuerySchema>;
