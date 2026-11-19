import { wellCreateSchema, wellUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
// `archived_*` are missing on purpose: the server owns them.
export const createWellSchema = wellCreateSchema;
export type CreateWellInput = z.infer<typeof createWellSchema>;

export const updateWellSchema = wellUpdateSchema;
export type UpdateWellInput = z.infer<typeof updateWellSchema>;

export const wellIdParamsSchema = z.object({ id: z.uuid() });

export const listWellsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  // Query strings are text, so `archived=true` arrives as the string "true".
  archived: z.enum(["true", "false"]).default("false"),
});
export type ListWellsQuery = z.infer<typeof listWellsQuerySchema>;
