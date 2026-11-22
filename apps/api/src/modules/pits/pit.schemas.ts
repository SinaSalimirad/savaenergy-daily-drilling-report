import { pitCreateSchema, pitUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createPitSchema = pitCreateSchema;
export type CreatePitInput = z.infer<typeof createPitSchema>;

export const updatePitSchema = pitUpdateSchema;
export type UpdatePitInput = z.infer<typeof updatePitSchema>;

export const pitIdParamsSchema = z.object({ id: z.uuid() });

export const listPitsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  // Only the pits of one project. Without it, every pit is listed.
  project_id: z.uuid().optional(),
});
export type ListPitsQuery = z.infer<typeof listPitsQuerySchema>;
