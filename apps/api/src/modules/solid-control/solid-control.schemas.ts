import { sceCreateSchema, sceUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createSceSchema = sceCreateSchema;
export type CreateSceInput = z.infer<typeof createSceSchema>;

export const updateSceSchema = sceUpdateSchema;
export type UpdateSceInput = z.infer<typeof updateSceSchema>;

export const sceIdParamsSchema = z.object({ id: z.uuid() });

export const listSceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  // Only the equipment of one project. Without it, every unit is listed.
  project_id: z.uuid().optional(),
});
export type ListSceQuery = z.infer<typeof listSceQuerySchema>;
